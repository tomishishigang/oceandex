import { useState, useMemo } from 'preact/hooks'
import { t, locale } from '../hooks/useLocale'
import { useSearch } from '../hooks/useSearch'
import { species } from '../data/species'
import { categoryMap } from '../data/categories'

interface Props {
  /** 'multi' for bulk add sightings, 'single' for compare selection */
  mode: 'multi' | 'single'
  /** Species IDs already selected (shown as checked in multi mode) */
  alreadySelected?: Set<number>
  /** Called with selected species IDs when user confirms */
  onConfirm: (speciesIds: number[]) => void
  onClose: () => void
}

export function SpeciesPicker({ mode, alreadySelected, onConfirm, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // Only show recommended species (with photos, common+uncommon)
  const recommended = useMemo(
    () => species.filter(s => s.primary_photo && (s.sightability_tier === 'common' || s.sightability_tier === 'uncommon')),
    [],
  )

  const searchResults = useSearch(recommended, query)

  function toggleSpecies(id: number) {
    if (mode === 'single') {
      onConfirm([id])
      return
    }
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelected(next)
  }

  function handleConfirm() {
    onConfirm([...selected])
  }

  const isAlreadyAdded = (id: number) => alreadySelected?.has(id) ?? false

  return (
    <div class="fixed inset-0 z-[100] flex flex-col bg-ocean-50">
      {/* Header */}
      <div class="bg-ocean-700 text-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between shadow-md">
        <button onClick={onClose} class="text-sm text-ocean-200 hover:text-white">
          ✕ {t('picker.close')}
        </button>
        <h2 class="text-sm font-bold">{t('picker.title')}</h2>
        {mode === 'multi' ? (
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            class={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${
              selected.size > 0
                ? 'bg-white text-ocean-700'
                : 'bg-ocean-600 text-ocean-400 cursor-not-allowed'
            }`}
          >
            {t('picker.add')} ({selected.size})
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Search */}
      <div class="px-4 py-3">
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-ocean-400 text-sm">🔍</span>
          <input
            type="text"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            placeholder={t('picker.search')}
            class="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-ocean-200 text-sm text-ocean-800 placeholder:text-ocean-300 focus:outline-none focus:ring-2 focus:ring-ocean-400"
            autofocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 text-sm"
            >
              ✕
            </button>
          )}
        </div>
        {mode === 'multi' && selected.size > 0 && (
          <p class="text-xs text-ocean-500 mt-1.5">
            {selected.size} {t('picker.selected')}
          </p>
        )}
      </div>

      {/* Species list */}
      <div class="flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div class="space-y-1">
          {searchResults.map((sp) => {
            const cat = categoryMap.get(sp.category)
            const isSelected = selected.has(sp.id)
            const isExisting = isAlreadyAdded(sp.id)
            const displayName = locale.value === 'es'
              ? sp.common_name_es ?? sp.common_name_en ?? sp.scientific_name
              : sp.common_name_en ?? sp.common_name_es ?? sp.scientific_name

            return (
              <button
                key={sp.id}
                onClick={() => !isExisting && toggleSpecies(sp.id)}
                disabled={isExisting}
                class={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                  isExisting
                    ? 'bg-ocean-50 opacity-50'
                    : isSelected
                      ? 'bg-ocean-100 border border-ocean-400'
                      : 'bg-white border border-ocean-100 hover:bg-ocean-50'
                }`}
              >
                {/* Photo */}
                {sp.primary_photo?.url_medium ? (
                  <img
                    src={sp.primary_photo.url_medium}
                    alt=""
                    class="w-10 h-10 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div class="w-10 h-10 rounded-lg bg-ocean-100 flex items-center justify-center text-lg shrink-0">
                    {cat?.emoji ?? '🌊'}
                  </div>
                )}

                {/* Info */}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate text-ocean-800">{displayName}</p>
                  <p class="text-[10px] text-ocean-500 italic truncate">{sp.scientific_name}</p>
                </div>

                {/* Checkbox / status */}
                <div class="shrink-0">
                  {isExisting ? (
                    <span class="text-[10px] text-ocean-400">✓ {t('sighting.seen')}</span>
                  ) : mode === 'multi' ? (
                    <div class={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-ocean-700 border-ocean-700 text-white' : 'border-ocean-300'
                    }`}>
                      {isSelected && <span class="text-xs">✓</span>}
                    </div>
                  ) : (
                    <span class="text-ocean-400 text-sm">›</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
