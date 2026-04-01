import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

const scriptFieldSchema = z.record(z.string(), z.string())
const languageFieldSchema = z.record(z.string(), z.string())

export const workSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: scriptFieldSchema,
  translation: languageFieldSchema.nullable(),
  summary: languageFieldSchema.nullable().optional(),
  classification: z.string(),
  textShape: z.string(),
  featured: z.boolean().default(false),
})

export const worksResponseSchema = z.object({
  items: z.array(workSummarySchema),
})

export const structureNodeSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  nodeType: z.string(),
  title: scriptFieldSchema,
  translation: languageFieldSchema.nullable(),
  description: languageFieldSchema.nullable(),
  position: z.number().int(),
})

export const workDetailResponseSchema = z.object({
  work: workSummarySchema,
  sections: z.array(structureNodeSummarySchema),
})

export const passageDetailResponseSchema = z.object({
  passageId: z.string(),
  workSlug: z.string(),
  workTitle: z.string(),
  structureLabel: z.string(),
  locatorLabel: z.string(),
  originalText: z.string(),
  pageStart: z.number().int().nullable(),
  pageEnd: z.number().int().nullable(),
})

export const pangtiSearchItemSchema = z.object({
  passageId: z.string(),
  workSlug: z.string(),
  workTitle: z.string(),
  structureLabel: z.string(),
  locatorLabel: z.string(),
  originalText: z.string(),
  matchedBy: z.enum(['gurmukhi', 'latin-initials']),
  matchedInitials: z.string(),
  score: z.number(),
})

export const pangtiSearchQuerySchema = z.object({
  q: z.string().trim().min(1),
  work: z.string().trim().min(1).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().positive().max(50).default(20).optional(),
})

export const pangtiSearchResponseSchema = z.object({
  items: z.array(pangtiSearchItemSchema),
  nextCursor: z.string().nullable(),
  queryMeta: z.object({
    mode: z.enum(['gurmukhi', 'latin-initials']),
    normalizedQuery: z.string(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
})

export const errorResponseSchema = z.object({
  error: z.string(),
})

export type WorkSummary = z.infer<typeof workSummarySchema>
export type WorksResponse = z.infer<typeof worksResponseSchema>
export type StructureNodeSummary = z.infer<typeof structureNodeSummarySchema>
export type WorkDetailResponse = z.infer<typeof workDetailResponseSchema>
export type PassageDetailResponse = z.infer<typeof passageDetailResponseSchema>
export type PangtiSearchItem = z.infer<typeof pangtiSearchItemSchema>
export type PangtiSearchQuery = z.infer<typeof pangtiSearchQuerySchema>
export type PangtiSearchResponse = z.infer<typeof pangtiSearchResponseSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>

const registry = new OpenAPIRegistry()

registry.register('WorkSummary', workSummarySchema)
registry.register('WorksResponse', worksResponseSchema)
registry.register('StructureNodeSummary', structureNodeSummarySchema)
registry.register('WorkDetailResponse', workDetailResponseSchema)
registry.register('PassageDetailResponse', passageDetailResponseSchema)
registry.register('PangtiSearchItem', pangtiSearchItemSchema)
registry.register('PangtiSearchResponse', pangtiSearchResponseSchema)
registry.register('ErrorResponse', errorResponseSchema)

registry.registerPath({
  method: 'get',
  path: '/v1/works',
  responses: {
    200: {
      description: 'Curated work summaries',
      content: {
        'application/json': {
          schema: worksResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/works/{slug}',
  request: {
    params: z.object({
      slug: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Work detail',
      content: {
        'application/json': {
          schema: workDetailResponseSchema,
        },
      },
    },
    404: {
      description: 'Work not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/passages/{id}',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Passage detail',
      content: {
        'application/json': {
          schema: passageDetailResponseSchema,
        },
      },
    },
    404: {
      description: 'Passage not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/search/pangtis',
  request: {
    query: pangtiSearchQuerySchema,
  },
  responses: {
    200: {
      description: 'Global pangti search results',
      content: {
        'application/json': {
          schema: pangtiSearchResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

const generator = new OpenApiGeneratorV3(registry.definitions)

export const openApiDocument = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Giaan Khand Public API',
    version: '0.1.0',
  },
})
