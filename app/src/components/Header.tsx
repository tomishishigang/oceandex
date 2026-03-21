import { t, toggleLocale } from '../hooks/useLocale'
import { useEarnedCount } from '../hooks/useBadges'
import { href } from '../base'

export function Header() {
  const earnedCount = useEarnedCount()

  return (
    <header class="bg-ocean-700 text-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between shadow-md sticky top-0 z-50">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🌊</span>
        <h1 class="text-lg font-bold tracking-tight">{t('app.title')}</h1>
      </div>
      <div class="flex items-center gap-2">
        <a
          href={href('/badges')}
          class="relative text-lg no-underline hover:scale-110 transition-transform"
          aria-label={t('badges.title')}
        >
          🏆
          {earnedCount > 0 && (
            <span class="absolute -top-1 -right-1 bg-sand-400 text-ocean-950 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {earnedCount}
            </span>
          )}
        </a>
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
