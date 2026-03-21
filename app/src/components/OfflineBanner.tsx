import { signal } from '@preact/signals'
import { syncStatus } from '../sync/syncEngine'
import { isLoggedIn } from '../auth/useAuth'
import { t } from '../hooks/useLocale'
import { fullSync } from '../sync/syncEngine'

const isOffline = signal(!navigator.onLine)

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOffline.value = false
    // Auto-sync when back online
    if (isLoggedIn()) fullSync()
  })
  window.addEventListener('offline', () => { isOffline.value = true })
}

export function OfflineBanner() {
  const offline = isOffline.value
  const status = syncStatus.value

  if (offline) {
    return (
      <div class="bg-sand-400 text-ocean-950 text-xs text-center py-1.5 px-4 font-medium">
        {t('sync.offline')}
      </div>
    )
  }

  if (status === 'syncing') {
    return (
      <div class="bg-deep-500 text-white text-xs text-center py-1 px-4 font-medium animate-pulse">
        {t('sync.syncing')}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div class="bg-red-500 text-white text-xs text-center py-1 px-4 font-medium">
        {t('sync.error')}
      </div>
    )
  }

  return null
}
