import { useState } from 'preact/hooks'
import { t, locale } from '../hooks/useLocale'
import { speciesById } from '../data/species'
import { categoryMap } from '../data/categories'
import { SpeciesPicker } from '../components/SpeciesPicker'
import type { Species } from '../data/types'

function SpeciesSlot({
  species: sp,
  onSelect,
  label,
}: {
  species: Species | null
  onSelect: () => void
  label: string
}) {
  if (!sp) {
    return (
      <button
        onClick={onSelect}
        class="flex-1 bg-white rounded-2xl border-2 border-dashed border-ocean-300 p-4 flex flex-col items-center justify-center gap-2 min-h-[200px] hover:bg-ocean-50 transition-colors"
      >
        <span class="text-3xl">+</span>
        <span class="text-xs text-ocean-500">{label}</span>
      </button>
    )
  }

  const cat = categoryMap.get(sp.category)
  const name = locale.value === 'es'
    ? sp.common_name_es ?? sp.common_name_en ?? sp.scientific_name
    : sp.common_name_en ?? sp.common_name_es ?? sp.scientific_name

  return (
    <div class="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-ocean-100">
      {sp.primary_photo?.url_medium ? (
        <img src={sp.primary_photo.url_medium} alt="" class="w-full aspect-square object-cover" />
      ) : (
        <div class="w-full aspect-square bg-ocean-100 flex items-center justify-center text-4xl">
          {cat?.emoji ?? '🌊'}
        </div>
      )}
      <div class="p-2">
        <p class="text-xs font-bold truncate text-ocean-800">{name}</p>
        <p class="text-[10px] italic text-ocean-500 truncate">{sp.scientific_name}</p>
        <button
          onClick={onSelect}
          class="text-[10px] text-ocean-400 mt-1 hover:text-ocean-600"
        >
          {t('compare.change')}
        </button>
      </div>
    </div>
  )
}

interface TaxRow {
  label: string
  a: string | null
  b: string | null
}

export function Compare() {
  const [speciesA, setSpeciesA] = useState<Species | null>(null)
  const [speciesB, setSpeciesB] = useState<Species | null>(null)
  const [picking, setPicking] = useState<'a' | 'b' | null>(null)

  function handlePick(ids: number[]) {
    const sp = ids[0] ? speciesById.get(ids[0]) ?? null : null
    if (picking === 'a') setSpeciesA(sp)
    if (picking === 'b') setSpeciesB(sp)
    setPicking(null)
  }

  const taxRows: TaxRow[] = speciesA && speciesB ? [
    { label: t('detail.phylum'), a: speciesA.phylum, b: speciesB.phylum },
    { label: t('detail.class'), a: speciesA.class, b: speciesB.class },
    { label: t('detail.order'), a: speciesA.order, b: speciesB.order },
    { label: t('detail.family'), a: speciesA.family, b: speciesB.family },
    { label: t('detail.genus'), a: speciesA.genus, b: speciesB.genus },
  ].filter(r => r.a || r.b) : []

  return (
    <div class="px-4 py-4 pb-6">
      <h2 class="text-xl font-bold text-ocean-800 mb-4">{t('compare.title')}</h2>

      {/* Side by side slots */}
      <div class="flex gap-3">
        <SpeciesSlot
          species={speciesA}
          onSelect={() => setPicking('a')}
          label={t('compare.select_first')}
        />
        <SpeciesSlot
          species={speciesB}
          onSelect={() => setPicking('b')}
          label={t('compare.select_second')}
        />
      </div>

      {/* Taxonomy comparison */}
      {speciesA && speciesB && (
        <div class="bg-white rounded-2xl p-4 shadow-sm mt-4">
          <h3 class="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-3">
            {t('compare.differences')}
          </h3>
          <div class="space-y-2">
            {taxRows.map(row => {
              const isDiff = row.a !== row.b
              return (
                <div key={row.label} class="text-sm">
                  <p class="text-[10px] text-ocean-400 mb-0.5">{row.label}</p>
                  <div class="flex gap-2">
                    <span class={`flex-1 px-2 py-1 rounded text-xs ${
                      isDiff ? 'bg-sand-100 text-sand-500 font-semibold' : 'bg-ocean-50 text-ocean-600'
                    }`}>
                      {row.a ?? '—'}
                    </span>
                    <span class={`flex-1 px-2 py-1 rounded text-xs ${
                      isDiff ? 'bg-sand-100 text-sand-500 font-semibold' : 'bg-ocean-50 text-ocean-600'
                    }`}>
                      {row.b ?? '—'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sightability comparison */}
          <div class="mt-4 pt-3 border-t border-ocean-100">
            <p class="text-[10px] text-ocean-400 mb-1">{t('detail.sightability')}</p>
            <div class="flex gap-2">
              <div class="flex-1">
                <div class="w-full bg-ocean-100 rounded-full h-2">
                  <div
                    class="h-2 rounded-full bg-ocean-500"
                    style={{ width: `${speciesA.sightability_score}%` }}
                  />
                </div>
                <p class="text-[10px] text-ocean-500 mt-0.5">
                  {t(`tier.${speciesA.sightability_tier}`)} ({speciesA.sightability_score})
                </p>
              </div>
              <div class="flex-1">
                <div class="w-full bg-ocean-100 rounded-full h-2">
                  <div
                    class="h-2 rounded-full bg-ocean-500"
                    style={{ width: `${speciesB.sightability_score}%` }}
                  />
                </div>
                <p class="text-[10px] text-ocean-500 mt-0.5">
                  {t(`tier.${speciesB.sightability_tier}`)} ({speciesB.sightability_score})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Picker modal */}
      {picking && (
        <SpeciesPicker
          mode="single"
          onConfirm={handlePick}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  )
}
