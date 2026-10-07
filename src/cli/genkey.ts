const SECRET_BYTE_LENGTH = 32

export async function genkey (): Promise<void> {
  const id = crypto.randomUUID()

  const secretBytes = new Uint8Array(SECRET_BYTE_LENGTH)
  crypto.getRandomValues(secretBytes)
  const secret = Buffer.from(secretBytes).toString('base64url')

  const hash = await Bun.password.hash(secret, { algorithm: 'argon2id' })

  console.log('# Secret (share with the ACME client, it will not be shown again):')
  console.log(secret)
  console.log()
  console.log('# Paste this entry into the "tokens" list in your acmelia.yaml config:')
  console.log(`- id: ${id}`)
  console.log(`  secret: ${hash}`)
  console.log('  domains:')
  console.log('    - example.com')
}
