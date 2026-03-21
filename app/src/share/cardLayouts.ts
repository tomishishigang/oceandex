export interface CardLayout {
  width: number
  height: number
  padding: number
  titleSize: number
  subtitleSize: number
  bodySize: number
  smallSize: number
  photoGridSize: number
  photoGap: number
  photoCols: number
  photoRows: number
}

export const STORY_LAYOUT: CardLayout = {
  width: 1080,
  height: 1920,
  padding: 80,
  titleSize: 64,
  subtitleSize: 36,
  bodySize: 32,
  smallSize: 24,
  photoGridSize: 280,
  photoGap: 16,
  photoCols: 3,
  photoRows: 2,
}

export const SQUARE_LAYOUT: CardLayout = {
  width: 1080,
  height: 1080,
  padding: 80,
  titleSize: 56,
  subtitleSize: 32,
  bodySize: 28,
  smallSize: 22,
  photoGridSize: 200,
  photoGap: 12,
  photoCols: 3,
  photoRows: 1,
}
