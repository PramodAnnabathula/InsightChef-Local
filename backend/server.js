// backend/server.js (ESM) — AWS App Runner compatible
// Requires package.json: "type": "module"

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

/* -------------------------
   Security headers (basic)
------------------------- */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.anthropic.com",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
  );
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

/* -------------------------
   JSON body limit
------------------------- */
app.use(express.json({ limit: "50kb" }));

/* -------------------------
   CORS (allow localhost + your App Runner domain)
   This avoids browser blocking.
------------------------- */
const APP_RUNNER_ORIGIN = "https://aervpu3nvk.us-east-1.awsapprunner.com";
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:3000",
  APP_RUNNER_ORIGIN
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // same-origin or server-to-server calls can have no origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ["GET", "POST"],
    credentials: false,
    maxAge: 86400
  })
);

/* -------------------------
   Rate limit API
------------------------- */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health"
});
app.use("/api", limiter);

/* -------------------------
   Health endpoint
------------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* -------------------------
   Validation helpers
------------------------- */
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
    return { valid: false, error: "Ingredients list is too long (max 2000 chars)." };
  }
  return { valid: true, value: sanitizeForPrompt(ingredients) };
}

function validateCookingTime(time) {
  const num = Number(time);
  if (!Number.isFinite(num) || num < 10 || num > 120) {
    return { valid: false, error: "Cooking time must be between 10 and 120 minutes." };
  }
  return { valid: true, value: Math.round(num) };
}

function validateDietary(dietary) {
  const ALLOWED = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb"];
  if (!Array.isArray(dietary)) return { valid: true, value: [] };
  return { valid: true, value: dietary.filter((x) => ALLOWED.includes(x)).slice(0, 6) };
}

/* -------------------------
   API: recipes
   Assignment-safe: returns mock recipes if no ANTHROPIC_API_KEY
------------------------- */
app.post("/api/recipes", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { ingredients, cookingTime, dietary } = body;

    const ingV = validateIngredients(ingredients);
    if (!ingV.valid) return res.status(400).json({ error: ingV.error });

    const timeV = validateCookingTime(cookingTime);
    if (!timeV.valid) return res.status(400).json({ error: timeV.error });

    validateDietary(dietary); // not required for mock, but validates input shape

    // ✅ Mock recipes (NO billing required)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.json({
        recipes: [
          {
            name: "Vegetarian Rice Bowl",
            difficulty: "Easy",
            prepTime: 10,
            cookTime: 20,
            cuisine: "Asian",
            ingredients: ["1 cup rice", "1 cup mixed vegetables", "1 tbsp soy sauce", "1 tsp olive oil"],
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
            ingredients: ["2 cups cooked rice", "1/2 cup carrots", "1/2 cup peas", "1 tbsp soy sauce"],
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

    // If you ever add billing later, you can implement the Anthropic call here.
    return res.status(501).json({
      error: "Anthropic mode not enabled for assignment. Remove this if you later add billing."
    });
  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

/* -------------------------
   Serve React build (dist)
   dist is at project root: ../dist
------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// Must be AFTER API routes
// SPA fallback – Express 5 compatible
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});


/* -------------------------
   Start server (App Runner uses PORT env)
------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});
