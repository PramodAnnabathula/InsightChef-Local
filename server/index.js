/**
 * Backend API proxy for recipe generation.
 * Keeps Anthropic API key server-side only. Validates/sanitizes input,
 * rate-limits, and returns generic errors to clients.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import {
  sanitizeIngredients,
  sanitizeCookingTime,
  sanitizeDietary,
} from '../src/utils/inputValidation.js';
import { normalizeRecipes } from '../src/utils/recipeHelpers.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_VERSION = '2023-06-01';
const API_TIMEOUT_MS = 90_000;

/** Generic message returned for any server error. No technical details. */
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again later.';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50kb' }));
app.use('/api', limiter);

function logServerError(label, err) {
  const msg = err?.message ?? String(err);
  const stack = err?.stack;
  console.error(`[${label}]`, msg);
  if (stack && process.env.NODE_ENV !== 'production') {
    console.error(stack);
  }
}

app.post('/api/recipes', async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY || typeof ANTHROPIC_API_KEY !== 'string') {
      res.status(503).json({ error: GENERIC_ERROR_MESSAGE });
      return;
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { value: ingredients, error: ingredientsError } = sanitizeIngredients(body.ingredients ?? '');
    if (ingredientsError || !ingredients) {
      res.status(400).json({ error: 'Please provide at least one ingredient.' });
      return;
    }

    const { value: cookingTime } = sanitizeCookingTime(body.cookingTime ?? 30);
    const dietary = sanitizeDietary(body.dietary ?? []);

    const dietaryText = dietary.length > 0
      ? `Dietary requirements: ${dietary.join(', ')}. `
      : '';

    const prompt = `You are a professional chef. Generate 3 different recipe suggestions based on:

Available ingredients: ${ingredients}
Max cooking time: ${cookingTime} minutes
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logServerError('Anthropic API error', new Error(`HTTP ${response.status}`));
      res.status(502).json({ error: GENERIC_ERROR_MESSAGE });
      return;
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      logServerError('Anthropic response parse', e);
      res.status(502).json({ error: GENERIC_ERROR_MESSAGE });
      return;
    }

    const text = data?.content?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) {
      res.status(502).json({ error: GENERIC_ERROR_MESSAGE });
      return;
    }

    const jsonMatch = text.trim().match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      res.status(502).json({ error: GENERIC_ERROR_MESSAGE });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      logServerError('Recipe JSON parse', e);
      res.status(502).json({ error: GENERIC_ERROR_MESSAGE });
      return;
    }

    const recipes = normalizeRecipes(parsed);
    res.status(200).json({ recipes });
  } catch (err) {
    if (err?.name === 'AbortError') {
      res.status(504).json({ error: 'Request took too long. Please try again.' });
      return;
    }
    logServerError('Generate', err);
    res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`InsightChef API listening on http://localhost:${PORT}`);
});
