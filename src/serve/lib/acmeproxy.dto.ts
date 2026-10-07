import { z } from 'zod'

export const AcmeProxyRequestDto = z.object({
  fqdn: z.string()
    .min(1)
    .describe('Fully qualified domain name of the DNS-01 challenge record, e.g. "_acme-challenge.example.com"'),
  value: z.string()
    .min(1)
    .describe('TXT record content, i.e. the ACME DNS-01 key authorization digest'),
})

export const AcmeProxyResponseDto = z.object({
  fqdn: z.string(),
  value: z.string(),
})
