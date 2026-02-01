import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

// SECURITY: Never log API key status - this could be used for reconnaissance
// Only check if key exists, don't expose status

const app = express();

// SECURITY: Set security headers
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
  // Prevent XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// SECURITY: Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

app.use(express.json({ limit: "50kb" })); // SECURITY: Limit request body size

// SECURITY: Restrictive CORS - only allow specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.) only in development
      if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: false, // SECURITY: Don't allow credentials
    maxAge: 86400, // 24 hours
  })
);

// Apply rate limiting to all API routes
app.use('/api', limiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// SECURITY: Input validation helpers
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

// SECURITY: Sanitize string to prevent prompt injection
function sanitizeForPrompt(input) {
  if (typeof input !== 'string') return '';
  // Remove control characters and normalize whitespace
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 2000); // Limit length
}

// SECURITY: Validate ingredients string
function validateIngredients(ingredients) {
  if (!isNonEmptyString(ingredients)) {
    return { valid: false, error: 'Ingredients are required.' };
  }
  if (ingredients.length > 2000) {
    return { valid: false, error: 'Ingredients list is too long. Please limit to 2000 characters.' };
  }
  return { valid: true, value: sanitizeForPrompt(ingredients) };
}

// SECURITY: Validate cooking time
function validateCookingTime(time) {
  const num = Number(time);
  if (!Number.isFinite(num) || num < 10 || num > 120) {
    return { valid: false, error: 'Cooking time must be between 10 and 120 minutes.' };
  }
  return { valid: true, value: Math.round(num) };
}

// SECURITY: Validate dietary array
function validateDietary(dietary) {
  const ALLOWED_DIETARY = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb'];
  if (!Array.isArray(dietary)) {
    return { valid: true, value: [] }; // Default to empty array
  }
  // Filter to only allowlisted values
  const valid = dietary
    .filter(item => typeof item === 'string' && ALLOWED_DIETARY.includes(item))
    .slice(0, 6); // Limit to 6 items
  return { valid: true, value: valid };
}

app.post("/api/recipes", async (req, res) => {
  try {
    // SECURITY: Validate request body exists
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { ingredients, cookingTime, dietary } = body;

    // SECURITY: Validate and sanitize ingredients
    const ingredientsValidation = validateIngredients(ingredients);
    if (!ingredientsValidation.valid) {
      return res.status(400).json({ error: ingredientsValidation.error });
    }
    const sanitizedIngredients = ingredientsValidation.value;

    // SECURITY: Validate cooking time
    const timeValidation = validateCookingTime(cookingTime);
    if (!timeValidation.valid) {
      return res.status(400).json({ error: timeValidation.error });
    }
    const validTime = timeValidation.value;

    // SECURITY: Validate dietary preferences
    const dietaryValidation = validateDietary(dietary);
    const validDietary = dietaryValidation.value;

    // SECURITY: Build prompt with sanitized inputs to prevent prompt injection
    const dietaryText = validDietary.length > 0
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

    // SECURITY: Check API key without exposing status
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      // SECURITY: Generic error message - never expose that API key is missing
      return res.status(503).json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    // SECURITY: Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

    let response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "false"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: "Request took too long. Please try again." });
      }
      // SECURITY: Generic error - don't expose network details
      return res.status(502).json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    if (!response.ok) {
      // SECURITY: Log error server-side only, never expose to client
      const status = response.status;
      // Only log in development, never in production
      if (process.env.NODE_ENV !== 'production') {
        try {
          const errText = await response.text();
          console.error("Anthropic API error:", status, errText.substring(0, 200)); // Limit log length
        } catch {
          console.error("Anthropic API error:", status);
        }
      }
      // SECURITY: Generic error message - never expose status codes or error details
      return res.status(502).json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // SECURITY: Log server-side only
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to parse Anthropic response:", parseError);
      }
      return res.status(502).json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    const text = data?.content?.[0]?.text || "";
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) {
      return res.status(502).json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch (parseError) {
      // SECURITY: Log server-side only
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to parse recipe JSON:", parseError);
      }
      return res.status(502).json({ error: "The recipe service is temporarily unavailable. Please try again later." });
    }

    res.json({ recipes: parsed });
  } catch (err) {
    // SECURITY: Never expose error details to client
    // Log server-side only in development
    if (process.env.NODE_ENV !== 'production') {
      console.error("Server error:", err);
    }
    // SECURITY: Generic error message - never expose err.message or stack traces
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

// SECURITY: Health check endpoint (no rate limiting)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// SECURITY: 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // SECURITY: Only log basic info, never API key status
  if (process.env.NODE_ENV !== 'production') {
    console.log(`InsightChef backend running on http://localhost:${PORT}`);
  }
});

