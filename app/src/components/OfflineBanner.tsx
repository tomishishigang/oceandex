import { signal } from '@preact/signals'

const isOffline = signal(!navigator.onLine)

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { isOffline.value = false })
  window.addEventListener('offline', () => { isOffline.value = true })
}

export function OfflineBanner() {
  if (!isOffline.value) return null

  return (
    <div class="bg-sand-400 text-ocean-950 text-xs text-center py-1.5 px-4 font-medium">
      Sin conexión — mostrando datos guardados
    </div>
  )
}
