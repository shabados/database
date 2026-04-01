import type { Route } from 'next'

export const buildSearchHref = (query: string): Route =>
  query.trim() ? (`/search?q=${encodeURIComponent(query.trim())}` as Route) : '/'

export const buildWorkHref = (slug: string, query?: string): Route => {
  const params = query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
  return `/works/${encodeURIComponent(slug)}${params}` as Route
}
