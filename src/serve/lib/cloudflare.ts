import Cloudflare from 'cloudflare'

import { RecordCache } from './record-cache'

const TXT_RECORD_TTL = 120

export interface CloudflareDnsRecord {
  content: string
  id: string
  name: string
}

export class CloudflareClient {
  private readonly cache: RecordCache = new RecordCache()
  private readonly client: Cloudflare

  constructor (apiToken: string) {
    this.client = new Cloudflare({ apiToken })
  }

  /**
   * Creates a new TXT record in the specified Cloudflare zone.
   * @param zoneId The ID of the Cloudflare zone where the record will be created.
   * @param name The name of the TXT record.
   * @param content The content of the TXT record.
   * @returns The created Cloudflare DNS record.
   */
  async createRecord (zoneId: string, name: string, content: string): Promise<CloudflareDnsRecord> {
    const record = await this.client.dns.records.create({
      content,
      name,
      ttl: TXT_RECORD_TTL,
      type: 'TXT',
      zone_id: zoneId,
    })

    // Cache the created record
    this.cache.set({
      content,
      recordName: name,
      zoneId
    }, record.id)

    return {
      content: record.content as string,
      id: record.id,
      name: record.name
    }
  }

  /**
   * Deletes a TXT record from the specified Cloudflare zone.
   * @param zoneId The ID of the Cloudflare zone where the record exists.
   * @param name The name of the TXT record.
   * @param content The content of the TXT record.
   * @returns A promise that resolves when the record is deleted.
   */
  async deleteRecord (zoneId: string, name: string, content: string): Promise<void> {
    const recordId = this.cache.get({
      content,
      recordName: name,
      zoneId
    })

    if (recordId) {
      await this.client.dns.records.delete(recordId, { zone_id: zoneId })
      this.cache.delete({
        content,
        recordName: name,
        zoneId
      })

      return
    }

    const candidates = this.client.dns.records.list({
      content: { exact: content },
      name: { exact: name },
      type: 'TXT',
      zone_id: zoneId,
    })

    for await (const record of candidates) {
      await this.client.dns.records.delete(record.id, { zone_id: zoneId })
    }
  }
}
