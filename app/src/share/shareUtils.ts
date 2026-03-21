/** Check if Web Share API with files is supported */
export function canShareFiles(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
}

/** Share image via Web Share API (native share sheet) */
export async function shareImage(blob: Blob, title: string): Promise<boolean> {
  const file = new File([blob], 'dive-card.png', { type: 'image/png' })

  if (canShareFiles() && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title,
        files: [file],
      })
      return true
    } catch (e: any) {
      if (e.name === 'AbortError') return false // User cancelled
      throw e
    }
  }
  return false
}

/** Download image as file */
export function downloadImage(blob: Blob, filename = 'dive-card.png'): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
