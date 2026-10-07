import type { Request } from 'express'

import { AppConfig } from './config'
import { decode } from './utils/base64'

/**
 * Creates an authenticator function based on the provided app configuration.
 * @param config App configuration
 * @returns Authenticator function
 */
export function createAuthenticator (config: AppConfig) {
  const tokens = new Map<string, string>()
  for (const token of config.tokens) {
    tokens.set(token.id, token.secret)
  }

  /**
   * Authenticates a key
   * @param headerContent The content of the authorization header
   * @returns Key ID if authentication is successful, otherwise null
   */
  const authenticate = async (request: Request): Promise<null | string> => {
    const headerContent = request.headers.authorization
    if (!headerContent) {
      return null
    }

    const [scheme, credentials] = headerContent.split(' ', 2)
    if (!credentials || scheme?.toLowerCase() !== 'basic') {
      return null
    }

    const [keyId, secret] = decode(credentials).split(':', 2)
    if (!keyId || !secret) {
      return null
    }

    const hash = tokens.get(keyId)
    if (!hash) {
      return null
    }

    const isValid = await Bun.password.verify(secret, hash, 'argon2id')
    return isValid
      ? keyId
      : null
  }

  return authenticate
}
