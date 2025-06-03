import argon2 from 'argon2'

/**
 * Secure password hashing using Argon2id (recommended variant for general password hashing)
 * with secure defaults:
 * - memory: 64MB (65536 KiB)
 * - iterations: 3
 * - parallelism: 4
 * - hash length: 32 bytes
 * - salt length: 16 bytes
 */

/**
 * Hash a password using Argon2id
 * @param password Plain text password to hash
 * @returns Promise resolving to a hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id, // Recommended variant for general password hashing
    memoryCost: 65536, // 64 MB (recommended minimum)
    timeCost: 3, // Iterations
    parallelism: 4,
    hashLength: 32
  })
}

/**
 * Verify a password against a hash
 * @param password Plain text password to verify
 * @param hash Hashed password to compare against
 * @returns Promise resolving to boolean indicating if password matches hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch (error) {
    // In case of malformed hash or other verification errors
    throw new Error(
      `Password verification failed: ${error instanceof Error ? error.message : 'unknown error'}`
    )
  }
}
