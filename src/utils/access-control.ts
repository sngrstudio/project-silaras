import type { actions } from 'astro:actions'

// Type for current user from the actions
type CurrentUser = Awaited<ReturnType<typeof actions.user.getCurrent.orThrow>>

// Type for region data
type Region = {
  id: string
  name: string
  slug: string
  type: 'KABUPATEN' | 'KECAMATAN' | 'DESA'
  parentId?: string | null
}

/**
 * Check if a user can access a specific region based on their access level and region assignment
 * @param user Current user object
 * @param targetRegion Region to check access for
 * @param userRegion User's assigned region (optional, will be fetched if not provided)
 * @returns Promise<boolean> - true if user can access the region, false otherwise
 */
export async function canUserAccessRegion(
  user: CurrentUser | undefined,
  targetRegion: Region,
  userRegion?: Region | null
): Promise<boolean> {
  // No user means no access
  if (!user) {
    return false
  }

  // Admin (level 4) has access to everything
  if (user.accessLevel >= 4) {
    return true
  }

  // Viewers (level 1) are restricted for now
  if (user.accessLevel === 1) {
    return false
  }

  // If user has no region assignment, deny access
  if (!user.regionId) {
    return false
  }

  // If userRegion is not provided, we'll need to fetch it
  // For now, we'll return false and let the caller handle fetching
  if (!userRegion) {
    return false
  }

  // Coordinators (level 3) can access their assigned kecamatan and everything under it
  if (user.accessLevel === 3) {
    // Check if the target region is the user's kecamatan
    if (targetRegion.id === userRegion.id) {
      return true
    }

    // Check if the target region is under the user's kecamatan
    // This includes desa under their kecamatan
    if (targetRegion.parentId === userRegion.id) {
      return true
    }

    return false
  }

  // Editors (level 2) can only access their assigned desa
  if (user.accessLevel === 2) {
    // User can only access their own desa
    if (targetRegion.id === userRegion.id && targetRegion.type === 'DESA') {
      return true
    }

    return false
  }

  return false
}

/**
 * Synchronous version that works with already fetched user region data
 * @param user Current user object
 * @param targetRegion Region to check access for
 * @param userRegion User's assigned region (required)
 * @returns boolean - true if user can access the region, false otherwise
 */
export function canUserAccessRegionSync(
  user: CurrentUser | undefined,
  targetRegion: Region,
  userRegion: Region
): boolean {
  // No user means no access
  if (!user) {
    return false
  }

  // Admin (level 4) has access to everything
  if (user.accessLevel >= 4) {
    return true
  }

  // Viewers (level 1) are restricted for now
  if (user.accessLevel === 1) {
    return false
  }

  // If user has no region assignment, deny access
  if (!user.regionId) {
    return false
  }

  // Coordinators (level 3) can access their assigned kecamatan and everything under it
  if (user.accessLevel === 3) {
    // Check if the target region is the user's kecamatan
    if (targetRegion.id === userRegion.id) {
      return true
    }

    // Check if the target region is under the user's kecamatan
    // This includes desa under their kecamatan
    if (targetRegion.parentId === userRegion.id) {
      return true
    }

    return false
  }

  // Editors (level 2) can only access their assigned desa
  if (user.accessLevel === 2) {
    // User can only access their own desa
    if (targetRegion.id === userRegion.id && targetRegion.type === 'DESA') {
      return true
    }

    return false
  }

  return false
}

/**
 * Check if a user can access a specific patient based on the patient's region
 * @param user Current user object
 * @param patientRegion Region where the patient is located
 * @param userRegion User's assigned region (required)
 * @returns boolean - true if user can access the patient, false otherwise
 */
export function canUserAccessPatientSync(
  user: CurrentUser | undefined,
  patientRegion: Region,
  userRegion: Region
): boolean {
  // No user means no access
  if (!user) {
    return false
  }

  // Admin (level 4) has access to everything
  if (user.accessLevel >= 4) {
    return true
  }

  // Viewers (level 1) are restricted for now
  if (user.accessLevel === 1) {
    return false
  }

  // If user has no region assignment, deny access
  if (!user.regionId) {
    return false
  }

  // Coordinators (level 3) can access patients in desa under their kecamatan
  if (user.accessLevel === 3) {
    // Check if the patient's desa is under the user's kecamatan
    if (patientRegion.parentId === userRegion.id) {
      return true
    }

    return false
  }

  // Editors (level 2) can only access patients in their assigned desa
  if (user.accessLevel === 2) {
    // User can only access patients in their own desa
    if (patientRegion.id === userRegion.id && patientRegion.type === 'DESA') {
      return true
    }

    return false
  }

  return false
}

/**
 * Check if a user can access another user based on access levels and regional assignments
 * @param currentUser Current logged in user
 * @param targetUser User to check access for
 * @param currentUserRegion Current user's assigned region
 * @param targetUserRegion Target user's assigned region
 * @returns boolean - true if current user can access target user, false otherwise
 */
export function canUserAccessUser(
  currentUser: CurrentUser | undefined,
  targetUser: any, // User from users list
  currentUserRegion?: Region | null,
  targetUserRegion?: Region | null
): boolean {
  // No current user means no access
  if (!currentUser) {
    return false
  }

  // Users can always see themselves
  if (currentUser.id === targetUser.id) {
    return true
  }

  // Admin (level 4) can see everyone
  if (currentUser.accessLevel >= 4) {
    return true
  }

  // Coordinators (level 3) have territorial jurisdiction
  if (currentUser.accessLevel === 3) {
    // If current user has no region assignment, they can't see anyone
    if (!currentUser.regionId || !currentUserRegion) {
      return false
    }

    // If target user has no region, they can't see them
    if (!targetUser.regionId || !targetUserRegion) {
      return false
    }

    // Coordinators can see ALL users in their kecamatan territory, regardless of access level
    // This includes:
    // 1. Users assigned directly to their kecamatan
    // 2. Users assigned to desa under their kecamatan
    return (
      targetUserRegion.id === currentUserRegion.id ||
      targetUserRegion.parentId === currentUserRegion.id
    )
  }

  // Editors and viewers cannot see other users except themselves
  return false
}

/**
 * Check if a user can edit/delete another user
 * @param currentUser Current logged in user
 * @param targetUser User to check edit access for
 * @param currentUserRegion Current user's assigned region
 * @param targetUserRegion Target user's assigned region
 * @returns boolean - true if current user can edit target user, false otherwise
 */
export function canUserEditUser(
  currentUser: CurrentUser | undefined,
  targetUser: any,
  currentUserRegion?: Region | null,
  targetUserRegion?: Region | null
): boolean {
  // No current user means no access
  if (!currentUser) {
    return false
  }

  // Users can edit themselves (profile only)
  if (currentUser.id === targetUser.id) {
    return true
  }

  // Only coordinators and above can edit other users
  if (currentUser.accessLevel < 3) {
    return false
  }

  // Admins can edit everyone except other admins
  if (currentUser.accessLevel >= 4) {
    return targetUser.accessLevel < 4
  }

  // Coordinators have jurisdiction-based authority over ALL users in their territory
  if (currentUser.accessLevel === 3) {
    // If current user has no region assignment, they can't edit anyone
    if (!currentUser.regionId || !currentUserRegion) {
      return false
    }

    // If target user has no region, they can't edit them
    if (!targetUser.regionId || !targetUserRegion) {
      return false
    }

    // Coordinators can edit ALL users in their kecamatan territory, regardless of access level
    // This includes other coordinators and users created by admins
    return (
      targetUserRegion.id === currentUserRegion.id ||
      targetUserRegion.parentId === currentUserRegion.id
    )
  }

  return false
}

/**
 * Check if a user can delete another user
 * @param currentUser Current logged in user
 * @param targetUser User to check delete access for
 * @param currentUserRegion Current user's assigned region
 * @param targetUserRegion Target user's assigned region
 * @returns boolean - true if current user can delete target user, false otherwise
 */
export function canUserDeleteUser(
  currentUser: CurrentUser | undefined,
  targetUser: any,
  currentUserRegion?: Region | null,
  targetUserRegion?: Region | null
): boolean {
  // No current user means no access
  if (!currentUser) {
    return false
  }

  // Users cannot delete themselves
  if (currentUser.id === targetUser.id) {
    return false
  }

  // Only coordinators and above can delete users
  if (currentUser.accessLevel < 3) {
    return false
  }

  // Admins can delete everyone except other admins
  if (currentUser.accessLevel >= 4) {
    return targetUser.accessLevel < 4
  }

  // Coordinators have jurisdiction-based authority over ALL users in their territory
  if (currentUser.accessLevel === 3) {
    // If current user has no region assignment, they can't delete anyone
    if (!currentUser.regionId || !currentUserRegion) {
      return false
    }

    // If target user has no region, they can't delete them
    if (!targetUser.regionId || !targetUserRegion) {
      return false
    }

    // Coordinators can delete ALL users in their kecamatan territory, regardless of access level
    // This includes other coordinators and users created by admins
    return (
      targetUserRegion.id === currentUserRegion.id ||
      targetUserRegion.parentId === currentUserRegion.id
    )
  }

  return false
}

/**
 * Get allowed access levels for user creation/editing based on current user's access level
 * @param currentUser Current logged in user
 * @returns Array of allowed access levels
 */
export function getAllowedAccessLevels(
  currentUser: CurrentUser | undefined
): number[] {
  if (!currentUser) {
    return []
  }

  // Admins can create coordinators, editors, and viewers
  if (currentUser.accessLevel >= 4) {
    return [1, 2, 3] // Viewer, Editor, Coordinator
  }

  // Coordinators can create editors and viewers
  if (currentUser.accessLevel === 3) {
    return [1, 2] // Viewer, Editor
  }

  // Editors and viewers cannot create users
  return []
}

/**
 * Check if a user can access a specific region for user assignment
 * @param currentUser Current logged in user
 * @param targetRegion Region to check for user assignment
 * @param currentUserRegion Current user's assigned region
 * @returns boolean - true if user can assign users to this region, false otherwise
 */
export function canUserAssignToRegion(
  currentUser: CurrentUser | undefined,
  targetRegion: Region,
  currentUserRegion?: Region | null
): boolean {
  if (!currentUser) {
    return false
  }

  // Admins can assign to any region
  if (currentUser.accessLevel >= 4) {
    return true
  }

  // Coordinators can only assign users to regions in their territory
  if (currentUser.accessLevel === 3) {
    if (!currentUserRegion) {
      return false
    }

    // Can assign to their own kecamatan
    if (targetRegion.id === currentUserRegion.id) {
      return true
    }

    // Can assign to desa under their kecamatan
    if (targetRegion.parentId === currentUserRegion.id) {
      return true
    }

    return false
  }

  // Editors and viewers cannot assign users to regions
  return false
}
