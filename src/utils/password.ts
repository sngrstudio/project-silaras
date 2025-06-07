/**
 * @fileoverview Password Security Utilities
 *
 * Provides secure password hashing and verification functionality
 * for the SILARAS application using Argon2id algorithm.
 *
 * Security Features:
 * - Argon2id algorithm (recommended for password hashing)
 * - Memory-hard function resistant to GPU/ASIC attacks
 * - Configurable time/memory costs for future-proofing
 * - Salt generation for unique hashes
 * - Secure verification with timing attack protection
 *
 * Configuration:
 * - Memory cost: 64MB (65536 KiB) - Recommended minimum for security
 * - Time cost: 3 iterations - Balance between security and performance
 * - Parallelism: 4 threads - Optimal for most server configurations
 * - Hash length: 32 bytes - Strong output length
 * - Salt length: 16 bytes (Argon2 default) - Sufficient entropy
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

import argon2 from 'argon2'

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
