import 'dotenv/config'

import { and, asc, eq } from 'drizzle-orm'
import Typesense from 'typesense'
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'

import { createProductDatabaseClient } from '../db/client'
import { passageTexts, passages, structureNodes, works } from '../db/schema'
import { buildPangtiDocument } from '../services/pangti-document'

const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST ?? 'localhost',
      port: Number(process.env.TYPESENSE_PORT ?? '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY ?? 'xyz',
  connectionTimeoutSeconds: 10,
})

const COLLECTION_NAME = 'pangtis'

const db = createProductDatabaseClient()

const schema: CollectionCreateSchema = {
  name: COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'passageId', type: 'string' },
    { name: 'workSlug', type: 'string', facet: true },
    { name: 'workTitle', type: 'string' },
    { name: 'structureSlug', type: 'string' },
    { name: 'structureLabel', type: 'string' },
    { name: 'locatorLabel', type: 'string' },
    { name: 'originalText', type: 'string' },
    { name: 'normalizedText', type: 'string' },
    { name: 'gurmukhiInitials', type: 'string' },
    { name: 'latinInitials', type: 'string' },
    { name: 'pageStart', type: 'int32', optional: true },
    { name: 'pageEnd', type: 'int32', optional: true },
    { name: 'workPosition', type: 'int32' },
  ],
  default_sorting_field: 'workPosition',
}

try {
  await client.collections(COLLECTION_NAME).retrieve()
} catch {
  await client.collections().create(schema)
}

const rows = await db
  .select({
    passage: passages,
    text: passageTexts,
    structureNode: structureNodes,
    work: works,
  })
  .from(passageTexts)
  .innerJoin(passages, eq(passages.id, passageTexts.passageId))
  .innerJoin(structureNodes, eq(structureNodes.id, passages.structureNodeId))
  .innerJoin(works, eq(works.id, passages.workId))
  .where(and(eq(passageTexts.contentRole, 'original'), eq(passageTexts.scriptCode, 'Guru')))
  .orderBy(asc(passageTexts.id))

const documents = rows.map(buildPangtiDocument)

await client.collections(COLLECTION_NAME).documents().import(documents, {
  action: 'upsert',
})

console.log(`Indexed ${documents.length} pangtis into ${COLLECTION_NAME}.`)
