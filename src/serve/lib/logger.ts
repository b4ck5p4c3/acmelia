import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: {
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    },
    target: 'pino-pretty',
  },
})

export function serializeError (error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack
    }
  }

  return {
    message: typeof error === 'string' ? error : 'Non-Error value thrown',
    name: typeof error
  }
}
