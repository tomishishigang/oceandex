import { useMemo } from 'preact/hooks'
import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Species } from '../data/types'

const FUSE_OPTIONS: IFuseOptions<Species> = {
  keys: [
    { name: 'common_name_es', weight: 3 },
    { name: 'common_name_en', weight: 2 },
    { name: 'scientific_name', weight: 2 },
    { name: 'family', weight: 1 },
    { name: 'tags', weight: 2 },
    { name: 'order', weight: 1 },
  ],
  threshold: 0.35,
  minMatchCharLength: 2,
}

export function useSearch(allSpecies: Species[], query: string): Species[] {
  const fuse = useMemo(() => new Fuse(allSpecies, FUSE_OPTIONS), [allSpecies])

  return useMemo(() => {
    if (!query || query.length < 2) return allSpecies
    return fuse.search(query).map((r) => r.item)
  }, [fuse, query, allSpecies])
}
