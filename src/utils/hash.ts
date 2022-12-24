import { Crypto } from '@peculiar/webcrypto'

export default async function hash(message: string) {
  const msgUint8 = new TextEncoder().encode(message)
  const crypto = new Crypto

  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
