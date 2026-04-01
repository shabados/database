import { asc, sql } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Metadata } from '../../../../archive/src/types'

import { archiveSchema, type ArchiveDatabaseClient } from '../lib/archive-source'
import type { ProductDatabaseClient } from './client'
import { passageTexts, passages, structureNodes, works } from './schema'

const DEFAULT_BATCH_SIZE = Number(process.env.PRODUCT_IMPORT_BATCH_SIZE ?? 2_000)
const DEFAULT_WORK_BATCH_SIZE = Number(process.env.PRODUCT_IMPORT_WORK_BATCH_SIZE ?? 5_000)
const DEFAULT_STRUCTURE_NODE_BATCH_SIZE = Number(
  process.env.PRODUCT_IMPORT_STRUCTURE_NODE_BATCH_SIZE ?? 5_000,
)
const DEFAULT_PASSAGE_BATCH_SIZE = Number(process.env.PRODUCT_IMPORT_PASSAGE_BATCH_SIZE ?? 5_000)
const DEFAULT_PASSAGE_TEXT_BATCH_SIZE = Number(
  process.env.PRODUCT_IMPORT_PASSAGE_TEXT_BATCH_SIZE ?? 3_000,
)

type ImportStats = {
  works: number
  structureNodes: number
  passages: number
  passageTexts: number
}

type TableConfig<TRow, TInsert> = {
  label: keyof ImportStats
  readBatch: (offset: number, limit: number) => Promise<TRow[]>
  writeBatch: (rows: TInsert[]) => Promise<void>
  mapRow: (row: TRow) => TInsert
}

type ArchiveWorkRow = InferSelectModel<typeof archiveSchema.works>
type ArchiveStructureNodeRow = InferSelectModel<typeof archiveSchema.structureNodes>
type ArchivePassageRow = InferSelectModel<typeof archiveSchema.passages>
type ArchivePassageTextRow = {
  id: string
  passageId: string
  witnessId: string
  slug: string
  contentRole: string
  languageCode: string | null
  scriptCode: string | null
  body: string
  position: number
  page: number | null
  pageStart: number | null
  pageEnd: number | null
  folio: string | null
  folioStart: string | null
  folioEnd: string | null
  localIndex: number | null
  unitStart: number | null
  unitEnd: number | null
  metadata: Metadata | null
}

const upsertWorks = async (
  db: ProductDatabaseClient,
  rows: InferInsertModel<typeof works>[],
) => {
  if (!rows.length) {
    return
  }

  await db
    .insert(works)
    .values(rows)
    .onConflictDoUpdate({
      target: works.id,
      set: {
        slug: works.slug,
        title: works.title,
        translation: works.translation,
        classification: works.classification,
        textShape: works.textShape,
        summary: works.summary,
        metadata: works.metadata,
      },
    })
}

const upsertStructureNodes = async (
  db: ProductDatabaseClient,
  rows: InferInsertModel<typeof structureNodes>[],
) => {
  if (!rows.length) {
    return
  }

  await db
    .insert(structureNodes)
    .values(rows)
    .onConflictDoUpdate({
      target: structureNodes.id,
      set: {
        workId: structureNodes.workId,
        parentId: structureNodes.parentId,
        slug: structureNodes.slug,
        nodeType: structureNodes.nodeType,
        title: structureNodes.title,
        translation: structureNodes.translation,
        description: structureNodes.description,
        position: structureNodes.position,
        metadata: structureNodes.metadata,
      },
    })
}

const upsertPassages = async (
  db: ProductDatabaseClient,
  rows: InferInsertModel<typeof passages>[],
) => {
  if (!rows.length) {
    return
  }

  await db
    .insert(passages)
    .values(rows)
    .onConflictDoUpdate({
      target: passages.id,
      set: {
        workId: passages.workId,
        structureNodeId: passages.structureNodeId,
        slug: passages.slug,
        passageType: passages.passageType,
        position: passages.position,
        reference: passages.reference,
        metadata: passages.metadata,
      },
    })
}

const upsertPassageTexts = async (
  db: ProductDatabaseClient,
  rows: InferInsertModel<typeof passageTexts>[],
) => {
  if (!rows.length) {
    return
  }

  await db
    .insert(passageTexts)
    .values(rows)
    .onConflictDoUpdate({
      target: passageTexts.id,
      set: {
        passageId: passageTexts.passageId,
        witnessId: passageTexts.witnessId,
        slug: passageTexts.slug,
        contentRole: passageTexts.contentRole,
        languageCode: passageTexts.languageCode,
        scriptCode: passageTexts.scriptCode,
        body: passageTexts.body,
        position: passageTexts.position,
        page: passageTexts.page,
        pageStart: passageTexts.pageStart,
        pageEnd: passageTexts.pageEnd,
        folio: passageTexts.folio,
        folioStart: passageTexts.folioStart,
        folioEnd: passageTexts.folioEnd,
        localIndex: passageTexts.localIndex,
        unitStart: passageTexts.unitStart,
        unitEnd: passageTexts.unitEnd,
        metadata: passageTexts.metadata,
      },
    })
}

const importTable = async <TRow, TInsert>(
  config: TableConfig<TRow, TInsert>,
  batchSize = DEFAULT_BATCH_SIZE,
) => {
  let offset = 0
  let total = 0

  for (;;) {
    const rows = await config.readBatch(offset, batchSize)

    if (!rows.length) {
      console.log(`[import] ${config.label}: ${total}`)
      return total
    }

    await config.writeBatch(rows.map(config.mapRow))

    total += rows.length
    offset += rows.length

    if (total % (batchSize * 5) === 0) {
      console.log(`[import] ${config.label}: ${total}`)
    }
  }
}

export const importArchiveIntoProductDb = async (
  archiveDb: ArchiveDatabaseClient,
  productDb: ProductDatabaseClient,
  batchSize = DEFAULT_BATCH_SIZE,
): Promise<ImportStats> => {
  const stats: ImportStats = {
    works: 0,
    structureNodes: 0,
    passages: 0,
    passageTexts: 0,
  }

  stats.works = await importTable<ArchiveWorkRow, InferInsertModel<typeof works>>(
    {
      label: 'works',
      readBatch: (offset, limit) =>
        archiveDb
          .select()
          .from(archiveSchema.works)
          .orderBy(asc(archiveSchema.works.slug))
          .limit(limit)
          .offset(offset),
      writeBatch: (rows) => upsertWorks(productDb, rows),
      mapRow: (row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        translation: row.translation,
        classification: row.classification,
        textShape: row.textShape,
        summary: row.summary,
        metadata: row.metadata,
      }),
    },
    Math.min(batchSize, DEFAULT_WORK_BATCH_SIZE),
  )

  stats.structureNodes = await importTable<
    ArchiveStructureNodeRow,
    InferInsertModel<typeof structureNodes>
  >(
    {
      label: 'structureNodes',
      readBatch: (offset, limit) =>
        archiveDb
          .select()
          .from(archiveSchema.structureNodes)
          .orderBy(asc(archiveSchema.structureNodes.id))
          .limit(limit)
          .offset(offset),
      writeBatch: (rows) => upsertStructureNodes(productDb, rows),
      mapRow: (row) => ({
        id: row.id,
        workId: row.workId,
        parentId: row.parentId,
        slug: row.slug,
        nodeType: row.nodeType,
        title: row.title,
        translation: row.translation,
        description: row.description,
        position: row.position,
        metadata: row.metadata,
      }),
    },
    Math.min(batchSize, DEFAULT_STRUCTURE_NODE_BATCH_SIZE),
  )

  stats.passages = await importTable<ArchivePassageRow, InferInsertModel<typeof passages>>(
    {
      label: 'passages',
      readBatch: (offset, limit) =>
        archiveDb
          .select()
          .from(archiveSchema.passages)
          .orderBy(asc(archiveSchema.passages.id))
          .limit(limit)
          .offset(offset),
      writeBatch: (rows) => upsertPassages(productDb, rows),
      mapRow: (row) => ({
        id: row.id,
        workId: row.workId,
        structureNodeId: row.structureNodeId,
        slug: row.slug,
        passageType: row.passageType,
        position: row.position,
        reference: row.reference,
        metadata: row.metadata,
      }),
    },
    Math.min(batchSize, DEFAULT_PASSAGE_BATCH_SIZE),
  )

  stats.passageTexts = await importTable<
    ArchivePassageTextRow,
    InferInsertModel<typeof passageTexts>
  >(
    {
      label: 'passageTexts',
      readBatch: (offset, limit) =>
        archiveDb
          .select({
            id: archiveSchema.passageTexts.id,
            passageId: archiveSchema.passageTexts.passageId,
            witnessId: archiveSchema.passageTexts.witnessId,
            slug: archiveSchema.passageTexts.slug,
            contentRole: archiveSchema.passageTexts.contentRole,
            languageCode: archiveSchema.passageTexts.languageCode,
            scriptCode: archiveSchema.passageTexts.scriptCode,
            body: archiveSchema.passageTexts.body,
            position: archiveSchema.passageTexts.position,
            page: archiveSchema.passageTexts.page,
            pageStart: sql<number | null>`null`.as('page_start'),
            pageEnd: sql<number | null>`null`.as('page_end'),
            folio: archiveSchema.passageTexts.folio,
            folioStart: sql<string | null>`null`.as('folio_start'),
            folioEnd: sql<string | null>`null`.as('folio_end'),
            localIndex: archiveSchema.passageTexts.localIndex,
            unitStart: sql<number | null>`null`.as('unit_start'),
            unitEnd: sql<number | null>`null`.as('unit_end'),
            metadata: archiveSchema.passageTexts.metadata,
          })
          .from(archiveSchema.passageTexts)
          .orderBy(asc(archiveSchema.passageTexts.id))
          .limit(limit)
          .offset(offset),
      writeBatch: (rows) => upsertPassageTexts(productDb, rows),
      mapRow: (row) => ({
        id: row.id,
        passageId: row.passageId,
        witnessId: row.witnessId,
        slug: row.slug,
        contentRole: row.contentRole,
        languageCode: row.languageCode,
        scriptCode: row.scriptCode,
        body: row.body,
        position: row.position,
        page: row.page,
        pageStart: row.pageStart,
        pageEnd: row.pageEnd,
        folio: row.folio,
        folioStart: row.folioStart,
        folioEnd: row.folioEnd,
        localIndex: row.localIndex,
        unitStart: row.unitStart,
        unitEnd: row.unitEnd,
        metadata: row.metadata,
      }),
    },
    Math.min(batchSize, DEFAULT_PASSAGE_TEXT_BATCH_SIZE),
  )

  return stats
}
