import { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';
import InputForm from './components/InputForm';
import RecipeList from './components/RecipeList';
import EmptyState from './components/EmptyState';
import MockModeNotice from './components/MockModeNotice';
import { normalizeRecipes } from './utils/recipeHelpers';
import { MOCK_RECIPES, MOCK_DELAY_MS } from './utils/mockRecipes';

const ERROR_DISMISS_MS = 8000;
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout for slow servers

const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

/**
 * User-facing error messages only. Never use response body or err.message.
 * Maps HTTP status to generic, non-technical messages.
 */
function getUserMessage(status) {
  if (status === 400) return 'Invalid request. Please check your input and try again.';
  if (status === 401) return 'Authentication failed. Please try again.';
  if (status === 403) return 'Access denied. Please try again.';
  if (status === 404) return 'Service not found. Please try again later.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status === 500) return 'The recipe service encountered an error. Please try again later.';
  if (status === 502 || status === 503) return 'The recipe service is temporarily unavailable. Please try again later.';
  if (status === 504) return 'Request took too long. The server may be slow. Please try again.';
  return 'The recipe service is temporarily unavailable. Please try again later.';
}

/**
 * Detects if an error is a network error (no connection, CORS, etc.)
 * @param {Error} err - The error object
 * @returns {boolean}
 */
function isNetworkError(err) {
  if (!err) return false;
  const errMessage = String(err.message || '').toLowerCase();
  const errName = String(err.name || '').toLowerCase();
  
  // Network errors typically have these characteristics
  if (errName === 'typeerror' && errMessage.includes('fetch')) return true;
  if (errMessage.includes('network') || errMessage.includes('failed to fetch')) return true;
  if (errMessage.includes('networkerror')) return true;
  if (errMessage.includes('network request failed')) return true;
  if (errMessage.includes('load failed')) return true;
  if (errMessage.includes('cors')) return true;
  if (errMessage.includes('connection')) return true;
  if (errMessage.includes('internet')) return true;
  if (errMessage.includes('offline')) return true;
  
  return false;
}

/**
 * Creates a fetch request with timeout
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    throw err;
  }
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    ingredients: '',
    cookingTime: '30',
    dietary: []
  });
  const errorDismissRef = useRef(null);
  const isGeneratingRef = useRef(false); // Prevent multiple simultaneous requests

  const clearErrorAfter = useCallback((ms = ERROR_DISMISS_MS) => {
    if (errorDismissRef.current) {
      clearTimeout(errorDismissRef.current);
      errorDismissRef.current = null;
    }
    errorDismissRef.current = setTimeout(() => {
      setError('');
      errorDismissRef.current = null;
    }, ms);
  }, []);

  useEffect(() => {
    return () => {
      if (errorDismissRef.current) clearTimeout(errorDismissRef.current);
    };
  }, []);

  const generateRecipes = useCallback(async (ingredients, cookingTime, dietary) => {
    // Prevent multiple simultaneous requests
    if (isGeneratingRef.current) {
      return;
    }

    try {
      isGeneratingRef.current = true;
      setLoading(true);
      setError('');
      setRecipes([]);

      // Validate and sanitize inputs with safe defaults
      const ingredientsStr = typeof ingredients === 'string' ? ingredients.trim() : '';
      const timeStr = typeof cookingTime === 'string' ? String(cookingTime).trim() : '30';
      const dietaryArr = Array.isArray(dietary) ? dietary : [];

      // Additional validation before proceeding
      if (!ingredientsStr || ingredientsStr.length === 0) {
        setError('Please enter at least one ingredient to get started.');
        clearErrorAfter();
        return;
      }

      setFormData({ 
        ingredients: ingredientsStr, 
        cookingTime: timeStr, 
        dietary: dietaryArr 
      });

      if (isMockMode) {
        // Simulate delay even in mock mode
        await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
        setRecipes([...MOCK_RECIPES]);
        return;
      }

      let res;
      let status = null;
      
      try {
        // Use fetchWithTimeout to handle slow servers
        res = await fetchWithTimeout('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: ingredientsStr,
            cookingTime: timeStr,
            dietary: dietaryArr,
          }),
        }, REQUEST_TIMEOUT_MS);
        status = res.status;
      } catch (fetchError) {
        // Handle timeout specifically
        if (fetchError.name === 'TimeoutError' || fetchError.message === 'Request timeout') {
          setError('Request took too long. The server may be slow or unavailable. Please try again.');
          clearErrorAfter();
          return;
        }
        
        // Network error (no connection, CORS, etc.)
        if (isNetworkError(fetchError)) {
          setError('Unable to connect to the service. Please check your internet connection and try again.');
        } else {
          setError('Unable to reach the service. Please check your connection and try again.');
        }
        clearErrorAfter();
        return;
      }

      if (!res || !res.ok) {
        const errorStatus = status || 500;
        setError(getUserMessage(errorStatus));
        clearErrorAfter();
        return;
      }

      let data;
      try {
        const responseText = await res.text();
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response');
        }
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Invalid JSON response - treat as server error
        setError('The recipe service returned an invalid response. Please try again later.');
        clearErrorAfter();
        return;
      }

      // Safely extract recipes array with null checks
      const list = (data && typeof data === 'object' && Array.isArray(data.recipes)) 
        ? data.recipes 
        : [];
      
      const normalized = normalizeRecipes(list);
      setRecipes(normalized);

      if (normalized.length === 0) {
        setError('No recipes could be generated. Please try different ingredients or try again.');
        clearErrorAfter();
      }
    } catch (err) {
      // Catch any unexpected errors to prevent crashes
      if (err.name === 'TimeoutError' || err.message === 'Request timeout') {
        setError('Request took too long. The server may be slow or unavailable. Please try again.');
      } else if (isNetworkError(err)) {
        setError('Unable to connect to the service. Please check your internet connection and try again.');
      } else {
        // Generic error - never expose technical details
        setError('Something went wrong. Please try again.');
      }
      clearErrorAfter();
    } finally {
      // Always reset loading state, even if there was an error
      // Use setTimeout to ensure state updates happen even if component unmounts
      setTimeout(() => {
        setLoading(false);
        isGeneratingRef.current = false;
      }, 0);
    }
  }, [clearErrorAfter]);

  const handleRegenerate = useCallback(() => {
    // Prevent regeneration if already loading
    if (loading || isGeneratingRef.current) {
      return;
    }

    // Safe access with defaults
    const ingredients = (formData && typeof formData === 'object' && typeof formData.ingredients === 'string')
      ? formData.ingredients.trim()
      : '';
    
    const cookingTime = (formData && typeof formData === 'object' && typeof formData.cookingTime === 'string')
      ? formData.cookingTime
      : '30';
    
    const dietary = (formData && typeof formData === 'object' && Array.isArray(formData.dietary))
      ? formData.dietary
      : [];

    if (!ingredients || ingredients.length === 0) {
      setError('Enter ingredients and generate recipes first. Then you can use New Ideas.');
      clearErrorAfter();
      return;
    }

    generateRecipes(ingredients, cookingTime, dietary);
  }, [formData, generateRecipes, clearErrorAfter, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Header />
        {isMockMode && (
          <div className="mb-6">
            <MockModeNotice />
          </div>
        )}
        <div className="mb-6">
          <Disclaimer />
        </div>
        <InputForm
          onGenerateRecipes={generateRecipes}
          loading={loading}
          apiError={error}
          onClearApiError={() => setError('')}
        />
        <RecipeList
          recipes={recipes}
          onRegenerate={handleRegenerate}
          loading={loading}
          isMockMode={isMockMode}
        />
        {!loading && recipes.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}
