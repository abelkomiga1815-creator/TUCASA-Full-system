import { API_BASE_URL } from "@/api/client"

/**
 * Resolves an image path returned by the API into a URL the browser can load.
 *
 * Profile pictures are stored as API-relative paths such as
 * "/api/files/profiles/<uuid>.jpg". Stored paths are relative to the *API*, not
 * to the frontend, so they must be prefixed with the API base URL whenever the
 * two are served from different origins (Vite dev server, Vercel frontend, ...).
 * Already absolute URLs and locally generated object URLs are returned as-is.
 */
export function imageUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}
