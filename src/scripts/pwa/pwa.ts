/**
 * @fileoverview PWA Registration and Management
 *
 * Comprehensive Progressive Web App registration and management system for the
 * SILARAS nutrition monitoring platform. Handles service worker lifecycle,
 * offline capabilities, background sync, and user notifications for optimal
 * field worker experience.
 *
 * Features:
 * - Service worker registration and update management
 * - Offline/online status detection and handling
 * - Background sync for assessment submissions
 * - Cache management and refresh controls
 * - User notifications via toast system
 * - IndexedDB integration for offline storage
 * - Assessment queue management for offline submissions
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import { registerSW } from 'virtual:pwa-register'
import {
  showSuccessToast,
  showErrorToast,
  showToast
} from '~/components/common/toast/toast.store'

// Initialize toast functions - use fallback if not available in browser context
const initializeToast = () => {
  // Toast functions are already imported statically
  // This function now just ensures they're available in browser context
  if (typeof window === 'undefined') {
    console.warn('Toast system not available in SSR context')
    return
  }
  console.log('✅ Toast system initialized')
}

// Network status management
let isOnline = navigator.onLine
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null

// IndexedDB setup for offline assessment queue
interface QueuedAssessment {
  id: string
  data: any
  timestamp: number
  retryCount: number
}

class AssessmentQueue {
  private dbName = 'silaras-offline'
  private storeName = 'assessment-queue'
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async addAssessment(
    assessment: Omit<QueuedAssessment, 'id' | 'timestamp' | 'retryCount'>
  ) {
    if (!this.db) await this.init()

    const queuedAssessment: QueuedAssessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      retryCount: 0,
      ...assessment
    }

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(queuedAssessment)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getAllAssessments(): Promise<QueuedAssessment[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async removeAssessment(id: string) {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clearAll() {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

const assessmentQueue = new AssessmentQueue()

// Initialize assessment queue
assessmentQueue.init().catch(console.error)

// Register service worker with comprehensive event handling
const updateSW = registerSW({
  immediate: true,

  onRegisteredSW(swScriptUrl, registration) {
    console.log('🔧 Service Worker registered:', swScriptUrl)
    serviceWorkerRegistration = registration || null

    // Set up message listener for SW communication
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener(
        'message',
        handleServiceWorkerMessage
      )
    }

    // Check for updates periodically (every 30 minutes)
    setInterval(
      () => {
        registration?.update()
      },
      30 * 60 * 1000
    )
  },

  onRegisterError(error) {
    console.error('❌ Service Worker registration failed:', error)
    showErrorToast?.(
      'Gagal mengaktifkan mode offline. Beberapa fitur mungkin tidak tersedia.'
    )
  },

  async onNeedRefresh() {
    console.log('🔄 New content available, will update after user confirmation')

    // Show update notification to user
    showToast?.('Pembaruan aplikasi tersedia. Klik untuk memperbarui.', false)

    // Auto-update after 10 seconds if user doesn't interact
    setTimeout(() => {
      updateSW(true)
    }, 10000)
  },

  async onOfflineReady() {
    console.log('📱 PWA ready to work offline')
    initializeToast()
    showSuccessToast?.('Aplikasi siap bekerja secara offline!')

    // Initialize offline features
    await setupOfflineFeatures()
  },

  onRegistered(registration) {
    console.log('✅ Service Worker registered successfully')
    serviceWorkerRegistration = registration || null
  }
})

// Handle messages from service worker
function handleServiceWorkerMessage(event: MessageEvent) {
  const { type, data } = event.data

  switch (type) {
    case 'SW_ACTIVATED':
      console.log('🚀 Service Worker activated')
      showSuccessToast?.('Aplikasi telah diperbarui!')
      break

    case 'BACKGROUND_SYNC':
      if (data.status === 'attempting') {
        showToast?.('Menyinkronkan data...', false)
      } else if (data.status === 'success') {
        showSuccessToast?.('Data berhasil disinkronkan!')
      } else if (data.status === 'failed') {
        showErrorToast?.('Gagal menyinkronkan data. Akan dicoba lagi nanti.')
      }
      break

    case 'CACHE_REFRESHED':
      console.log('🔄 Critical data cache refreshed')
      showToast?.('Data telah diperbarui!', false)
      break

    case 'OFFLINE_FALLBACK':
      showToast?.('Anda sedang offline. Menggunakan data tersimpan.', false)
      break
  }
}

// Network status management
function updateNetworkStatus() {
  const wasOnline = isOnline
  isOnline = navigator.onLine

  if (wasOnline !== isOnline) {
    if (isOnline) {
      console.log('🌐 Back online')
      showSuccessToast?.('Koneksi internet tersambung kembali!')

      // Trigger background sync when back online
      if (serviceWorkerRegistration) {
        serviceWorkerRegistration.sync
          .register('api-queue')
          .catch(console.error)
      }

      // Process offline assessment queue
      processOfflineQueue()
    } else {
      console.log('📴 Gone offline')
      showToast?.('Tidak ada koneksi internet. Mode offline aktif.', false)
    }
  }
}

// Set up offline features
async function setupOfflineFeatures() {
  // Listen for network status changes
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)

  // Set up periodic queue processing (every 5 minutes)
  setInterval(
    () => {
      if (isOnline) {
        processOfflineQueue()
      }
    },
    5 * 60 * 1000
  )

  // Expose global functions for assessment queue management
  if (typeof window !== 'undefined') {
    ;(window as any).silarasOffline = {
      queueAssessment: async (assessmentData: any) => {
        try {
          await assessmentQueue.addAssessment({ data: assessmentData })
          showSuccessToast?.('Penilaian disimpan untuk sinkronisasi nanti.')
          return true
        } catch (error) {
          console.error('Failed to queue assessment:', error)
          showErrorToast?.('Gagal menyimpan penilaian offline.')
          return false
        }
      },

      getQueuedCount: async () => {
        try {
          const assessments = await assessmentQueue.getAllAssessments()
          return assessments.length
        } catch (error) {
          console.error('Failed to get queued count:', error)
          return 0
        }
      },

      clearQueue: async () => {
        try {
          await assessmentQueue.clearAll()
          showSuccessToast?.('Antrian offline dikosongkan.')
          return true
        } catch (error) {
          console.error('Failed to clear queue:', error)
          showErrorToast?.('Gagal mengosongkan antrian.')
          return false
        }
      },

      refreshCache: () => {
        if (serviceWorkerRegistration) {
          serviceWorkerRegistration.active?.postMessage({
            type: 'CACHE_REFRESH'
          })
        }
      }
    }
  }
}

// Process offline assessment queue
async function processOfflineQueue() {
  if (!isOnline) return

  try {
    const queuedAssessments = await assessmentQueue.getAllAssessments()

    if (queuedAssessments.length === 0) return

    console.log(`📤 Processing ${queuedAssessments.length} queued assessments`)

    let successCount = 0
    let failedCount = 0

    for (const assessment of queuedAssessments) {
      try {
        // Attempt to submit assessment via Astro Actions
        const response = await fetch('/_actions/assesment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assessment.data)
        })

        if (response.ok) {
          // Successfully submitted, remove from queue
          await assessmentQueue.removeAssessment(assessment.id)
          successCount++
        } else {
          // Failed to submit, increment retry count
          failedCount++

          // Remove from queue if too many retries (>5)
          if (assessment.retryCount >= 5) {
            await assessmentQueue.removeAssessment(assessment.id)
            console.warn(
              'Assessment removed from queue after 5 failed attempts:',
              assessment.id
            )
          }
        }
      } catch (error) {
        console.error('Failed to submit queued assessment:', error)
        failedCount++
      }
    }

    if (successCount > 0) {
      showSuccessToast?.(`${successCount} penilaian berhasil disinkronkan!`)
    }

    if (failedCount > 0) {
      showToast?.(
        `${failedCount} penilaian gagal disinkronkan. Akan dicoba lagi nanti.`,
        true
      )
    }
  } catch (error) {
    console.error('Failed to process offline queue:', error)
  }
}

// Cache management functions
export const cacheManager = {
  // Invalidate specific cache
  invalidateCache: (cacheName: string) => {
    if (serviceWorkerRegistration?.active) {
      serviceWorkerRegistration.active.postMessage({
        type: 'CACHE_INVALIDATE',
        cacheName
      })
    }
  },

  // Refresh critical data
  refreshCriticalData: () => {
    if (serviceWorkerRegistration?.active) {
      serviceWorkerRegistration.active.postMessage({
        type: 'CACHE_REFRESH'
      })
    }
  },

  // Get cache status
  getCacheStatus: async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const status: Record<string, number> = {}

      for (const name of cacheNames) {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        status[name] = keys.length
      }

      return status
    }
    return {}
  }
}

// Export for external usage
export { updateSW, assessmentQueue, isOnline }

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeToast)
} else {
  initializeToast()
}
