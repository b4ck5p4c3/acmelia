export function decode (encoded: string): string {
  const bytes = Uint8Array.fromBase64(encoded)
  return new TextDecoder().decode(bytes)
}

export function encode (text: string): string {
  const bytes = new TextEncoder().encode(text)
  return bytes.toBase64()
}
