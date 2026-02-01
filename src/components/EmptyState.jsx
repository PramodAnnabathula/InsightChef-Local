import { ChefHat } from 'lucide-react';

export default function EmptyState() {
  return (
    <section
      className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50"
      aria-labelledby="empty-state-heading"
      aria-describedby="empty-state-desc"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
        <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
      </div>
      <h2 id="empty-state-heading" className="text-lg sm:text-xl font-black text-gray-700 mb-2">Ready to cook something delicious?</h2>
      <p id="empty-state-desc" className="text-sm sm:text-base text-gray-500 font-medium">Enter your ingredients above to get started</p>
    </section>
  );
}
