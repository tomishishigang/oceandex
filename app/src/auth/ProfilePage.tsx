import { t } from '../hooks/useLocale'
import { href } from '../base'
import { authState, signOut, getUserDisplayName, getUserAvatar } from './useAuth'
import { useLocation } from 'preact-iso'

export function ProfilePage() {
  const { route } = useLocation()
  const { user } = authState.value
  const displayName = getUserDisplayName()
  const avatar = getUserAvatar()

  if (!user) {
    route(href('/login'))
    return null
  }

  async function handleLogout() {
    await signOut()
    route(href('/'))
  }

  return (
    <div class="px-4 py-4">
      <h2 class="text-xl font-bold text-ocean-800 mb-4">{t('auth.profile')}</h2>

      {/* User info */}
      <div class="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt="" class="w-14 h-14 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div class="w-14 h-14 rounded-full bg-ocean-200 flex items-center justify-center text-2xl">
            🤿
          </div>
        )}
        <div>
          <p class="font-bold text-ocean-800">{displayName}</p>
          <p class="text-xs text-ocean-500">{user.email}</p>
        </div>
      </div>

      {/* Sync status */}
      <div class="bg-white rounded-2xl p-4 shadow-sm mt-3">
        <h3 class="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-2">
          {t('sync.title')}
        </h3>
        <p class="text-sm text-ocean-500">
          {t('sync.connected')}
        </p>
      </div>

      {/* Actions */}
      <div class="mt-6 space-y-3">
        <button
          onClick={handleLogout}
          class="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          {t('auth.logout')}
        </button>
      </div>
    </div>
  )
}
