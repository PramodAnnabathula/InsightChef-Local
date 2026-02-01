import { useState, useCallback } from 'react';
import { Clock, Sparkles, Loader2, Plus, Minus } from 'lucide-react';
import {
  sanitizeIngredients,
  sanitizeCookingTime,
  sanitizeDietary,
  DIETARY_ALLOWLIST,
  INGREDIENTS_MAX_LENGTH,
} from '../utils/inputValidation';

const COOKING_TIME_MIN = 10;
const COOKING_TIME_MAX = 120;
const COOKING_TIME_STEP = 5;
const COOKING_TIME_DEFAULT = 30;
const ERROR_DISMISS_MS = 5000;

function clampTime(value) {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return COOKING_TIME_DEFAULT;
  return Math.max(COOKING_TIME_MIN, Math.min(COOKING_TIME_MAX, Math.round(n / COOKING_TIME_STEP) * COOKING_TIME_STEP));
}

export default function InputForm({ onGenerateRecipes, loading, apiError, onClearApiError }) {
  const [ingredients, setIngredients] = useState('');
  const [cookingTime, setCookingTime] = useState(String(COOKING_TIME_DEFAULT));
  const [dietary, setDietary] = useState([]);
  const [error, setError] = useState('');

  const setCookingTimeSafe = useCallback((value) => {
    const clamped = clampTime(value);
    setCookingTime(String(clamped));
  }, []);

  const toggleDietary = useCallback((option) => {
    try {
      // Validate option before processing
      if (typeof option !== 'string' || !DIETARY_ALLOWLIST.includes(option)) {
        return; // Silently ignore invalid options
      }
      
      setDietary((prev) => {
        try {
          const arr = Array.isArray(prev) ? prev : [];
          return arr.includes(option) 
            ? arr.filter((item) => item !== option) 
            : [...arr, option];
        } catch (err) {
          // If state update fails, return previous state
          console.error('Error toggling dietary option:', err);
          return Array.isArray(prev) ? prev : [];
        }
      });
    } catch (err) {
      // Prevent crashes from invalid dietary option toggles
      console.error('Error in toggleDietary:', err);
    }
  }, []);

  const adjustTime = useCallback((delta) => {
    try {
      // Validate delta is a number
      const deltaNum = typeof delta === 'number' && Number.isFinite(delta) ? delta : 0;
      
      // Safely parse current time
      const timeStr = (typeof cookingTime === 'string' || typeof cookingTime === 'number')
        ? String(cookingTime)
        : String(COOKING_TIME_DEFAULT);
      
      const n = parseInt(timeStr, 10);
      const current = Number.isFinite(n) ? n : COOKING_TIME_DEFAULT;
      const next = Math.max(COOKING_TIME_MIN, Math.min(COOKING_TIME_MAX, current + deltaNum));
      setCookingTime(String(next));
    } catch (err) {
      // Prevent crashes from invalid time adjustments
      console.error('Error adjusting time:', err);
      setCookingTime(String(COOKING_TIME_DEFAULT));
    }
  }, [cookingTime]);

  const handleIngredientsChange = useCallback((e) => {
    try {
      const v = (e && e.target && typeof e.target.value === 'string') ? e.target.value : '';
      setIngredients(v);
      if (typeof onClearApiError === 'function') {
        onClearApiError();
      }
    } catch (err) {
      // Prevent crashes from unexpected input events
      console.error('Error handling ingredients change:', err);
      setIngredients('');
    }
  }, [onClearApiError]);

  const handleSliderChange = useCallback((e) => {
    try {
      const v = (e && e.target && e.target.value !== undefined) ? e.target.value : String(COOKING_TIME_DEFAULT);
      setCookingTimeSafe(v);
    } catch (err) {
      // Prevent crashes from unexpected slider events
      console.error('Error handling slider change:', err);
      setCookingTimeSafe(COOKING_TIME_DEFAULT);
    }
  }, [setCookingTimeSafe]);

  const handleGenerate = useCallback(async () => {
    // Prevent submission if already loading
    if (loading) {
      return;
    }

    try {
      // Validate ingredients BEFORE making any API call
      const ingredientsToValidate = (typeof ingredients === 'string') ? ingredients : '';
      const { value: ingredientsVal, error: ingredientsErr } = sanitizeIngredients(ingredientsToValidate);
      
      if (ingredientsErr || !ingredientsVal || ingredientsVal.trim().length === 0) {
        setError(ingredientsErr || 'Please enter at least one ingredient to get started.');
        const timeoutId = window.setTimeout(() => setError(''), ERROR_DISMISS_MS);
        // Store timeout ID for cleanup if needed
        return; // Stop here - do not proceed to API call
      }

      // Clear any previous errors
      setError('');
      if (typeof onClearApiError === 'function') {
        try {
          onClearApiError();
        } catch (err) {
          // Ignore errors from clearing API error
          console.error('Error clearing API error:', err);
        }
      }

      // Sanitize other inputs with safe defaults
      const timeToValidate = (typeof cookingTime === 'string' || typeof cookingTime === 'number') 
        ? String(cookingTime) 
        : '30';
      const { value: time } = sanitizeCookingTime(timeToValidate);
      
      const dietaryToValidate = Array.isArray(dietary) ? dietary : [];
      const diet = sanitizeDietary(dietaryToValidate);

      // Validate that onGenerateRecipes is a function
      if (typeof onGenerateRecipes !== 'function') {
        setError('Unable to generate recipes. Please refresh the page and try again.');
        window.setTimeout(() => setError(''), ERROR_DISMISS_MS);
        return;
      }

      // Call the API - errors are handled in App.jsx
      try {
        await onGenerateRecipes(ingredientsVal, String(time), diet);
      } catch (err) {
        // This catch is a safety net - most errors should be handled in App.jsx
        // But we catch here to prevent crashes if something unexpected happens
        const errorMessage = (err && typeof err === 'object' && err.message)
          ? 'Something went wrong. Please try again.'
          : 'Something went wrong. Please try again.';
        setError(errorMessage);
        window.setTimeout(() => setError(''), ERROR_DISMISS_MS);
      }
    } catch (err) {
      // Catch any unexpected errors during validation or setup
      setError('Something went wrong. Please try again.');
      window.setTimeout(() => setError(''), ERROR_DISMISS_MS);
    }
  }, [ingredients, cookingTime, dietary, onGenerateRecipes, onClearApiError, loading]);

  const displayError = error || apiError;
  const displayMessage = typeof displayError === 'string' && displayError.trim() ? displayError.trim() : null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-5 sm:p-8 mb-8 sm:mb-10 border border-white/50">
      <div className="space-y-5 sm:space-y-6">
        <div role="group" aria-labelledby="ingredients-label">
          <label id="ingredients-label" className="block text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3" htmlFor="ingredients-input">
            What&apos;s in your kitchen? ✨
          </label>
          <textarea
            id="ingredients-input"
            className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 transition-all text-base resize-none"
            rows={3}
            placeholder="e.g., chicken, rice, tomatoes, garlic..."
            value={ingredients}
            onChange={handleIngredientsChange}
            maxLength={INGREDIENTS_MAX_LENGTH}
            aria-invalid={!!displayMessage}
            aria-describedby={displayMessage ? 'form-error ingredients-char-count' : 'ingredients-char-count'}
          />
          <p id="ingredients-char-count" className="mt-1 text-xs text-gray-500" aria-live="polite">
            {ingredients.length} / {INGREDIENTS_MAX_LENGTH} characters
          </p>
        </div>

        <div role="group" aria-labelledby="cooking-time-label">
          <label id="cooking-time-label" className="block text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5" aria-hidden />
            How much time do you have?
          </label>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => adjustTime(-COOKING_TIME_STEP)}
              disabled={loading}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 flex items-center justify-center transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              aria-label="Decrease cooking time by 5 minutes"
            >
              <Minus className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" aria-hidden />
            </button>
            <div className="flex-1 text-center" aria-hidden="true">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {clampTime(cookingTime)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">minutes</div>
            </div>
            <button
              type="button"
              onClick={() => adjustTime(COOKING_TIME_STEP)}
              disabled={loading}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 flex items-center justify-center transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              aria-label="Increase cooking time by 5 minutes"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" aria-hidden />
            </button>
          </div>
          <input
            type="range"
            min={COOKING_TIME_MIN}
            max={COOKING_TIME_MAX}
            step={COOKING_TIME_STEP}
            value={clampTime(cookingTime)}
            onChange={handleSliderChange}
            disabled={loading}
            className="w-full h-2 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full appearance-none cursor-pointer accent-orange-600 mt-4 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:rounded-full"
            aria-label="Cooking time in minutes"
            aria-valuenow={clampTime(cookingTime)}
            aria-valuemin={COOKING_TIME_MIN}
            aria-valuemax={COOKING_TIME_MAX}
            aria-valuetext={`${clampTime(cookingTime)} minutes`}
          />
        </div>

        <div role="group" aria-labelledby="dietary-label">
          <label id="dietary-label" className="block text-sm sm:text-base font-bold text-gray-800 mb-3">
            Dietary preferences 🥗
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_ALLOWLIST.map((option) => {
              const selected = Array.isArray(dietary) && dietary.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  disabled={loading}
                  aria-pressed={selected}
                  aria-label={`${option}, ${selected ? 'selected' : 'not selected'}`}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                    selected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                  }`}
                >
                  {selected && <span className="mr-1" aria-hidden>✓</span>}
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {displayMessage && (
          <div
            id="form-error"
            role="alert"
            className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm sm:text-base font-medium"
          >
            ⚠️ {displayMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? 'Creating recipes, please wait' : 'Generate recipes from your ingredients'}
          className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:via-amber-700 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-black py-4 sm:py-5 px-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3 text-base sm:text-lg active:scale-98 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" aria-hidden />
              <span>Creating magic...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
              <span>Generate Recipes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
