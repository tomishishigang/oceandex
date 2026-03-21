import { t } from '../hooks/useLocale'
import { useBadges, type BadgeStatus } from '../hooks/useBadges'

function BadgeCard({ status }: { status: BadgeStatus }) {
  const { badge, earned, progress, current, target } = status

  return (
    <div class={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
      earned ? 'border-sand-400' : 'border-ocean-100 opacity-60'
    }`}>
      <div class="text-center">
        <span class={`text-3xl ${earned ? '' : 'grayscale'}`}>{badge.icon}</span>
        <p class="text-xs font-bold text-ocean-800 mt-2">
          {t(`badge.${badge.id}`)}
        </p>
        <p class="text-[10px] text-ocean-500 mt-0.5">
          {t(`badge.${badge.id}.desc`)}
        </p>
      </div>

      {/* Progress bar */}
      {!earned && target > 1 && (
        <div class="mt-2">
          <div class="w-full bg-ocean-100 rounded-full h-1.5">
            <div
              class="h-1.5 rounded-full bg-ocean-400 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p class="text-[9px] text-ocean-400 text-center mt-0.5">
            {current}/{target}
          </p>
        </div>
      )}

      {earned && (
        <p class="text-[9px] text-sand-500 font-semibold text-center mt-2">
          ✓ {t('badges.earned_label')}
        </p>
      )}
    </div>
  )
}

export function Badges() {
  const badges = useBadges()
  const earnedCount = badges.filter(b => b.earned).length

  return (
    <div class="px-4 py-4">
      <div class="mb-5">
        <h2 class="text-xl font-bold text-ocean-800">{t('badges.title')}</h2>
        <p class="text-sm text-ocean-500 mt-0.5">
          {earnedCount}/{badges.length} {t('badges.count')}
        </p>

        {/* Overall progress */}
        <div class="mt-2">
          <div class="w-full bg-ocean-100 rounded-full h-2">
            <div
              class="h-2 rounded-full bg-sand-400 transition-all"
              style={{ width: `${(earnedCount / badges.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Earned badges first */}
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges
          .sort((a, b) => (a.earned === b.earned ? 0 : a.earned ? -1 : 1))
          .map(status => (
            <BadgeCard key={status.badge.id} status={status} />
          ))}
      </div>
    </div>
  )
}
