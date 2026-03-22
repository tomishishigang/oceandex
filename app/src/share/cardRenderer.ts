import type { CardLayout } from './cardLayouts'
import type { DiveSession } from '../db/types'
import type { Species } from '../data/types'
import { locale } from '../hooks/useLocale'

export type BackgroundStyle = 'ocean' | 'deep' | 'night' | 'photo'
export type CardStyle = 'full' | 'minimal'

interface CardData {
  session: DiveSession
  speciesList: Species[]
  speciesCount: number
  badgeCount: number
  backgroundStyle: BackgroundStyle
  cardStyle: CardStyle
  backgroundPhoto?: Blob | null
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

const BACKGROUNDS: Record<BackgroundStyle, { stops: [number, string][] }> = {
  ocean: {
    stops: [[0, '#042f2e'], [0.4, '#115e59'], [0.7, '#0f766e'], [1, '#0d9488']],
  },
  deep: {
    stops: [[0, '#0c1445'], [0.4, '#1e3a8a'], [0.7, '#1d4ed8'], [1, '#3b82f6']],
  },
  night: {
    stops: [[0, '#0a0a0a'], [0.3, '#1a1a2e'], [0.7, '#16213e'], [1, '#0f3460']],
  },
  photo: {
    stops: [[0, '#042f2e'], [1, '#0d9488']], // fallback if no photo
  },
}

export async function renderCard(
  layout: CardLayout,
  data: CardData,
): Promise<Blob> {
  const { width, height, padding } = layout
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  const isEs = locale.value === 'es'
  const isMinimal = data.cardStyle === 'minimal'

  // === Background ===
  if (data.backgroundStyle === 'photo' && data.backgroundPhoto) {
    // User photo as background
    const bgBitmap = await createImageBitmap(data.backgroundPhoto)
    // Cover the canvas
    const scale = Math.max(width / bgBitmap.width, height / bgBitmap.height)
    const sw = width / scale
    const sh = height / scale
    const sx = (bgBitmap.width - sw) / 2
    const sy = (bgBitmap.height - sh) / 2
    ctx.drawImage(bgBitmap, sx, sy, sw, sh, 0, 0, width, height)
    bgBitmap.close()

    // Dark overlay for text readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(0, 0, width, height)

    // Subtle gradient overlay at bottom
    const bottomGrad = ctx.createLinearGradient(0, height * 0.6, 0, height)
    bottomGrad.addColorStop(0, 'rgba(0,0,0,0)')
    bottomGrad.addColorStop(1, 'rgba(0,0,0,0.4)')
    ctx.fillStyle = bottomGrad
    ctx.fillRect(0, 0, width, height)
  } else {
    // Gradient background
    const bg = BACKGROUNDS[data.backgroundStyle]
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    for (const [stop, color] of bg.stops) {
      gradient.addColorStop(stop, color)
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Decorative wave pattern
    ctx.globalAlpha = 0.06
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < 4; i++) {
      const y = height * 0.2 + i * 140
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= width; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.008 + i * 1.5) * 40)
      }
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  let cursorY = padding + 20

  // === Wave emoji ===
  ctx.font = `${layout.titleSize + 10}px system-ui`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText('🌊', width / 2, cursorY + layout.titleSize)
  cursorY += layout.titleSize + 24

  // === Dive site name ===
  ctx.font = `bold ${layout.titleSize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(data.session.siteName, width / 2, cursorY + layout.titleSize)
  cursorY += layout.titleSize + 16

  // === Date ===
  ctx.font = `${layout.subtitleSize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  const dateStr = new Date(data.session.date + 'T12:00:00').toLocaleDateString(
    isEs ? 'es-CL' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )
  ctx.fillText(dateStr, width / 2, cursorY + layout.subtitleSize)
  cursorY += layout.subtitleSize + 40

  // === Conditions pills ===
  {
    const conditions: string[] = []
    if (data.session.maxDepthM != null) conditions.push(`🌊 ${data.session.maxDepthM}m`)
    if (data.session.waterTempC != null) conditions.push(`🌡️ ${data.session.waterTempC}°C`)
    if (data.session.visibilityM != null) conditions.push(`👁 ${data.session.visibilityM}m`)

    if (conditions.length > 0) {
      ctx.font = `${layout.bodySize}px system-ui, -apple-system, sans-serif`
      const condText = conditions.join('   ')
      const textWidth = ctx.measureText(condText).width
      const pillW = textWidth + 60
      const pillH = layout.bodySize + 30
      const pillX = (width - pillW) / 2

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      roundRect(ctx, pillX, cursorY, pillW, pillH, pillH / 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.textAlign = 'center'
      ctx.fillText(condText, width / 2, cursorY + pillH - 12)
      cursorY += pillH + 40
    } else {
      cursorY += 20
    }
  }

  // === Minimal: show notes if available, then skip to branding ===
  if (isMinimal) {
    if (data.session.notes) {
      ctx.font = `italic ${layout.bodySize}px system-ui, -apple-system, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.textAlign = 'center'
      // Truncate long notes
      const notesText = data.session.notes.length > 80
        ? data.session.notes.slice(0, 77) + '...'
        : data.session.notes
      ctx.fillText(`"${notesText}"`, width / 2, cursorY + layout.bodySize)
      cursorY += layout.bodySize + 20
    }

    // Skip species grid, count, and badges — go straight to branding
    const brandY = height - padding
    ctx.font = `bold ${layout.bodySize}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.textAlign = 'center'
    ctx.fillText(
      `${isEs ? 'Registrado con' : 'Logged with'} Oceandex 🌊`,
      width / 2,
      brandY,
    )
    return canvas.convertToBlob({ type: 'image/png' })
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
    ctx.fillStyle = '#fde047'
    ctx.fillText(
      `🏆 ${data.badgeCount} ${isEs ? 'logros obtenidos' : 'badges earned'}`,
      width / 2,
      cursorY + layout.bodySize,
    )
    cursorY += layout.bodySize + 20
  }

  // === Branding ===
  const brandY = height - padding
  ctx.font = `bold ${layout.bodySize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'center'
  ctx.fillText(
    `${isEs ? 'Registrado con' : 'Logged with'} Oceandex 🌊`,
    width / 2,
    brandY,
  )

  return canvas.convertToBlob({ type: 'image/png' })
}
