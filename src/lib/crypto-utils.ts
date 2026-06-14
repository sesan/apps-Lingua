// src/lib/crypto-utils.ts

/**
 * Encode an ArrayBuffer or string to a base64url string.
 * This function is used for JWT creation in Stream API routes.
 */
export function base64url(source: ArrayBuffer | string): string {
  let binary = '';
  if (typeof source === 'string') {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(source);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  } else {
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Return a Web Crypto SubtleCrypto implementation that works in both browsers
 * and Node.js (for edge functions or local dev). Throws if unavailable.
 */
export const getSubtleCrypto = (): SubtleCrypto => {
  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    return (crypto as any).subtle;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');
    return nodeCrypto.webcrypto.subtle;
  } catch (e) {
    throw new Error('Web Crypto API not available in this environment');
  }
};
