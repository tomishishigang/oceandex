import { useState, useRef } from 'preact/hooks'
import { t } from '../hooks/useLocale'
import { exportData, importData, useLiveQuery, getPhotoCount } from '../db'
import type { ExportData } from '../db'

export function ExportImport() {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [includePhotos, setIncludePhotos] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const photoCount = useLiveQuery(() => getPhotoCount(), [], 0)

  async function handleExport() {
    setExporting(true)
    try {
      const data = await exportData(includePhotos)
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `oceandex-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportData

      if (!data.version || !data.sessions || !data.sightings) {
        throw new Error('Invalid format')
      }

      const result = await importData(data)
      const parts = [`${result.sessions} sesiones`, `${result.sightings} avistamientos`]
      if (result.photos > 0) parts.push(`${result.photos} ${t('photo.count')}`)
      setFeedback(`${t('export.success')} (${parts.join(', ')})`)
    } catch {
      setFeedback(t('export.error'))
    }

    if (fileRef.current) fileRef.current.value = ''
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <div class="bg-white rounded-2xl p-4 shadow-sm mt-4">
      <h3 class="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-3">
        {t('export.title')}
      </h3>

      {/* Photo toggle */}
      {photoCount > 0 && (
        <label class="flex items-center gap-2 text-xs text-ocean-600 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includePhotos}
            onChange={(e) => setIncludePhotos((e.target as HTMLInputElement).checked)}
            class="rounded"
          />
          {t('photo.count')}: {photoCount} ({includePhotos ? 'incluidas' : 'excluidas'})
        </label>
      )}

      <div class="flex gap-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          class={`flex-1 text-xs py-2 rounded-xl font-medium transition-colors ${
            exporting ? 'bg-ocean-200 text-ocean-400' : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
          }`}
        >
          {exporting ? '...' : '📥'} {t('export.download')}
        </button>
        <label class="flex-1 text-xs py-2 rounded-xl bg-ocean-50 text-ocean-700 font-medium hover:bg-ocean-100 transition-colors text-center cursor-pointer">
          📤 {t('export.import')}
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            class="hidden"
            onChange={handleImport}
          />
        </label>
      </div>
      {feedback && (
        <p class="text-xs text-ocean-500 mt-2 text-center">{feedback}</p>
      )}
    </div>
  )
}
