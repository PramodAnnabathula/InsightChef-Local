import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { normalizeRecipe } from '../utils/recipeHelpers';

export default function RecipeCard({ recipe, index = 0 }) {
  // Safely normalize recipe with error handling
  const r = useMemo(() => {
    try {
      return normalizeRecipe(recipe);
    } catch (err) {
      // If normalization fails, return a safe default
      console.error('Error normalizing recipe in card:', err);
      return {
        name: 'Recipe',
        difficulty: 'Medium',
        prepTime: 10,
        cookTime: 20,
        cuisine: '',
        ingredients: [],
        instructions: [],
      };
    }
  }, [recipe]);

  // Safely calculate total minutes
  const prepTime = (typeof r.prepTime === 'number' && Number.isFinite(r.prepTime)) ? r.prepTime : 10;
  const cookTime = (typeof r.cookTime === 'number' && Number.isFinite(r.cookTime)) ? r.cookTime : 20;
  const totalMinutes = prepTime + cookTime;
  
  const difficultyClass =
    r.difficulty === 'Easy'
      ? 'bg-emerald-100 text-emerald-700'
      : r.difficulty === 'Medium'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-rose-100 text-rose-700';

  const headingId = `recipe-heading-${index}`;
  
  // Safely get arrays
  const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
  const instructions = Array.isArray(r.instructions) ? r.instructions : [];

  return (
    <article
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all border border-white/50 hover:scale-105 active:scale-100"
      aria-labelledby={headingId}
      role="listitem"
    >
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" aria-hidden />
        <h3 id={headingId} className="text-xl sm:text-2xl font-black text-white leading-tight relative z-10">{r.name}</h3>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap">
          <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-sm ${difficultyClass}`}>
            {r.difficulty}
          </span>
          {r.cuisine ? (
            <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-black bg-purple-100 text-purple-700 shadow-sm">
              {r.cuisine}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden />
            {totalMinutes} min
          </span>
        </div>

        <div className="mb-4 sm:mb-5">
          <h4 className="font-black text-gray-800 mb-2.5 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" aria-hidden />
            Ingredients
          </h4>
          <ul className="space-y-1.5 sm:space-y-2">
            {ingredients.length > 0 ? (
              ingredients.map((ingredient, i) => {
                const ingredientText = (typeof ingredient === 'string') ? ingredient : String(ingredient || '');
                return (
                  <li key={i} className="flex items-start text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <span className="text-orange-500 mr-2 font-black text-base">•</span>
                    <span>{ingredientText}</span>
                  </li>
                );
              })
            ) : (
              <li className="text-xs sm:text-sm text-gray-500 italic">No ingredients listed.</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-black text-gray-800 mb-2.5 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" aria-hidden />
            Steps
          </h4>
          <ol className="space-y-2 sm:space-y-3">
            {instructions.length > 0 ? (
              instructions.map((step, i) => {
                const stepText = (typeof step === 'string') ? step : String(step || '');
                return (
                  <li key={i} className="flex items-start text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-xs flex items-center justify-center mr-2.5 shadow-sm">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{stepText}</span>
                  </li>
                );
              })
            ) : (
              <li className="text-xs sm:text-sm text-gray-500 italic">No steps listed.</li>
            )}
          </ol>
        </div>
      </div>
    </article>
  );
}
