import { useMemo } from 'preact/hooks'
import { BADGES, type Badge, type BadgeCondition } from '../data/badges'
import { speciesById } from '../data/species'
import { diveSites } from '../data/diveSites'
import { useLiveQuery, getAllSessions, getSeenSpeciesIds } from '../db'
import type { DiveSession } from '../db'

export interface BadgeStatus {
  badge: Badge
  earned: boolean
  progress: number   // 0-1
  current: number
  target: number
}

function evaluateBadge(
  condition: BadgeCondition,
  sessions: DiveSession[],
  seenIds: Set<number>,
): { earned: boolean; current: number; target: number } {
  switch (condition.type) {
    case 'dive_count': {
      const target = condition.threshold ?? 1
      return { earned: sessions.length >= target, current: sessions.length, target }
    }

    case 'species_count': {
      const target = condition.threshold ?? 1
      return { earned: seenIds.size >= target, current: seenIds.size, target }
    }

    case 'category_count': {
      const target = condition.threshold ?? 1
      const count = [...seenIds].filter(id => {
        const sp = speciesById.get(id)
        return sp?.category === condition.category
      }).length
      return { earned: count >= target, current: count, target }
    }

    case 'site_count': {
      const target = condition.threshold ?? 1
      const uniqueSites = new Set(sessions.map(s => s.siteName))
      return { earned: uniqueSites.size >= target, current: uniqueSites.size, target }
    }

    case 'all_sites_in_zone': {
      const zoneSites = diveSites.filter(s => s.zone === condition.zone).map(s => s.name)
      const target = zoneSites.length
      const visited = new Set(sessions.map(s => s.siteName))
      const count = zoneSites.filter(name => visited.has(name)).length
      return { earned: count >= target, current: count, target }
    }

    case 'has_order': {
      const found = [...seenIds].some(id => {
        const sp = speciesById.get(id)
        return sp?.order === condition.order
      })
      return { earned: found, current: found ? 1 : 0, target: 1 }
    }

    default:
      return { earned: false, current: 0, target: 1 }
  }
}

export function useBadges(): BadgeStatus[] {
  const sessions = useLiveQuery(() => getAllSessions(), [], [] as DiveSession[])
  const seenIds = useLiveQuery(() => getSeenSpeciesIds(), [], new Set<number>())

  return useMemo(() => {
    return BADGES.map(badge => {
      const { earned, current, target } = evaluateBadge(badge.condition, sessions, seenIds)
      return {
        badge,
        earned,
        progress: target > 0 ? Math.min(1, current / target) : 0,
        current,
        target,
      }
    })
  }, [sessions, seenIds])
}

export function useEarnedCount(): number {
  const badges = useBadges()
  return badges.filter(b => b.earned).length
}
