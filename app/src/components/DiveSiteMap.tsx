import { useEffect, useRef, useState } from 'preact/hooks'
import { t } from '../hooks/useLocale'
import { href } from '../base'
import { diveSites } from '../data/diveSites'

const difficultyColors: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
}

export function DiveSiteMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const leafletRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return

    // Dynamic import for code splitting
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      if (!mapRef.current) return

      // Center on central Chile dive area
      const map = L.default.map(mapRef.current, {
        center: [-32.8, -71.55],
        zoom: 9,
        zoomControl: true,
        attributionControl: true,
      })

      // OpenStreetMap tiles
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      // Add markers for each dive site
      diveSites.forEach(site => {
        const color = difficultyColors[site.difficulty] ?? '#3b82f6'

        const icon = L.default.divIcon({
          className: '',
          html: `<div style="
            background: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          ">📍</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        })

        const marker = L.default.marker([site.lat, site.lng], { icon }).addTo(map)

        marker.bindPopup(`
          <div style="min-width: 160px; font-family: system-ui;">
            <p style="font-weight: 700; font-size: 14px; margin: 0 0 4px;">${site.name}</p>
            <p style="font-size: 11px; color: #6b7280; margin: 0 0 6px;">${site.zone}</p>
            <div style="font-size: 11px; color: #374151; display: flex; gap: 8px; margin-bottom: 6px;">
              <span>🌊 ${site.max_depth_m}m</span>
              <span style="color: ${color}; font-weight: 600;">${t(`difficulty.${site.difficulty}`)}</span>
            </div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
              ${site.type.map(typ => `<span style="font-size: 10px; background: #f0fdfa; color: #0d9488; padding: 2px 6px; border-radius: 8px;">${t(`sitetype.${typ}`)}</span>`).join('')}
            </div>
            <a href="${href(`/sites/${encodeURIComponent(site.name)}`)}"
               style="font-size: 11px; color: #2563eb; text-decoration: none; font-weight: 600;">
              ${t('map.view_detail')} →
            </a>
          </div>
        `)
      })

      leafletRef.current = map
      setMapLoaded(true)

      // Fix map size after render
      setTimeout(() => map.invalidateSize(), 100)
    })

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }
    }
  }, [])

  return (
    <div class="relative">
      <div
        ref={mapRef}
        class="w-full rounded-2xl overflow-hidden border border-ocean-200 shadow-sm"
        style={{ height: '400px' }}
      />
      {!mapLoaded && (
        <div class="absolute inset-0 bg-ocean-100 rounded-2xl flex items-center justify-center">
          <p class="text-ocean-400 text-sm animate-pulse">Cargando mapa...</p>
        </div>
      )}
    </div>
  )
}
