import { z } from 'zod'

export const EnvironmentSchema = z.object({
  ACMELIA__CLOUDFLARE_API_TOKEN: z.string().trim().min(1),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(0).max(65_535).default(3000),
})

export type Environment = z.infer<typeof EnvironmentSchema>
export const environment: Environment = EnvironmentSchema.parse(process.env)
