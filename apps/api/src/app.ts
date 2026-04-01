import cors from '@fastify/cors'
import Fastify from 'fastify'

import type { SearchService, WorkRepository } from './services/contracts'
import { registerV1Routes } from './routes/v1'

export const createApiApp = async (dependencies: {
  searchService: SearchService
  workRepository: WorkRepository
}) => {
  const app = Fastify({
    logger: false,
  })

  await app.register(cors, {
    origin: true,
  })

  app.get('/health', async () => ({ ok: true }))

  await registerV1Routes(app, dependencies)

  return app
}

