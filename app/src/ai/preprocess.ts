const VISION_SIZE = 299

/** Resize image to 299x299 squashed JPEG for iNaturalist CV API */
export async function preprocessForVision(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  const canvas = new OffscreenCanvas(VISION_SIZE, VISION_SIZE)
  const ctx = canvas.getContext('2d')!
  // Squash to 299x299 (iNat expects this exact size)
  ctx.drawImage(bitmap, 0, 0, VISION_SIZE, VISION_SIZE)
  bitmap.close()

  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
}

/** Convert blob to base64 data URL for preview */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
