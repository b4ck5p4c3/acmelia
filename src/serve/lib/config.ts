import { readFileSync } from 'node:fs'
import { z } from 'zod'

export const ZoneConfigSchema = z.object({
  cloudflareZoneId: z.string().min(1),
  delegated: z.string().min(1).optional(),
  name: z.string().min(1).transform((s) => s.toLowerCase().replace(/\.$/, '')),
})

export const TokenConfigSchema = z.object({
  domains: z.array(z.string().min(1)).transform((array) => array.map((s) => s.toLowerCase().replace(/\.$/, ''))),
  id: z.string().min(1),
  secret: z.string().min(1),
})

export const AppConfigSchema = z.object({
  tokens: z.array(TokenConfigSchema),
  zones: z.array(ZoneConfigSchema).min(1, 'At least one entry is required in "zones"'),
})

export type AppConfig = z.infer<typeof AppConfigSchema>

export function loadConfig (path: string): AppConfig {
  const raw = Bun.YAML.parse(readFileSync(path, 'utf8'))
  const result = AppConfigSchema.safeParse(raw)
  if (!result.success) {
    throw new Error(`Invalid Acmelia config:\n${z.prettifyError(result.error)}`)
  }
  return result.data
}
