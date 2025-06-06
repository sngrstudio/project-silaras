/**
 * @fileoverview File Hashing Utilities
 *
 * Provides secure file content hashing functionality for the SILARAS application.
 * Used to generate unique, content-based identifiers for uploaded files to prevent
 * duplicates and ensure file integrity.
 *
 * Features:
 * - SHA-256 cryptographic hashing for security
 * - Content-based unique filename generation
 * - File integrity verification capabilities
 * - Collision-resistant hash algorithm
 * - Browser-compatible Web Crypto API usage
 *
 * Use Cases:
 * - Generating unique filenames for uploads
 * - Preventing duplicate file uploads
 * - File integrity verification
 * - Content-based deduplication
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Generate a SHA-256 hash for a file and return it as a hex string.
 * Useful for creating unique filenames based on file content.
 *
 * @param file - The File object to hash
 * @returns Promise that resolves to a hex string representation of the file's SHA-256 hash
 *
 * @example
 * const file = new File(['content'], 'example.txt')
 * const hash = await getFileHash(file)
 * console.log(hash) // "ed7002b439e9ac845f22357d822bac1444730fbdb6016d3ec9432297b9ec9f73"
 */
export async function getFileHash(file: File): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    await file.arrayBuffer()
  )
  const hashArray = new Uint8Array(hashBuffer)
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return hashHex
}
