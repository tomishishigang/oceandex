import { t, toggleLocale } from '../hooks/useLocale'

export function Header() {
  return (
    <header class="bg-ocean-700 text-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between shadow-md sticky top-0 z-50">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🌊</span>
        <h1 class="text-lg font-bold tracking-tight">{t('app.title')}</h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-ocean-200 text-sm hidden sm:inline">{t('app.subtitle')}</span>
        <button
          onClick={toggleLocale}
          class="text-xs font-semibold bg-ocean-600 hover:bg-ocean-500 px-2.5 py-1 rounded-full transition-colors"
          aria-label="Toggle language"
        >
          {t('lang.switch')}
        </button>
      </div>
    </header>
  )
}
