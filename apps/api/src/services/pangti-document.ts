import type { InferSelectModel } from 'drizzle-orm'

import {
  buildSearchDocumentFields,
  detectQueryMode,
  normalizeLatinInitialQuery,
  type QueryMode,
} from '@giaan-khand/search-core'

import { passageTexts, passages, structureNodes, works } from '../db/schema'

export type PangtiIndexRow = {
  passage: InferSelectModel<typeof passages>
  text: InferSelectModel<typeof passageTexts>
  structureNode: InferSelectModel<typeof structureNodes>
  work: InferSelectModel<typeof works>
}

export type PangtiDocument = {
  id: string
  passageId: string
  workSlug: string
  workTitle: string
  structureSlug: string
  structureLabel: string
  locatorLabel: string
  originalText: string
  normalizedText: string
  gurmukhiInitials: string
  latinInitials: string
  pageStart: number
  pageEnd: number
  workPosition: number
}

const toWorkTitle = (title: Record<string, string>, translation: Record<string, string> | null) =>
  title.Guru ?? title.Latn ?? translation?.en ?? 'Untitled'

const toStructureLabel = (
  title: Record<string, string>,
  translation: Record<string, string> | null,
  fallback: string,
) => title.Guru ?? title.Latn ?? translation?.en ?? fallback

const toLocatorLabel = (row: PangtiIndexRow) => {
  if (row.text.pageStart && row.text.pageEnd && row.text.pageStart !== row.text.pageEnd) {
    return `Pages ${row.text.pageStart}-${row.text.pageEnd}`
  }

  if (row.text.pageStart) {
    return `Page ${row.text.pageStart}`
  }

  if (row.text.page) {
    return `Page ${row.text.page}`
  }

  if (row.text.unitStart && row.text.unitEnd && row.text.unitStart !== row.text.unitEnd) {
    return `Units ${row.text.unitStart}-${row.text.unitEnd}`
  }

  if (row.text.unitStart) {
    return `Unit ${row.text.unitStart}`
  }

  return `Passage ${row.passage.position}`
}

export const buildPangtiDocument = (row: PangtiIndexRow): PangtiDocument => {
  const searchFields = buildSearchDocumentFields(row.text.body)

  return {
    id: row.text.id,
    passageId: row.passage.id,
    workSlug: row.work.slug,
    workTitle: toWorkTitle(row.work.title, row.work.translation),
    structureSlug: row.structureNode.slug,
    structureLabel: toStructureLabel(
      row.structureNode.title,
      row.structureNode.translation,
      row.structureNode.slug,
    ),
    locatorLabel: toLocatorLabel(row),
    originalText: row.text.body,
    normalizedText: searchFields.normalizedText,
    gurmukhiInitials: searchFields.gurmukhiInitials,
    latinInitials: searchFields.latinInitials,
    pageStart: row.text.pageStart ?? row.text.page ?? 0,
    pageEnd: row.text.pageEnd ?? row.text.page ?? 0,
    workPosition: row.passage.position,
  }
}

export const buildTypesenseQuery = (query: string) => {
  const mode = detectQueryMode(query)
  const normalizedQuery =
    mode === 'latin-initials' ? normalizeLatinInitialQuery(query) : buildSearchDocumentFields(query).normalizedText

  return {
    mode,
    normalizedQuery,
    queryBy: mode === 'latin-initials' ? 'latinInitials' : 'normalizedText',
    prefix: mode === 'latin-initials',
  } satisfies {
    mode: QueryMode
    normalizedQuery: string
    queryBy: 'latinInitials' | 'normalizedText'
    prefix: boolean
  }
}
