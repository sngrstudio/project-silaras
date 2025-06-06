/**
 * @fileoverview User Region Hook
 *
 * React hook for fetching and managing the current user's regional assignment data.
 * Provides reactive access to user's assigned region with loading states and error handling.
 *
 * Features:
 * - Reactive user region data fetching
 * - Loading state management
 * - Error handling with toast notifications
 * - Automatic cleanup and re-fetching
 * - Integration with nanostores for state management
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { userRegion, loading, error } = useUserRegion()
 *
 *   if (loading) return <div>Loading region...</div>
 *   if (error) return <div>Error: {error}</div>
 *   if (!userRegion) return <div>No region assigned</div>
 *
 *   return <div>Current region: {userRegion.name}</div>
 * }
 * ```
 *
 * Dependencies:
 * - Requires $currentUser store to be populated
 * - Uses Astro actions for data fetching
 * - Integrates with toast notification system
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $currentUser } from '../../components/layout/drawer/drawer.store'
import { actions } from 'astro:actions'
import { showErrorToast } from '~/components/common/toast/toast.store'

type Region = {
  id: string
  name: string
  slug: string
  type: 'KABUPATEN' | 'KECAMATAN' | 'DESA'
  parentId?: string | null
}

/**
 * Hook to get the current user's region data
 * @returns Object with userRegion, loading state, and error
 */
export function useUserRegion() {
  const currentUser = useStore($currentUser)
  const [userRegion, setUserRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserRegion() {
      if (!currentUser?.regionId) {
        setUserRegion(null)
        setLoading(false)
        setError(null)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const region = await actions.region.getById.orThrow({
          id: currentUser.regionId
        })
        setUserRegion(region)
      } catch (err) {
        showErrorToast('Gagal memuat data wilayah pengguna.')
        setError('Failed to fetch user region')
        setUserRegion(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRegion()
  }, [currentUser?.regionId])

  return {
    userRegion,
    loading,
    error,
    currentUser
  }
}
