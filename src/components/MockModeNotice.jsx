import { Info } from 'lucide-react';

export default function MockModeNotice() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-start gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 sm:px-5 sm:py-4 text-amber-900"
    >
      <Info className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm sm:text-base mb-1">Mock mode — sample recipes</p>
        <p className="text-sm text-amber-800">
          You&apos;re seeing sample recipes only. No AI or external APIs are used. Results are clearly marked as <strong>sample</strong> vs <strong>AI-generated</strong> when you view recipes. For AI-generated recipes in production, run the backend and add your API key (see README).
        </p>
      </div>
    </div>
  );
}
