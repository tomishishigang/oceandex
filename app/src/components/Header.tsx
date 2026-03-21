import { t, toggleLocale } from '../hooks/useLocale'
import { useEarnedCount } from '../hooks/useBadges'
import { href } from '../base'
import { authState } from '../auth/useAuth'

export function Header() {
  const earnedCount = useEarnedCount()

  // Access signal .value in render for reactivity
  const user = authState.value.user
  const avatar = user?.user_metadata?.avatar_url ?? null

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
        <a
          href={href(user ? '/profile' : '/login')}
          class="no-underline hover:scale-110 transition-transform"
          aria-label={user ? t('auth.profile') : t('auth.login')}
        >
          {user && avatar ? (
            <img src={avatar} alt="" class="w-7 h-7 rounded-full border-2 border-ocean-500" referrerPolicy="no-referrer" />
          ) : user ? (
            <div class="w-7 h-7 rounded-full bg-ocean-500 flex items-center justify-center text-xs font-bold">
              {(user.email?.[0] ?? '?').toUpperCase()}
            </div>
          ) : (
            <span class="text-lg">👤</span>
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
