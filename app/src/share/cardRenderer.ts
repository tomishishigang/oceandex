import type { CardLayout } from './cardLayouts'
import type { DiveSession } from '../db/types'
import type { Species } from '../data/types'
import { locale } from '../hooks/useLocale'

interface CardData {
  session: DiveSession
  speciesList: Species[]
  speciesCount: number
  badgeCount: number
}

/** Load an image from URL, returns null on failure */
async function loadImage(url: string): Promise<ImageBitmap | null> {
  try {
    const resp = await fetch(url, { mode: 'cors' })
    const blob = await resp.blob()
    return createImageBitmap(blob)
  } catch {
    return null
  }
}

/** Draw a rounded rectangle path */
function roundRect(
  ctx: OffscreenCanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export async function renderCard(
  layout: CardLayout,
  data: CardData,
): Promise<Blob> {
  const { width, height, padding } = layout
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  const isEs = locale.value === 'es'

  // === Background gradient ===
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#042f2e')   // ocean-950
  gradient.addColorStop(0.4, '#115e59') // ocean-800
  gradient.addColorStop(0.7, '#0f766e') // ocean-700
  gradient.addColorStop(1, '#0d9488')   // ocean-600
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // === Decorative wave pattern ===
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 5; i++) {
    const y = height * 0.15 + i * 120
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= width; x += 10) {
      ctx.lineTo(x, y + Math.sin(x * 0.01 + i * 2) * 30)
    }
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  let cursorY = padding

  // === Wave emoji + App title ===
  ctx.font = `bold ${layout.titleSize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText('🌊', width / 2, cursorY + layout.titleSize)
  cursorY += layout.titleSize + 20

  // === Dive site name ===
  ctx.font = `bold ${layout.titleSize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(data.session.siteName, width / 2, cursorY + layout.titleSize)
  cursorY += layout.titleSize + 16

  // === Date ===
  ctx.font = `${layout.subtitleSize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#99f6e4' // ocean-200
  const dateStr = new Date(data.session.date + 'T12:00:00').toLocaleDateString(
    isEs ? 'es-CL' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )
  ctx.fillText(dateStr, width / 2, cursorY + layout.subtitleSize)
  cursorY += layout.subtitleSize + 40

  // === Conditions pills ===
  const conditions: string[] = []
  if (data.session.maxDepthM != null) conditions.push(`🌊 ${data.session.maxDepthM}m`)
  if (data.session.waterTempC != null) conditions.push(`🌡️ ${data.session.waterTempC}°C`)
  if (data.session.visibilityM != null) conditions.push(`👁 ${data.session.visibilityM}m`)
  if (data.session.current) {
    const labels: Record<string, string> = { none: '⚡ Calm', light: '⚡ Light', moderate: '⚡ Mod', strong: '⚡ Strong' }
    conditions.push(labels[data.session.current] ?? '')
  }

  if (conditions.length > 0) {
    ctx.font = `${layout.bodySize}px system-ui, -apple-system, sans-serif`
    const condText = conditions.join('   ')

    // Draw pill background
    const textWidth = ctx.measureText(condText).width
    const pillW = textWidth + 60
    const pillH = layout.bodySize + 30
    const pillX = (width - pillW) / 2

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, pillX, cursorY, pillW, pillH, pillH / 2)
    ctx.fill()

    ctx.fillStyle = '#ccfbf1' // ocean-100
    ctx.textAlign = 'center'
    ctx.fillText(condText, width / 2, cursorY + pillH - 12)
    cursorY += pillH + 40
  }

  // === Species photo grid ===
  const { photoGridSize, photoGap, photoCols, photoRows } = layout
  const maxPhotos = photoCols * photoRows
  const speciesWithPhotos = data.speciesList.filter(s => s.primary_photo?.url_medium)
  const photosToShow = speciesWithPhotos.slice(0, maxPhotos)

  if (photosToShow.length > 0) {
    const gridW = photoCols * photoGridSize + (photoCols - 1) * photoGap
    const startX = (width - gridW) / 2

    // Load images in parallel
    const images = await Promise.all(
      photosToShow.map(s => loadImage(s.primary_photo!.url_medium!))
    )

    for (let i = 0; i < images.length; i++) {
      const col = i % photoCols
      const row = Math.floor(i / photoCols)
      const x = startX + col * (photoGridSize + photoGap)
      const y = cursorY + row * (photoGridSize + photoGap)

      // Draw rounded photo
      roundRect(ctx, x, y, photoGridSize, photoGridSize, 20)
      ctx.save()
      ctx.clip()

      if (images[i]) {
        ctx.drawImage(images[i]!, x, y, photoGridSize, photoGridSize)
      } else {
        // Fallback color
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(x, y, photoGridSize, photoGridSize)
        ctx.font = `${photoGridSize * 0.4}px system-ui`
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.textAlign = 'center'
        ctx.fillText('🐟', x + photoGridSize / 2, y + photoGridSize * 0.65)
      }

      ctx.restore()
    }

    const totalRows = Math.ceil(photosToShow.length / photoCols)
    cursorY += totalRows * (photoGridSize + photoGap) + 30
  }

  // === Species count ===
  ctx.font = `bold ${layout.subtitleSize + 8}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText(
    `${data.speciesCount} ${isEs ? 'especies avistadas' : 'species spotted'}`,
    width / 2,
    cursorY + layout.subtitleSize,
  )
  cursorY += layout.subtitleSize + 24

  // === Badges ===
  if (data.badgeCount > 0) {
    ctx.font = `${layout.bodySize}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = '#fde047' // sand-300
    ctx.fillText(
      `🏆 ${data.badgeCount} ${isEs ? 'logros obtenidos' : 'badges earned'}`,
      width / 2,
      cursorY + layout.bodySize,
    )
    cursorY += layout.bodySize + 20
  }

  // === Branding at bottom ===
  const brandY = height - padding
  ctx.font = `bold ${layout.bodySize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.textAlign = 'center'
  ctx.fillText(
    `${isEs ? 'Registrado con' : 'Logged with'} Oceandex 🌊`,
    width / 2,
    brandY,
  )

  // === Export as PNG ===
  return canvas.convertToBlob({ type: 'image/png' })
}
