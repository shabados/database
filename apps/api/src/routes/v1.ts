import type { FastifyInstance, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

import {
  errorResponseSchema,
  openApiDocument,
  pangtiSearchQuerySchema,
} from '@giaan-khand/contracts'

import type { SearchService, WorkRepository } from '../services/contracts'

const sendBadRequest = (reply: FastifyReply, error: Error) =>
  reply.status(400).send(errorResponseSchema.parse({ error: error.message }))

const sendNotFound = (reply: FastifyReply, message: string) =>
  reply.status(404).send(errorResponseSchema.parse({ error: message }))

export const registerV1Routes = async (
  app: FastifyInstance,
  dependencies: {
    searchService: SearchService
    workRepository: WorkRepository
  },
) => {
  app.get('/openapi.json', async () => openApiDocument)

  app.get('/v1/works', async (_request, reply) => {
    const payload = await dependencies.workRepository.listWorks()
    return reply.send(payload)
  })

  app.get('/v1/works/:slug', async (request, reply) => {
    const slug = String((request.params as { slug: string }).slug)
    const payload = await dependencies.workRepository.getWorkDetail(slug)

    if (!payload) {
      return sendNotFound(reply, 'Work not found')
    }

    return reply.send(payload)
  })

  app.get('/v1/passages/:id', async (request, reply) => {
    const id = String((request.params as { id: string }).id)
    const payload = await dependencies.workRepository.getPassageDetail(id)

    if (!payload) {
      return sendNotFound(reply, 'Passage not found')
    }

    return reply.send(payload)
  })

  app.get('/v1/search/pangtis', async (request, reply) => {
    try {
      const query = pangtiSearchQuerySchema.parse(request.query)
      const payload = await dependencies.searchService.searchPangtis(query)

      return reply.send(payload)
    } catch (error) {
      if (error instanceof ZodError) {
        return sendBadRequest(reply, new Error(error.issues.map((issue) => issue.message).join('; ')))
      }

      throw error
    }
  })
}
