/**
 * Input validation and sanitization for security.
 * Use for all user-controlled input before sending to API or rendering.
 */

/** @type {readonly string[]} */
export const DIETARY_ALLOWLIST = Object.freeze([
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Low-Carb',
]);

export const INGREDIENTS_MAX_LENGTH = 2000;
const INGREDIENTS_MIN_LENGTH = 1;

/** Control chars and other characters we strip from user text */
// eslint-disable-next-line no-control-regex -- intentional; used to strip unsafe input
const CONTROL_AND_UNSAFE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;

/**
 * Strip control characters and normalize whitespace.
 * @param {unknown} s
 * @returns {string}
 */
function stripControlChars(s) {
  try {
    if (typeof s !== 'string') {
      return '';
    }
    return s.replace(CONTROL_AND_UNSAFE, '').trim();
  } catch (err) {
    // If stripping fails, return empty string
    console.error('Error stripping control characters:', err);
    return '';
  }
}

/**
 * Sanitize ingredients input: trim, strip control chars, enforce max length.
 * Truncation is applied silently; error only when empty.
 * @param {unknown} raw
 * @returns {{ value: string; error?: string }}
 */
export function sanitizeIngredients(raw) {
  try {
    // Handle null, undefined, or non-string inputs
    const inputStr = (typeof raw === 'string') ? raw : String(raw || '');
    const s = stripControlChars(inputStr);
    
    if (s.length < INGREDIENTS_MIN_LENGTH) {
      return { value: '', error: 'Please enter at least one ingredient.' };
    }
    if (s.length > INGREDIENTS_MAX_LENGTH) {
      return { value: s.slice(0, INGREDIENTS_MAX_LENGTH) };
    }
    return { value: s };
  } catch (err) {
    // If sanitization fails, return empty with error
    console.error('Error sanitizing ingredients:', err);
    return { value: '', error: 'Please enter at least one ingredient.' };
  }
}

/**
 * Validate and sanitize cooking time. Must be 10–120, step 5.
 * @param {unknown} raw
 * @returns {{ value: number; error?: string }}
 */
export function sanitizeCookingTime(raw) {
  try {
    // Handle null, undefined, or invalid inputs
    const inputStr = String(raw || '30');
    const n = parseInt(inputStr, 10);
    
    if (!Number.isFinite(n) || isNaN(n)) {
      return { value: 30 };
    }
    
    const clamped = Math.max(10, Math.min(120, Math.round(n / 5) * 5));
    return { value: clamped };
  } catch (err) {
    // If validation fails, return safe default
    console.error('Error sanitizing cooking time:', err);
    return { value: 30 };
  }
}

/**
 * Validate dietary options against allowlist. Returns only allowed values.
 * @param {unknown} raw
 * @returns {string[]}
 */
export function sanitizeDietary(raw) {
  try {
    if (!Array.isArray(raw)) {
      return [];
    }
    
    const allowlist = new Set(DIETARY_ALLOWLIST);
    return raw
      .filter((item) => typeof item === 'string' && allowlist.has(item))
      .slice(0, 20);
  } catch (err) {
    // If validation fails, return empty array
    console.error('Error sanitizing dietary options:', err);
    return [];
  }
}

/**
 * Sanitize a string for safe display (e.g. recipe name, cuisine).
 * Strips control chars, truncates to maxLength.
 * @param {unknown} raw
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeDisplayString(raw, maxLength = 500) {
  const s = stripControlChars(typeof raw === 'string' ? raw : '');
  if (s.length <= maxLength) return s;
  return s.slice(0, maxLength);
}
