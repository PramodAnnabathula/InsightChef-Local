import { Sparkles } from 'lucide-react';

/**
 * Transparent notice: mock (sample) vs AI-generated recipes.
 * Renders only when recipes are shown.
 */
export default function RecipeSourceNotice({ isMockMode }) {
  if (isMockMode) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 sm:px-4 sm:py-2.5 text-amber-900"
      >
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">Sample recipes</span>
        <span className="text-xs sm:text-sm text-amber-800">
          For testing only. Not tailored to your ingredients. AI-generated recipes require the backend.
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 sm:px-4 sm:py-2.5 text-emerald-900"
    >
      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden />
      <span className="text-xs sm:text-sm font-bold">AI-generated</span>
      <span className="text-xs sm:text-sm text-emerald-800">
        Suggestions only. Verify ingredients, allergens, and nutrition before use.
      </span>
    </div>
  );
}
