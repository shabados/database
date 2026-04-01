import { and, asc, eq, isNull, type InferSelectModel } from 'drizzle-orm'

import type {
  PassageDetailResponse,
  WorkDetailResponse,
  WorksResponse,
} from '@giaan-khand/contracts'

import type { ProductDatabaseClient } from './client'
import { passageTexts, passages, structureNodes, works } from './schema'

const FEATURED_WORKS = ['guru-granth-sahib', 'dasam-granth', 'varan', 'divan-i-goya']

const getDisplayText = (
  value: Record<string, string> | null | undefined,
  fallbacks: Array<string | null | undefined>,
) => {
  if (value?.Guru) {
    return value.Guru
  }

  if (value?.Latn) {
    return value.Latn
  }

  for (const fallback of fallbacks) {
    if (fallback) {
      return fallback
    }
  }

  return ''
}

const toWorkSummary = (
  row: InferSelectModel<typeof works>,
  featured: boolean,
): WorksResponse['items'][number] => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  translation: row.translation,
  summary: row.summary,
  classification: row.classification,
  textShape: row.textShape,
  featured,
})

const toLocatorLabel = (row: InferSelectModel<typeof passageTexts>, passagePosition: number) => {
  if (row.pageStart && row.pageEnd && row.pageStart !== row.pageEnd) {
    return `Pages ${row.pageStart}-${row.pageEnd}`
  }

  if (row.pageStart) {
    return `Page ${row.pageStart}`
  }

  if (row.page) {
    return `Page ${row.page}`
  }

  if (row.unitStart && row.unitEnd && row.unitStart !== row.unitEnd) {
    return `Units ${row.unitStart}-${row.unitEnd}`
  }

  if (row.unitStart) {
    return `Unit ${row.unitStart}`
  }

  return `Passage ${passagePosition}`
}

export const createPostgresWorkRepository = (db: ProductDatabaseClient) => ({
  async listWorks(): Promise<WorksResponse> {
    const rows = await db.select().from(works).orderBy(asc(works.slug))

    const featured = FEATURED_WORKS.flatMap((slug) => rows.find((row) => row.slug === slug) ?? [])
    const remaining = rows.filter((row) => !FEATURED_WORKS.includes(row.slug))

    return {
      items: [...featured, ...remaining].map((row) =>
        toWorkSummary(row, FEATURED_WORKS.includes(row.slug)),
      ),
    }
  },

  async getWorkDetail(slug: string): Promise<WorkDetailResponse | null> {
    const work = await db
      .select()
      .from(works)
      .where(eq(works.slug, slug))
      .limit(1)
      .then((rows) => rows[0] ?? null)

    if (!work) {
      return null
    }

    const sections = await db
      .select()
      .from(structureNodes)
      .where(and(eq(structureNodes.workId, work.id), isNull(structureNodes.parentId)))
      .orderBy(asc(structureNodes.position))

    return {
      work: toWorkSummary(work, FEATURED_WORKS.includes(work.slug)),
      sections: sections.map((section) => ({
        id: section.id,
        slug: section.slug,
        nodeType: section.nodeType,
        title: section.title,
        translation: section.translation,
        description: section.description,
        position: section.position,
      })),
    }
  },

  async getPassageDetail(id: string): Promise<PassageDetailResponse | null> {
    const row = await db
      .select({
        passage: passages,
        text: passageTexts,
        structureNode: structureNodes,
        work: works,
      })
      .from(passages)
      .innerJoin(
        passageTexts,
        and(eq(passageTexts.passageId, passages.id), eq(passageTexts.contentRole, 'original')),
      )
      .innerJoin(structureNodes, eq(structureNodes.id, passages.structureNodeId))
      .innerJoin(works, eq(works.id, passages.workId))
      .where(eq(passages.id, id))
      .orderBy(asc(passageTexts.position))
      .limit(1)
      .then((rows) => rows[0] ?? null)

    if (!row) {
      return null
    }

    return {
      passageId: row.passage.id,
      workSlug: row.work.slug,
      workTitle: getDisplayText(row.work.title, [row.work.translation?.en, row.work.slug]),
      structureLabel: getDisplayText(row.structureNode.title, [
        row.structureNode.translation?.en,
        row.structureNode.slug,
      ]),
      locatorLabel: toLocatorLabel(row.text, row.passage.position),
      originalText: row.text.body,
      pageStart: row.text.pageStart ?? row.text.page ?? null,
      pageEnd: row.text.pageEnd ?? row.text.page ?? null,
    }
  },
})
