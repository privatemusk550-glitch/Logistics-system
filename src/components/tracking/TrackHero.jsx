/**
 * TrackHero.jsx
 * -------------
 * The hero section on the public tracking page.
 * Contains the tracking number input form.
 *
 * Props:
 * - trackingNumber: current input value
 * - setTrackingNumber: updater function from parent
 * - loading: boolean — true while searching
 * - onSubmit: form submit handler from parent
 * - error: error string to display
 *
 * For junior devs:
 * - useTranslation() lets us show text in the user's chosen language
 * - The gradient background uses Tailwind's bg-gradient-to-br utility
 */

import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'

export default function TrackHero({ trackingNumber, setTrackingNumber, loading, onSubmit, error }) {
  const { t } = useTranslation()

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 py-20 overflow-hidden">

      {/* Decorative background circles (purely visual, no functionality) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full
                        bg-aramexRed/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full
                        bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {t('hero.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-base sm:text-lg mb-10 max-w-xl mx-auto">
          {t('hero.subtitle')}
        </p>

        {/* Search form */}
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">

          {/* Text input */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t('hero.placeholder')}
              className="w-full h-14 pl-11 pr-4 rounded-xl bg-white text-gray-800
                         placeholder-gray-400 outline-none text-sm font-medium
                         focus:ring-2 focus:ring-aramexRed shadow-lg"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !trackingNumber.trim()}
            className="h-14 px-8 bg-aramexRed hover:bg-red-700 text-white font-semibold
                       rounded-xl transition-colors shadow-lg
                       disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? t('hero.searching') : t('hero.button')}
          </button>
        </form>

        {/* Error message (shown in red under the form) */}
        {error && (
          <p className="mt-4 text-red-400 text-sm font-medium">
            ⚠ {error}
          </p>
        )}

        {/* Hint text */}
        <p className="mt-5 text-white/40 text-xs">
          {t('hero.hint')}
        </p>
      </div>
    </section>
  )
}
