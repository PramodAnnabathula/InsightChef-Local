import { AlertCircle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <aside
      role="complementary"
      aria-labelledby="disclaimer-heading"
      className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-5 sm:py-4 text-slate-700"
    >
      <h2 id="disclaimer-heading" className="sr-only">
        Important information about recipes and your data
      </h2>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-slate-500 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1.5 text-sm sm:text-base">
          <p>
            <strong>Recipes are suggestions only.</strong> They may not suit allergies, dietary restrictions, or medical needs. Always verify ingredients, allergen information, and nutrition before cooking or consuming.
          </p>
          <p className="text-slate-600">
            We do not collect or store your personal data. Ingredients and preferences are used only to generate recipe suggestions and are not saved.
          </p>
        </div>
      </div>
    </aside>
  );
}
