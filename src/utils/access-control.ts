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
 * Check if a user can access a specific target based on the target's region
 * @param user Current user object
 * @param targetRegion Region where the target is located
 * @param userRegion User's assigned region (required)
 * @returns boolean - true if user can access the target, false otherwise
 */
export function canUserAccessTargetSync(
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

  // Coordinators (level 3) can access targets in desa under their kecamatan
  if (user.accessLevel === 3) {
    // Check if the target's desa is under the user's kecamatan
    if (targetRegion.parentId === userRegion.id) {
      return true
    }

    return false
  }

  // Editors (level 2) can only access targets in their assigned desa
  if (user.accessLevel === 2) {
    // User can only access targets in their own desa
    if (targetRegion.id === userRegion.id && targetRegion.type === 'DESA') {
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

  // PLKB Kecamatan (level 3) can only see themselves and Kader DASHAT in their territory
  if (currentUser.accessLevel === 3) {
    // If current user has no region assignment, they can't see anyone
    if (!currentUser.regionId || !currentUserRegion) {
      return false
    }

    // If target user has no region, they can't see them
    if (!targetUser.regionId || !targetUserRegion) {
      return false
    }

    // Can only see Kader DASHAT (level 2) users in their territory
    if (targetUser.accessLevel !== 2) {
      return false
    }

    // PLKB can see Kader DASHAT in their kecamatan territory
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

  // Super Admin (level 5) can edit everyone
  if (currentUser.accessLevel >= 5) {
    return true
  }

  // Admin (level 4) can edit everyone except fellow admins (level 4)
  if (currentUser.accessLevel === 4) {
    return targetUser.accessLevel < 4
  }

  // PLKB Kecamatan (level 3) can only edit Kader DASHAT (level 2) in their territory
  if (currentUser.accessLevel === 3) {
    // If current user has no region assignment, they can't edit anyone
    if (!currentUser.regionId || !currentUserRegion) {
      return false
    }

    // If target user has no region, they can't edit them
    if (!targetUser.regionId || !targetUserRegion) {
      return false
    }

    // Can only edit Kader DASHAT (level 2) users
    if (targetUser.accessLevel !== 2) {
      return false
    }

    // PLKB can edit Kader DASHAT in their kecamatan territory
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

  // Super Admin (level 5) can delete everyone
  if (currentUser.accessLevel >= 5) {
    return true
  }

  // Admin (level 4) can delete everyone except fellow admins (level 4)
  if (currentUser.accessLevel === 4) {
    return targetUser.accessLevel < 4
  }

  // PLKB Kecamatan (level 3) can only delete Kader DASHAT (level 2) in their territory
  if (currentUser.accessLevel === 3) {
    // If current user has no region assignment, they can't delete anyone
    if (!currentUser.regionId || !currentUserRegion) {
      return false
    }

    // If target user has no region, they can't delete them
    if (!targetUser.regionId || !targetUserRegion) {
      return false
    }

    // Can only delete Kader DASHAT (level 2) users
    if (targetUser.accessLevel !== 2) {
      return false
    }

    // PLKB can delete Kader DASHAT in their kecamatan territory
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

  // Admins (level 4) and Super Admins (level 5) can create coordinators, editors, and viewers
  // Note: Super Admin (level 5) is not available for creation through UI
  if (currentUser.accessLevel >= 4) {
    return [1, 2, 3, 4] // Pengamat, Kader DASHAT, PLKB Kecamatan, Admin Dinas PPPAPPKB
  }

  // PLKB Kecamatan can only create Kader DASHAT
  if (currentUser.accessLevel === 3) {
    return [2] // Kader DASHAT only
  }

  // Kader DASHAT and Pengamat cannot create users
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

/**
 * Get the display name for an access level
 * @param accessLevel The numeric access level
 * @returns The display name for the access level
 */
export function getAccessLevelName(accessLevel: number): string {
  switch (accessLevel) {
    case 1:
      return 'Pengamat'
    case 2:
      return 'Kader DASHAT'
    case 3:
      return 'PLKB Kecamatan'
    case 4:
      return 'Admin Dinas PPPAPPKB'
    case 5:
      return 'Super Administrator'
    default:
      return 'Unknown'
  }
}

/**
 * Get the icon name for an access level (for use with Lucide icons)
 * @param accessLevel The numeric access level
 * @returns The icon name for the access level
 */
export function getAccessLevelIcon(accessLevel: number): string {
  switch (accessLevel) {
    case 1:
      return 'Eye' // Pengamat (Observer/Viewer)
    case 2:
      return 'Edit' // Kader DASHAT (Editor/Data entry)
    case 3:
      return 'Users' // PLKB Kecamatan (Supervisor/Manager)
    case 4:
      return 'Shield' // Admin Dinas PPPAPPKB (Administrator)
    case 5:
      return 'Crown' // Super Administrator
    default:
      return 'User'
  }
}
