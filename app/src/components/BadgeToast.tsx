import { signal } from '@preact/signals'
import { t } from '../hooks/useLocale'
import { useBadges } from '../hooks/useBadges'
import { useRef } from 'preact/hooks'

interface ToastData {
  icon: string
  badgeId: string
}

const toastQueue = signal<ToastData | null>(null)

export function BadgeToastProvider() {
  const badges = useBadges()
  const prevEarned = useRef<Set<string>>(new Set())

  // Check for newly earned badges
  const currentEarned = new Set(badges.filter(b => b.earned).map(b => b.badge.id))

  // Only trigger after initial load (prevEarned is populated)
  if (prevEarned.current.size > 0) {
    for (const id of currentEarned) {
      if (!prevEarned.current.has(id)) {
        const badge = badges.find(b => b.badge.id === id)
        if (badge) {
          toastQueue.value = { icon: badge.badge.icon, badgeId: id }
          setTimeout(() => { toastQueue.value = null }, 4000)
        }
        break // Show one at a time
      }
    }
  }
  prevEarned.current = currentEarned

  if (!toastQueue.value) return null

  const toast = toastQueue.value

  return (
    <div class="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
      <div class="bg-ocean-700 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3">
        <span class="text-2xl">{toast.icon}</span>
        <div>
          <p class="text-xs font-bold">{t('badges.earned')}</p>
          <p class="text-sm">{t(`badge.${toast.badgeId}`)}</p>
        </div>
      </div>
    </div>
  )
}
