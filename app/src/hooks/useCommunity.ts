import { useState, useEffect } from 'preact/hooks'
import { getSupabase, hasSupabaseConfig } from '../auth/supabase'

export interface SiteStats {
  total_dives: number
  unique_divers: number
  total_species: number
}

export interface SiteTopSpecies {
  species_id: number
  sighting_count: number
  diver_count: number
}

export interface RecentActivity {
  species_id: number
  site_name: string
  date: string
  created_at: string
}

export interface SpeciesCommunityStats {
  total_sightings: number
  unique_divers: number
  sites: { site_name: string; sighting_count: number }[]
}

function useSupabaseRpc<T>(fnName: string, params: Record<string, unknown>, defaultValue: T): T {
  const [data, setData] = useState<T>(defaultValue)

  useEffect(() => {
    if (!hasSupabaseConfig() || !navigator.onLine) return

    const supabase = getSupabase()
    supabase.rpc(fnName, params).then(({ data: result, error }) => {
      if (error) {
        console.error(`RPC ${fnName} error:`, error)
        return
      }
      if (result != null) setData(result as T)
    })
  }, [fnName, JSON.stringify(params)])

  return data
}

export function useSiteStats(siteName: string): SiteStats | null {
  return useSupabaseRpc<SiteStats | null>('get_site_stats', { site: siteName }, null)
}

export function useSiteTopSpecies(siteName: string): SiteTopSpecies[] {
  return useSupabaseRpc<SiteTopSpecies[]>('get_site_top_species', { site: siteName, max_results: 10 }, [])
}

export function useRecentActivity(): RecentActivity[] {
  return useSupabaseRpc<RecentActivity[]>('get_recent_activity', { max_results: 15 }, [])
}

export function useSpeciesCommunityStats(speciesId: number): SpeciesCommunityStats | null {
  return useSupabaseRpc<SpeciesCommunityStats | null>('get_species_community_stats', { sp_id: speciesId }, null)
}
