import { useState, useEffect } from 'preact/hooks'
import { getSupabase, hasSupabaseConfig } from '../auth/supabase'

export interface SiteCommunityStats {
  total_dives: number
  unique_divers: number
  species_count: number
  top_species: { species_id: number; count: number }[]
}

export interface SpeciesCommunityStats {
  total_sightings: number
  unique_divers: number
  sites: { site_name: string; count: number }[]
}

interface CommunityResult<T> {
  loading: boolean
  data: T | null
  error: string | null
  offline: boolean
}

export function useSiteCommunityStats(siteName: string): CommunityResult<SiteCommunityStats> {
  const [state, setState] = useState<CommunityResult<SiteCommunityStats>>({
    loading: true,
    data: null,
    error: null,
    offline: false,
  })

  useEffect(() => {
    if (!navigator.onLine) {
      setState({ loading: false, data: null, error: null, offline: true })
      return
    }

    if (!hasSupabaseConfig()) {
      setState({ loading: false, data: null, error: null, offline: false })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    async function fetch() {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase.rpc('get_site_community_stats', { p_site_name: siteName })
        if (error) {
          console.warn('get_site_community_stats error:', error.message)
          setState({ loading: false, data: null, error: error.message, offline: false })
          return
        }
        setState({ loading: false, data: data as SiteCommunityStats | null, error: null, offline: false })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.warn('get_site_community_stats exception:', msg)
        setState({ loading: false, data: null, error: msg, offline: false })
      }
    }
    fetch()
  }, [siteName])

  return state
}

export function useSpeciesCommunityStats(speciesId: number): CommunityResult<SpeciesCommunityStats> {
  const [state, setState] = useState<CommunityResult<SpeciesCommunityStats>>({
    loading: true,
    data: null,
    error: null,
    offline: false,
  })

  useEffect(() => {
    if (!navigator.onLine) {
      setState({ loading: false, data: null, error: null, offline: true })
      return
    }

    if (!hasSupabaseConfig()) {
      setState({ loading: false, data: null, error: null, offline: false })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    async function fetch() {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase.rpc('get_species_community_stats', { p_species_id: speciesId })
        if (error) {
          console.warn('get_species_community_stats error:', error.message)
          setState({ loading: false, data: null, error: error.message, offline: false })
          return
        }
        setState({ loading: false, data: data as SpeciesCommunityStats | null, error: null, offline: false })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.warn('get_species_community_stats exception:', msg)
        setState({ loading: false, data: null, error: msg, offline: false })
      }
    }
    fetch()
  }, [speciesId])

  return state
}
