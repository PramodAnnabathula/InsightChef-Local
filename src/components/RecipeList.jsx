import { useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import RecipeCard from './RecipeCard';
import RecipeSourceNotice from './RecipeSourceNotice';
import { normalizeRecipe } from '../utils/recipeHelpers';

export default function RecipeList({ recipes, onRegenerate, loading, isMockMode }) {
  // Safely handle recipes prop with defaults
  const list = Array.isArray(recipes) ? recipes : [];
  
  // Safely normalize recipes, filtering out any that fail normalization
  const normalized = list
    .map((r) => {
      try {
        return normalizeRecipe(r);
      } catch (err) {
        // If normalization fails, skip this recipe
        console.error('Error normalizing recipe:', err);
        return null;
      }
    })
    .filter((r) => r !== null && r !== undefined);

  const handleRegenerate = useCallback(() => {
    try {
      if (typeof onRegenerate === 'function') {
        onRegenerate();
      }
    } catch (err) {
      // Prevent crashes from regenerate callback errors
      console.error('Error in regenerate handler:', err);
    }
  }, [onRegenerate]);

  if (normalized.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <div className="flex flex-col gap-2 sm:gap-3">
          <h2 id="recipes-heading" className="text-2xl sm:text-3xl font-black text-gray-800">Your Recipes ✨</h2>
          <RecipeSourceNotice isMockMode={isMockMode} />
        </div>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={loading}
          aria-label="Generate new recipe ideas"
          aria-busy={loading}
          className="flex items-center gap-2 bg-white text-orange-600 hover:text-orange-700 font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-orange-600 hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 self-start sm:self-center"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
          <span>New Ideas</span>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list" aria-labelledby="recipes-heading">
        {normalized.map((recipe, index) => {
          // Safely generate key and render card
          try {
            const recipeKey = (recipe && recipe.name) 
              ? `${String(recipe.name)}-${index}` 
              : `recipe-${index}`;
            return <RecipeCard key={recipeKey} recipe={recipe} index={index} />;
          } catch (err) {
            // Skip rendering if there's an error
            console.error('Error rendering recipe card:', err);
            return null;
          }
        })}
      </div>
    </div>
  );
}
