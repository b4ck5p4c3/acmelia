import { AppConfig } from './config'

export const CHALLENGE_PREFIX = '_acme-challenge.'

export interface Zone {
  cloudflareZoneId: string
  delegated?: string | undefined
  name: string
}

export class DnsTree {
  /**
   * Domains is a map of composite key "token_id:domain" to the target zone
   */
  private domains: Map<string, Zone> = new Map()

  constructor (config: AppConfig) {
    this.buildIndex(config)
  }

  /**
   * Generates the DNS-01 challenge record name for the given zone.
   * @param fqdn The fully qualified domain name for which to generate the DNS-01 challenge record name.
   * @param zone The zone for which to generate the DNS-01 challenge record name.
   * @returns The fully qualified domain name of the DNS-01 challenge record.
   */
  public static getChallengeRecord (fqdn: string, zone: Zone): string {
    const domain = zone.delegated ?? zone.name
    const target = fqdn.replace(new RegExp(String.raw`\.${zone.name}\.{0,1}$`), '')
    return `${target}.${domain}`
  }

  /**
   * Returns the composite key for the given token ID and domain.
   * @param tokenId The token ID for which to generate the composite key.
   * @param domain The domain for which to generate the composite key.
   * @returns
   */
  private static getKey (tokenId: string, domain: string): string {
    return `${tokenId}:${domain.toLowerCase()}`
  }

  /**
   * Retrieves the Zone corresponding to the given token ID and DNS-01 challenge record name.
   * @param tokenId The token ID associated with the DNS-01 challenge.
   * @param recordName The fully qualified domain name of the DNS-01 challenge record.
   * @returns The corresponding Zone if found, otherwise undefined.
   */
  public getZone (tokenId: string, recordName: string): undefined | Zone {
    const domain = extractChallengeDomain(recordName)
    if (!domain) {
      return undefined
    }

    // Truncate the domain to find the closest matching zone
    for (let index = 0; index < domain.split('.').length; index += 1) {
      const candidate = domain.split('.').slice(index).join('.')
      const key = DnsTree.getKey(tokenId, candidate)
      const zone = this.domains.get(key)
      if (zone) {
        return zone
      }
    }

    return undefined
  }

  /**
   * Builds an index of domains to their corresponding Zone
   * @param config Application configuration
   */
  private buildIndex (config: AppConfig): void {
    for (const token of config.tokens) {
      for (const domain of token.domains) {
        const key = DnsTree.getKey(token.id, domain)
        const zone = findClosestZone(domain, config.zones)
        if (!zone) {
          throw new Error(`No matching zone found for domain: ${domain}`)
        }

        this.domains.set(key, zone)
      }
    }
  }
}

/**
 * Extracts the certificate domain out of a DNS-01 challenge FQDN,
 * e.g. "_acme-challenge.mamont.int.bksp.in." -> "mamont.int.bksp.in".
 */
export function extractChallengeDomain (fqdn: string): string | undefined {
  const normalized = fqdn.replace(/\.$/, '').toLowerCase()
  return normalized.startsWith(CHALLENGE_PREFIX)
    ? normalized.replace(CHALLENGE_PREFIX, '')
    : undefined
}

/**
 * Find the closest matching zone for a given domain by iteratively checking each
 * subdomain level from the most specific to the least specific.
 * @param domain The domain for which to find the closest matching zone.
 * @param zones The list of available zone names to match against.
 * @returns The closest matching Zone, or undefined if no match is found.
 */
function findClosestZone (domain: string, zones: Zone[]): undefined | Zone {
  const parts = domain.split('.')
  for (let index = 0; index < parts.length; index += 1) {
    const candidate = parts.slice(index).join('.')
    const zone = zones.find(z => z.name === candidate)

    if (zone) {
      return zone
    }
  }

  return undefined
}
