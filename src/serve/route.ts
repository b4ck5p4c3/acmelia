import { Router } from 'express'

import { AcmeProxyRequestDto } from './lib/acmeproxy.dto'
import { AppError } from './lib/app-error'
import { createAuthenticator } from './lib/auth'
import { CloudflareClient } from './lib/cloudflare'
import { AppConfig } from './lib/config'
import { DnsTree } from './lib/dns-tree'
import { environment } from './lib/environment'
import { logger } from './lib/logger'

export default function createRoutes (config: AppConfig): Router {
  const router = Router()
  const authenticate = createAuthenticator(config)

  const dnsTree = new DnsTree(config)
  const cloudflare = new CloudflareClient(environment.ACMELIA__CLOUDFLARE_API_TOKEN)

  router.post('/present', async (request, response) => {
    const tokenId = await authenticate(request)
    if (!tokenId) {
      throw new AppError(403, 'Invalid authorization header')
    }

    const body = AcmeProxyRequestDto.parse(request.body)
    const zone = dnsTree.getZone(tokenId, body.fqdn)
    if (!zone) {
      throw new AppError(403, 'Access forbidden')
    }

    const fqdn = DnsTree.getChallengeRecord(body.fqdn, zone)
    await cloudflare.createRecord(zone.cloudflareZoneId, fqdn, body.value)

    logger.info(`Response ${request.method} ${request.url} (${request.ip}): Created record for "${fqdn}"`)
    return response
      .status(200)
      .json(body)
  })

  router.post('/cleanup', async (request, response) => {
    const tokenId = await authenticate(request)
    if (!tokenId) {
      throw new AppError(403, 'Invalid authorization header')
    }

    const body = AcmeProxyRequestDto.parse(request.body)
    const zone = dnsTree.getZone(tokenId, body.fqdn)
    if (!zone) {
      throw new AppError(403, 'Access forbidden')
    }

    const fqdn = DnsTree.getChallengeRecord(body.fqdn, zone)
    await cloudflare.deleteRecord(zone.cloudflareZoneId, fqdn, body.value)

    logger.info(`Response ${request.method} ${request.url} (${request.ip}): Deleted record for "${fqdn}"`)
    return response
      .status(200)
      .json(body)
  })

  return router
}
