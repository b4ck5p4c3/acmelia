import { describe, expect, test } from 'bun:test'

import type { AppConfig } from './config'
import type { Zone } from './dns-tree'

import { DnsTree, extractChallengeDomain } from './dns-tree'

const makeZone = (name: string): Zone => ({
  cloudflareZoneId: `zone-${name}`,
  name,
})

const makeConfig = (domains: string[], zones: Zone[]): AppConfig => ({
  tokens: [{ domains, id: 'token-1', secret: 'secret' }],
  zones,
})

describe('extractChallengeDomain', () => {
  test('extracts the domain and normalizes case and a trailing dot', () => {
    expect(extractChallengeDomain('_ACME-CHALLENGE.Mamont.Int.Bksp.In.'))
      .toBe('mamont.int.bksp.in')
  })

  test('returns undefined when the name is not an ACME challenge record', () => {
    expect(extractChallengeDomain('mamont.int.bksp.in')).toBeUndefined()
    expect(extractChallengeDomain('_acme-challengex.mamont.int.bksp.in'))
      .toBeUndefined()
  })
})

describe('DnsTree', () => {
  test('selects the closest matching zone, independent of zone order', () => {
    const broadZone = makeZone('example.com')
    const specificZone = makeZone('service.example.com')
    const fallbackZone = makeZone('other.example.com')
    const tree = new DnsTree(makeConfig(
      ['api.service.example.com', 'api.other.example.com'],
      [broadZone, fallbackZone, specificZone]
    ))

    expect(tree.getZone('token-1', '_acme-challenge.api.service.example.com'))
      .toBe(specificZone)
    expect(tree.getZone('token-1', '_acme-challenge.api.other.example.com'))
      .toBe(fallbackZone)
  })

  test('matches token domains case-insensitively and keeps tokens isolated', () => {
    const zone = makeZone('bksp.in')
    const tree = new DnsTree(makeConfig(['mamont.int.bksp.in'], [zone]))

    expect(tree.getZone('token-1', '_ACME-CHALLENGE.MAMONT.INT.BKSP.IN.'))
      .toBe(zone)
    expect(tree.getZone('another-token', '_acme-challenge.mamont.int.bksp.in'))
      .toBeUndefined()
  })

  test('returns undefined for a name that is not an ACME challenge record', () => {
    const tree = new DnsTree(makeConfig(['example.com'], [makeZone('example.com')]))

    expect(tree.getZone('token-1', 'example.com')).toBeUndefined()
  })

  test('throws when a configured domain has no matching zone', () => {
    expect(() => new DnsTree(makeConfig(
      ['api.example.com'],
      [makeZone('other.com')]
    ))).toThrow('No matching zone found for domain: api.example.com')
  })
})
