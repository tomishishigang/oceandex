import { href } from '../base'

export function NotFound() {
  return (
    <div class="px-4 py-16 text-center">
      <div class="text-6xl mb-4">🌊</div>
      <h2 class="text-xl font-bold text-ocean-800 mb-2">404</h2>
      <p class="text-ocean-500 mb-4">Página no encontrada</p>
      <a href={href("/")} class="text-ocean-600 underline text-sm">Volver al inicio</a>
    </div>
  )
}
