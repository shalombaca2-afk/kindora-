/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Client-side cryptographic helper using Web Crypto API (SHA-256 with salt)
 * Never stores passwords in plaintext.
 */

// Generate a random cryptographic hex salt
export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Generate a 6-digit recovery code
export function generateRecoveryCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

// Hash a string with salt using SHA-256
export async function hashString(input: string, salt: string): Promise<string> {
  const text = `${input}::${salt}::kindora_secure_v2`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback to pure JS hash if subtle crypto fails in isolated context
    }
  }

  // Fallback simple bitwise hash for environments with restricted crypto
  return fallbackHash(text);
}

function fallbackHash(str: string): string {
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }
  const h1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `fb_${h1}${h2}_kindora`;
}
