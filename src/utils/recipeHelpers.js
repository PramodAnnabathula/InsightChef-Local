/**
 * Safe defaults for recipe fields. Use whenever displaying or processing
 * recipe data from the API to prevent crashes from missing/malformed fields.
 * All string output is sanitized for safe display (control chars removed, length capped).
 */

import { sanitizeDisplayString } from './inputValidation';

const DEFAULT_RECIPE = {
  name: 'Untitled Recipe',
  difficulty: 'Medium',
  prepTime: 10,
  cookTime: 20,
  cuisine: '',
  ingredients: [],
  instructions: [],
};

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const MAX_ITEM_LENGTH = 1000;

/**
 * Normalize a single recipe object. Handles null, undefined, and missing fields.
 * Sanitizes all string fields for safe display.
 * @param {unknown} r - Raw recipe from API
 * @returns {object} Recipe with safe defaults
 */
export function normalizeRecipe(r) {
  if (r == null || typeof r !== 'object') {
    return { ...DEFAULT_RECIPE };
  }

  const raw = /** @type {Record<string, unknown>} */ (r);

  const name = typeof raw.name === 'string' && raw.name.trim()
    ? sanitizeDisplayString(raw.name.trim(), 200)
    : DEFAULT_RECIPE.name;

  const difficulty = typeof raw.difficulty === 'string' &&
    VALID_DIFFICULTIES.includes(raw.difficulty)
    ? raw.difficulty
    : DEFAULT_RECIPE.difficulty;

  const prepTime = typeof raw.prepTime === 'number' && Number.isFinite(raw.prepTime) && raw.prepTime >= 0
    ? Math.round(raw.prepTime)
    : DEFAULT_RECIPE.prepTime;
  const cookTime = typeof raw.cookTime === 'number' && Number.isFinite(raw.cookTime) && raw.cookTime >= 0
    ? Math.round(raw.cookTime)
    : DEFAULT_RECIPE.cookTime;

  const cuisine = typeof raw.cuisine === 'string' && raw.cuisine.trim()
    ? sanitizeDisplayString(raw.cuisine.trim(), 100)
    : DEFAULT_RECIPE.cuisine;

  const ingredients = Array.isArray(raw.ingredients)
    ? raw.ingredients
        .filter((item) => typeof item === 'string' && String(item).trim())
        .map((item) => sanitizeDisplayString(String(item).trim(), MAX_ITEM_LENGTH))
    : [];

  const instructions = Array.isArray(raw.instructions)
    ? raw.instructions
        .filter((item) => typeof item === 'string' && String(item).trim())
        .map((item) => sanitizeDisplayString(String(item).trim(), MAX_ITEM_LENGTH))
    : [];

  return {
    name: name || DEFAULT_RECIPE.name,
    difficulty,
    prepTime,
    cookTime,
    cuisine,
    ingredients,
    instructions,
  };
}

/**
 * Normalize an array of recipes. Filters out null/undefined, then normalizes each.
 * @param {unknown} arr - Raw array from API
 * @returns {object[]}
 */
export function normalizeRecipes(arr) {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr
    .filter((item) => item != null)
    .map((r) => normalizeRecipe(r));
}
