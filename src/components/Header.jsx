import { ChefHat } from 'lucide-react';

export default function Header() {
  return (
    <header className="text-center mb-8 sm:mb-12" role="banner">
      <div className="inline-flex items-center justify-center gap-3 mb-3 bg-white px-6 py-3 rounded-2xl shadow-lg">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center" aria-hidden="true">
          <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
          InsightChef
        </h1>
      </div>
      <p className="text-gray-600 text-base sm:text-lg font-medium">Smart recipes from your ingredients</p>
    </header>
  );
}
