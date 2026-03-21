import { t } from '../hooks/useLocale'
import { href } from '../base'
import { authState, signOut } from './useAuth'
import { syncStatus } from '../sync/syncEngine'
import { useLocation } from 'preact-iso'

export function ProfilePage() {
  const { route } = useLocation()
  const user = authState.value.user
  const status = syncStatus.value

  if (!user) {
    return (
      <div class="px-4 py-16 text-center">
        <div class="text-5xl mb-3">👤</div>
        <p class="text-ocean-500 mb-4">{t('auth.login_subtitle')}</p>
        <a
          href={href('/login')}
          class="bg-ocean-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium no-underline inline-block"
        >
          {t('auth.login')}
        </a>
      </div>
    )
  }

  const displayName = user.user_metadata?.full_name ?? user.email ?? ''
  const avatar = user.user_metadata?.avatar_url ?? null

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
        <div class="flex items-center gap-2">
          <span class={`w-2 h-2 rounded-full ${
            status === 'idle' ? 'bg-green-500'
            : status === 'syncing' ? 'bg-blue-500 animate-pulse'
            : status === 'offline' ? 'bg-yellow-500'
            : 'bg-red-500'
          }`} />
          <p class="text-sm text-ocean-500">
            {status === 'idle' && t('sync.connected')}
            {status === 'syncing' && t('sync.syncing')}
            {status === 'offline' && t('sync.offline')}
            {status === 'error' && t('sync.error')}
          </p>
        </div>
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
