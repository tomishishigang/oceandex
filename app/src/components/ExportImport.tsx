import { useState, useRef } from 'preact/hooks'
import { t } from '../hooks/useLocale'
import { exportData, importData } from '../db'
import type { ExportData } from '../db'

export function ExportImport() {
  const [feedback, setFeedback] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const data = await exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oceandex-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
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
      setFeedback(`${t('export.success')} (${result.sessions} sesiones, ${result.sightings} avistamientos)`)
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
      <div class="flex gap-2">
        <button
          onClick={handleExport}
          class="flex-1 text-xs py-2 rounded-xl bg-ocean-50 text-ocean-700 font-medium hover:bg-ocean-100 transition-colors"
        >
          📥 {t('export.download')}
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
