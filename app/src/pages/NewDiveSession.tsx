import { useState } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { t } from '../hooks/useLocale'
import { href } from '../base'
import { createSession } from '../db'
import type { CurrentStrength } from '../db'
import { diveSites } from '../data/diveSites'

const CURRENT_OPTIONS: CurrentStrength[] = ['none', 'light', 'moderate', 'strong']

export function NewDiveSession() {
  const { route } = useLocation()
  const today = new Date().toISOString().split('T')[0]

  const [siteName, setSiteName] = useState('')
  const [date, setDate] = useState(today)
  const [depth, setDepth] = useState('')
  const [waterTemp, setWaterTemp] = useState('')
  const [visibility, setVisibility] = useState('')
  const [current, setCurrent] = useState<CurrentStrength | ''>('')
  const [notes, setNotes] = useState('')
  const [showSites, setShowSites] = useState(false)

  const canSave = siteName.trim().length > 0 && date.length > 0

  async function handleSave() {
    if (!canSave) return
    const session = await createSession({
      siteName: siteName.trim(),
      date,
      maxDepthM: depth ? Number(depth) : null,
      waterTempC: waterTemp ? Number(waterTemp) : null,
      visibilityM: visibility ? Number(visibility) : null,
      current: current || null,
      notes: notes.trim() || null,
    })
    route(href(`/log/${session.id}`))
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-white border border-ocean-200 text-sm text-ocean-800 placeholder:text-ocean-300 focus:outline-none focus:ring-2 focus:ring-ocean-400"

  return (
    <div class="px-4 py-4">
      <h2 class="text-xl font-bold text-ocean-800 mb-4">{t('newdive.title')}</h2>

      <div class="space-y-4">
        {/* Dive site */}
        <div>
          <label class="block text-xs font-semibold text-ocean-600 mb-1">
            {t('newdive.site')}
          </label>
          <div class="relative">
            <input
              type="text"
              value={siteName}
              onInput={(e) => setSiteName((e.target as HTMLInputElement).value)}
              onFocus={() => setShowSites(true)}
              placeholder={t('newdive.site_placeholder')}
              class={inputClass}
            />
            {showSites && (
              <div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-ocean-200 max-h-48 overflow-y-auto z-20">
                {diveSites.map((site) => (
                  <button
                    key={site.name}
                    onClick={() => {
                      setSiteName(site.name)
                      setShowSites(false)
                    }}
                    class="w-full text-left px-3 py-2 text-sm text-ocean-800 hover:bg-ocean-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <span class="font-medium">{site.name}</span>
                    <span class="text-ocean-400 ml-1 text-xs">({site.zone})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label class="block text-xs font-semibold text-ocean-600 mb-1">
            {t('newdive.date')}
          </label>
          <input
            type="date"
            value={date}
            onInput={(e) => setDate((e.target as HTMLInputElement).value)}
            class={inputClass}
          />
        </div>

        {/* Depth + Temp row */}
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-ocean-600 mb-1">
              {t('newdive.depth')}
            </label>
            <input
              type="number"
              value={depth}
              onInput={(e) => setDepth((e.target as HTMLInputElement).value)}
              min="0" max="100" placeholder="0"
              class={inputClass}
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-ocean-600 mb-1">
              {t('conditions.temp')}
            </label>
            <input
              type="number"
              value={waterTemp}
              onInput={(e) => setWaterTemp((e.target as HTMLInputElement).value)}
              min="0" max="35" placeholder="12"
              class={inputClass}
            />
          </div>
        </div>

        {/* Visibility + Current row */}
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-ocean-600 mb-1">
              {t('conditions.visibility')}
            </label>
            <input
              type="number"
              value={visibility}
              onInput={(e) => setVisibility((e.target as HTMLInputElement).value)}
              min="0" max="50" placeholder="10"
              class={inputClass}
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-ocean-600 mb-1">
              {t('conditions.current')}
            </label>
            <select
              value={current}
              onChange={(e) => setCurrent((e.target as HTMLSelectElement).value as CurrentStrength | '')}
              class={inputClass}
            >
              <option value="">—</option>
              {CURRENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{t(`current.${opt}`)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label class="block text-xs font-semibold text-ocean-600 mb-1">
            {t('newdive.notes')}
          </label>
          <textarea
            value={notes}
            onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
            placeholder={t('newdive.notes_placeholder')}
            rows={3}
            class={`${inputClass} resize-none`}
          />
        </div>

        {/* Actions */}
        <div class="flex gap-3 pt-2">
          <a
            href={href("/log")}
            class="flex-1 text-center py-2.5 rounded-xl border border-ocean-200 text-sm text-ocean-600 no-underline hover:bg-ocean-50 transition-colors"
          >
            {t('newdive.cancel')}
          </a>
          <button
            onClick={handleSave}
            disabled={!canSave}
            class={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              canSave
                ? 'bg-ocean-700 text-white hover:bg-ocean-600'
                : 'bg-ocean-200 text-ocean-400 cursor-not-allowed'
            }`}
          >
            {t('newdive.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
