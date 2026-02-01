// server.js (ESM)
// Works with Node 18+ (App Runner)
// Make sure package.json has:  "type": "module"

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// -------------------------
// Basic security headers
// -------------------------
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://api.anthropic.com; " +
      "base-uri 'self'; " +
      "form-action 'self';"
  );
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// -------------------------
// Body parsing (limit size)
// -------------------------
app.use(express.json({ limit: "50kb" }));

// -------------------------
// CORS (fix for App Runner)
// -------------------------
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

// In App Runner set:
// ALLOWED_ORIGINS=https://aervpu3nvk.us-east-1.awsapprunner.com
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : defaultAllowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin requests may have no Origin header
      // Allow those in production too.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Do not throw; just reject cleanly
      return callback(null, false);
    },
    methods: ["GET", "POST"],
    credentials: false,
    maxAge: 86400,
  })
);

// CORS error handler (always JSON)
app.use((err, req, res, next) => {
  if (err && String(err.message || "").toLowerCase().includes("cors")) {
    return res.status(403).json({ error: "CORS blocked this request." });
  }
  next(err);
});

// -------------------------
// Rate limiting for /api
// -------------------------
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests/min per IP
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
});
app.use("/api", limiter);

// -------------------------
// Health check
// -------------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// -------------------------
// Input validation helpers
// -------------------------
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function sanitizeForPrompt(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function validateIngredients(ingredients) {
  if (!isNonEmptyString(ingredients)) {
    return { valid: false, error: "Ingredients are required." };
  }
  if (ingredients.length > 2000) {
    return {
      valid: false,
      error: "Ingredients list is too long. Please limit to 2000 characters.",
    };
  }
  return { valid: true, value: sanitizeForPrompt(ingredients) };
}

function validateCookingTime(time) {
  const num = Number(time);
  if (!Number.isFinite(num) || num < 10 || num > 120) {
    return {
      valid: false,
      error: "Cooking time must be between 10 and 120 minutes.",
    };
  }
  return { valid: true, value: Math.round(num) };
}

function validateDietary(dietary) {
  const ALLOWED_DIETARY = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Keto",
    "Low-Carb",
  ];
  if (!Array.isArray(dietary)) return { valid: true, value: [] };
  const valid = dietary
    .filter((item) => typeof item === "string" && ALLOWED_DIETARY.includes(item))
    .slice(0, 6);
  return { valid: true, value: valid };
}

// -------------------------
// API: Generate recipes
// -------------------------
app.post("/api/recipes", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { ingredients, cookingTime, dietary } = body;

    const ingredientsValidation = validateIngredients(ingredients);
    if (!ingredientsValidation.valid) {
      return res.status(400).json({ error: ingredientsValidation.error });
    }
    const sanitizedIngredients = ingredientsValidation.value;

    const timeValidation = validateCookingTime(cookingTime);
    if (!timeValidation.valid) {
      return res.status(400).json({ error: timeValidation.error });
    }
    const validTime = timeValidation.value;

    const dietaryValidation = validateDietary(dietary);
    const validDietary = dietaryValidation.value;

    const dietaryText =
      validDietary.length > 0
        ? `Dietary requirements: ${validDietary.join(", ")}. `
        : "";

    const prompt = `You are a professional chef. Generate 3 different recipe suggestions based on:

Available ingredients: ${sanitizedIngredients}
Max cooking time: ${validTime} minutes
${dietaryText}

For each recipe provide:
1. Recipe name
2. Difficulty (Easy/Medium/Hard)
3. Prep time (minutes)
4. Cook time (minutes)
5. Cuisine type (e.g., Italian, Mexican, Asian, American, Mediterranean, etc.)
6. Ingredient list with measurements
7. Short step-by-step instructions (4-6 steps max)

Respond ONLY with a JSON array like this:
[
  {
    "name": "Recipe Name",
    "difficulty": "Easy",
    "prepTime": 10,
    "cookTime": 20,
    "cuisine": "Italian",
    "ingredients": ["1 cup rice", "2 chicken breasts"],
    "instructions": ["Step 1", "Step 2", "Step 3"]
  }
]`;

    // Read API key (must be set in App Runner env vars)
    // ASSIGNMENT MODE: Return mock recipes if API key is not present
if (!process.env.ANTHROPIC_API_KEY) {
  return res.json({
    recipes: [
      {
        name: "Vegetarian Rice Bowl",
        difficulty: "Easy",
        prepTime: 10,
        cookTime: 20,
        cuisine: "Asian",
        ingredients: [
          "1 cup rice",
          "1 cup mixed vegetables",
          "1 tbsp soy sauce",
          "1 tsp olive oil"
        ],
        instructions: [
          "Cook rice according to package instructions.",
          "Heat oil in a pan and sauté vegetables.",
          "Add soy sauce and mix well.",
          "Serve vegetables over rice."
        ]
      },
      {
        name: "Simple Veg Fried Rice",
        difficulty: "Easy",
        prepTime: 15,
        cookTime: 15,
        cuisine: "Asian",
        ingredients: [
          "2 cups cooked rice",
          "1/2 cup carrots",
          "1/2 cup peas",
          "1 tbsp soy sauce"
        ],
        instructions: [
          "Heat pan and add vegetables.",
          "Add cooked rice and stir.",
          "Add soy sauce and mix evenly.",
          "Serve hot."
        ]
      }
    ]
  });
}


    // Timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    let response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "false",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      if (fetchError?.name === "AbortError") {
        return res.status(504).json({ error: "Request took too long. Please try again." });
      }
      return res
        .status(502)
        .json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      // Optional dev logging only
      if (process.env.NODE_ENV !== "production") {
        try {
          const errText = await response.text();
          console.error("Anthropic API error:", response.status, errText.slice(0, 200));
        } catch {
          console.error("Anthropic API error:", response.status);
        }
      }
      return res
        .status(502)
        .json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return res
        .status(502)
        .json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    const text = data?.content?.[0]?.text || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      return res
        .status(502)
        .json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return res
        .status(502)
        .json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    return res.json({ recipes: parsed });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Server error:", err);
    }
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

// -------------------------
// Serve React build (dist)
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// If you use Vite: build output is dist/
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// SPA fallback (React router)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// -------------------------
// Start server (App Runner)
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`InsightChef server running on http://localhost:${PORT}`);
  }
});
