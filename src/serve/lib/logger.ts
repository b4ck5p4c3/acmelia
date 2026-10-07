import { Logger, LogLevel } from 'tslog'

const level = process.env.LOG_LEVEL?.toUpperCase() ?? 'INFO'
const isLogLevel = (level: string): level is keyof typeof LogLevel => Object.hasOwn(LogLevel, level)

if (!isLogLevel(level)) {
  throw new Error(`Invalid LOG_LEVEL: ${level}`)
}

export const logger = new Logger({
  minLevel: LogLevel[level],
  pretty: {
    template: '{{dateIsoStr}}\t{{logLevelName}}\t',
    timeZone: 'UTC'
  },
})
