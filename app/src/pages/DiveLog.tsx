import { href } from '../base'
import { t } from '../hooks/useLocale'
import { useEarnedCount } from '../hooks/useBadges'
import { useLiveQuery, getAllSessions, getSeenCount } from '../db'
import type { DiveSession } from '../db'
import { getSightingsForSession } from '../db'
import { useState, useEffect } from 'preact/hooks'
import { ExportImport } from '../components/ExportImport'

function SessionCard({ session }: { session: DiveSession }) {
  const [sightingCount, setSightingCount] = useState(0)

  useEffect(() => {
    getSightingsForSession(session.id).then((s) => setSightingCount(s.length))
  }, [session.id])

  return (
    <a
      href={href(`/log/${session.id}`)}
      class="block bg-white rounded-2xl p-4 shadow-sm border border-ocean-100 no-underline text-ocean-950 hover:shadow-md transition-shadow"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="font-semibold text-ocean-800">{session.siteName}</p>
          <p class="text-xs text-ocean-500 mt-0.5">{session.date}</p>
        </div>
        <div class="text-right">
          <span class="text-sm font-bold text-ocean-700">{sightingCount}</span>
          <span class="text-[10px] text-ocean-400 ml-1">🐟</span>
        </div>
      </div>
      <div class="flex gap-2 mt-1 text-xs text-ocean-400 flex-wrap">
        {session.maxDepthM != null && <span>🌊 {session.maxDepthM}m</span>}
        {session.waterTempC != null && <span>🌡️ {session.waterTempC}°C</span>}
        {session.visibilityM != null && <span>👁 {session.visibilityM}m</span>}
      </div>
      {session.notes && (
        <p class="text-xs text-ocean-400 mt-1 truncate">{session.notes}</p>
      )}
    </a>
  )
}

export function DiveLog() {
  const sessions = useLiveQuery(() => getAllSessions(), [], [] as DiveSession[])
  const seenCount = useLiveQuery(() => getSeenCount(), [], 0)
  const badgeCount = useEarnedCount()

  return (
    <div class="px-4 py-4">
      {/* Header + stats */}
      <div class="mb-5">
        <h2 class="text-xl font-bold text-ocean-800">{t('log.title')}</h2>
        <div class="flex gap-4 mt-2">
          <div class="flex items-center gap-1.5">
            <span class="text-lg">🤿</span>
            <span class="text-sm font-bold text-ocean-700">{sessions.length}</span>
            <span class="text-xs text-ocean-500">{t('log.total_dives')}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-lg">🐟</span>
            <span class="text-sm font-bold text-ocean-700">{seenCount}</span>
            <span class="text-xs text-ocean-500">{t('log.species_seen')}</span>
          </div>
          <a href={href('/badges')} class="flex items-center gap-1.5 no-underline">
            <span class="text-lg">🏆</span>
            <span class="text-sm font-bold text-ocean-700">{badgeCount}</span>
            <span class="text-xs text-ocean-500">{t('badges.count')}</span>
          </a>
        </div>

        {/* Progress bar */}
        {seenCount > 0 && (
          <div class="mt-3">
            <div class="flex justify-between text-[10px] text-ocean-400 mb-1">
              <span>{t('stats.progress')}</span>
              <span>{seenCount} {t('stats.seen_of')} 327</span>
            </div>
            <div class="w-full bg-ocean-100 rounded-full h-2">
              <div
                class="h-2 rounded-full bg-ocean-500 transition-all"
                style={{ width: `${Math.min(100, (seenCount / 327) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Session list or empty state */}
      {sessions.length > 0 ? (
        <div class="space-y-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div class="text-center py-12">
          <div class="text-5xl mb-3">🤿</div>
          <p class="text-ocean-500 font-medium">{t('log.empty')}</p>
          <p class="text-ocean-400 text-sm mt-1">{t('log.empty_cta')}</p>
        </div>
      )}

      {/* Export/Import */}
      {sessions.length > 0 && <ExportImport />}

      {/* FAB: New dive */}
      <a
        href={href("/log/new")}
        class="fixed bottom-20 right-4 bg-ocean-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl no-underline hover:bg-ocean-600 transition-colors z-40"
        aria-label={t('log.new')}
      >
        +
      </a>
    </div>
  )
}
