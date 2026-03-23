import { href } from '../base'
import { t } from '../hooks/useLocale'
import { locale } from '../hooks/useLocale'
import { useEarnedCount } from '../hooks/useBadges'
import { useLiveQuery, getAllSessions, getSeenCount, getAllSightings } from '../db'
import type { DiveSession, Sighting } from '../db'
import { getSightingsForSession } from '../db'
import { useState, useEffect, useMemo } from 'preact/hooks'
import { ExportImport } from '../components/ExportImport'
import { speciesById } from '../data/species'
import { categoryMap } from '../data/categories'

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

function PersonalRecords({ sessions }: { sessions: DiveSession[] }) {
  const records = useMemo(() => {
    let deepest: { value: number; site: string } | null = null
    let coldest: { value: number; site: string } | null = null
    let bestVis: { value: number; site: string } | null = null

    for (const s of sessions) {
      if (s.maxDepthM != null && (deepest === null || s.maxDepthM > deepest.value)) {
        deepest = { value: s.maxDepthM, site: s.siteName }
      }
      if (s.waterTempC != null && (coldest === null || s.waterTempC < coldest.value)) {
        coldest = { value: s.waterTempC, site: s.siteName }
      }
      if (s.visibilityM != null && (bestVis === null || s.visibilityM > bestVis.value)) {
        bestVis = { value: s.visibilityM, site: s.siteName }
      }
    }

    return { deepest, coldest, bestVis }
  }, [sessions])

  if (!records.deepest && !records.coldest && !records.bestVis) return null

  return (
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-ocean-100">
      <h3 class="text-sm font-bold text-ocean-800 mb-3">🏅 {t('stats.records')}</h3>
      <div class="grid grid-cols-1 gap-2">
        {records.deepest && (
          <div class="flex items-center justify-between">
            <span class="text-xs text-ocean-500">🌊 {t('stats.deepest')}</span>
            <span class="text-xs font-bold text-ocean-700">{records.deepest.value}m <span class="font-normal text-ocean-400">— {records.deepest.site}</span></span>
          </div>
        )}
        {records.coldest && (
          <div class="flex items-center justify-between">
            <span class="text-xs text-ocean-500">🌡️ {t('stats.coldest')}</span>
            <span class="text-xs font-bold text-ocean-700">{records.coldest.value}°C <span class="font-normal text-ocean-400">— {records.coldest.site}</span></span>
          </div>
        )}
        {records.bestVis && (
          <div class="flex items-center justify-between">
            <span class="text-xs text-ocean-500">👁 {t('stats.best_visibility')}</span>
            <span class="text-xs font-bold text-ocean-700">{records.bestVis.value}m <span class="font-normal text-ocean-400">— {records.bestVis.site}</span></span>
          </div>
        )}
      </div>
    </div>
  )
}

function FavoriteSites({ sessions }: { sessions: DiveSession[] }) {
  const topSites = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of sessions) {
      counts.set(s.siteName, (counts.get(s.siteName) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }, [sessions])

  if (topSites.length === 0) return null

  return (
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-ocean-100">
      <h3 class="text-sm font-bold text-ocean-800 mb-3">📍 {t('stats.favorite_sites')}</h3>
      <div class="space-y-2">
        {topSites.map(([site, count], i) => (
          <div key={site} class="flex items-center gap-2">
            <span class="text-xs font-bold text-ocean-400 w-4">{i + 1}.</span>
            <span class="text-xs text-ocean-700 flex-1 truncate">{site}</span>
            <span class="text-[10px] text-ocean-400">{count} {t('stats.dives_label')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SpeciesByCategory({ sightings }: { sightings: Sighting[] }) {
  const lang = locale.value

  const categoryData = useMemo(() => {
    const uniqueSpecies = new Set(sightings.map(s => s.speciesId))
    const counts = new Map<string, number>()

    for (const speciesId of uniqueSpecies) {
      const sp = speciesById.get(speciesId)
      if (sp) {
        counts.set(sp.category, (counts.get(sp.category) ?? 0) + 1)
      }
    }

    const entries = [...counts.entries()]
      .map(([catId, count]) => {
        const cat = categoryMap.get(catId as any)
        return { catId, count, cat }
      })
      .filter(e => e.cat)
      .sort((a, b) => b.count - a.count)

    const max = entries.length > 0 ? entries[0].count : 1
    return { entries, max }
  }, [sightings])

  if (categoryData.entries.length === 0) return null

  return (
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-ocean-100">
      <h3 class="text-sm font-bold text-ocean-800 mb-3">📊 {t('stats.by_category')}</h3>
      <div class="space-y-1.5">
        {categoryData.entries.map(({ catId, count, cat }) => (
          <div key={catId} class="flex items-center gap-2">
            <span class="text-sm w-5">{cat!.emoji}</span>
            <span class="text-[10px] text-ocean-500 w-20 truncate">
              {lang === 'es' ? cat!.label_es : cat!.label_en}
            </span>
            <div class="flex-1 h-3 bg-ocean-50 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                style={{
                  width: `${(count / categoryData.max) * 100}%`,
                  backgroundColor: cat!.color,
                }}
              />
            </div>
            <span class="text-[10px] font-bold text-ocean-600 w-6 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthlyActivity({ sessions }: { sessions: DiveSession[] }) {
  const monthData = useMemo(() => {
    const now = new Date()
    const months: { label: string; count: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString(locale.value === 'es' ? 'es-CL' : 'en-US', { month: 'short' })
      months.push({ label, count: 0 })

      for (const s of sessions) {
        if (s.date.startsWith(key)) {
          months[months.length - 1].count++
        }
      }
    }

    const max = Math.max(1, ...months.map(m => m.count))
    return { months, max }
  }, [sessions])

  const hasActivity = monthData.months.some(m => m.count > 0)
  if (!hasActivity) return null

  return (
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-ocean-100">
      <h3 class="text-sm font-bold text-ocean-800 mb-3">📅 {t('stats.monthly')}</h3>
      <div class="flex items-end gap-1.5 h-16">
        {monthData.months.map((m) => (
          <div key={m.label} class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full flex items-end justify-center" style={{ height: '40px' }}>
              <div
                class="w-full max-w-[24px] rounded-t bg-ocean-400 transition-all"
                style={{
                  height: m.count > 0 ? `${Math.max(4, (m.count / monthData.max) * 40)}px` : '0px',
                }}
              />
            </div>
            <span class="text-[9px] text-ocean-400">{m.label}</span>
            {m.count > 0 && (
              <span class="text-[9px] font-bold text-ocean-600">{m.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsDashboard({ sessions, sightings }: { sessions: DiveSession[]; sightings: Sighting[] }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div class="mb-5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        class="flex items-center gap-1 text-xs font-semibold text-ocean-500 mb-2 bg-transparent border-none cursor-pointer p-0"
      >
        <span class="transition-transform" style={{ display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        {t('stats.records')}
      </button>
      {expanded && (
        <div class="space-y-3">
          <PersonalRecords sessions={sessions} />
          <FavoriteSites sessions={sessions} />
          <SpeciesByCategory sightings={sightings} />
          <MonthlyActivity sessions={sessions} />
        </div>
      )}
    </div>
  )
}

export function DiveLog() {
  const sessions = useLiveQuery(() => getAllSessions(), [], [] as DiveSession[])
  const seenCount = useLiveQuery(() => getSeenCount(), [], 0)
  const sightings = useLiveQuery(() => getAllSightings(), [], [] as Sighting[])
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

      {/* Stats Dashboard */}
      {sessions.length > 0 && (
        <StatsDashboard sessions={sessions} sightings={sightings} />
      )}

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
