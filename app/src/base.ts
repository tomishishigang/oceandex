/** Base path for the app — "/oceandex" on GitHub Pages, "" locally */
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Prepend base path to a route */
export function href(path: string): string {
  return `${BASE}${path}`
}

/** Strip base path from a location pathname for route matching */
export function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) {
    return pathname.slice(BASE.length) || '/'
  }
  return pathname
}
