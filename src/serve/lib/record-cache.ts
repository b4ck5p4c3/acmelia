export interface RecordCacheKey {
  content: string
  recordName: string
  zoneId: string
}

export class RecordCache {
  private readonly recordIdsByKey = new Map<string, string>()

  delete (key: RecordCacheKey): void {
    this.recordIdsByKey.delete(toCacheKey(key))
  }

  get (key: RecordCacheKey): string | undefined {
    return this.recordIdsByKey.get(toCacheKey(key))
  }

  set (key: RecordCacheKey, recordId: string): void {
    this.recordIdsByKey.set(toCacheKey(key), recordId)
  }
}

function toCacheKey ({ content, recordName, zoneId }: RecordCacheKey): string {
  return `${zoneId}:${recordName}:${content}`
}
