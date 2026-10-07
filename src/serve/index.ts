import { json } from 'body-parser'
import express from 'express'
import { type NextFunction, type Request, type Response } from 'express'
import { ZodError } from 'zod'

import { logger } from '@/serve/lib/logger'

import { AppError } from './lib/app-error'
import { loadConfig } from './lib/config'
import { environment } from './lib/environment'
import createRoutes from './route'

export function serve (configPath = 'acmelia.yaml'): void {
  const config = loadConfig(configPath)
  const router = createRoutes(config)

  const app = express()
  app.set('trust proxy', true)
  app.use(json())

  app.use(router)

  // Handle 404
  app.use((request, response, __) => {
    logger.warn(`Response ${request.method} ${request.url} (${request.ip}): Not Found`)
    return response
      .status(404)
      .json({ error: 'Not Found' })
  })

  // Handle errors
  app.use((error: Error, request: Request, response: Response, _: NextFunction) => {
    if (error instanceof AppError) {
      logger.warn(`Response ${request.method} ${request.url} (${request.ip}): ${error.errorMessage}`)
      return response
        .status(error.status)
        .json({ error: error.message })
    }

    if (error instanceof ZodError) {
      logger.warn(`Response ${request.method} ${request.url} (${request.ip}): Validation Error`)
      return response
        .status(400)
        .json({ error: 'Bad Request: Validation' })
    }

    logger.error(error)
    logger.warn(`Response ${request.method} ${request.url} (${request.ip}): Internal Server Error`)
    return response
      .status(500)
      .json({ error: 'Internal Server Error' })
  })

  const server = app.listen(environment.PORT, environment.HOST, () => {
    logger.info(`Acmelia is running at ${environment.HOST}:${environment.PORT}`)
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down...')
    server.close(() => {
      process.exit()
    })
  })
}
