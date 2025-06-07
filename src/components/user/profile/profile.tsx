/**
 * @fileoverview User Profile Component
 *
 * This component provides a simple container for the user profile management functionality
 * within the SILARAS platform. It serves as a wrapper for the ProfileForm component,
 * providing a clean separation of concerns in the user profile management flow.
 *
 * Key Features:
 * - Simple container component for profile management
 * - Clean component composition pattern
 * - Integration with ProfileForm for actual functionality
 *
 * @module Components/User/Profile
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/user/profile/profile.tsx

import { type FC } from 'react'
import ProfileForm from './profile-form'

const ProfileRC: FC = () => {
  return <ProfileForm />
}

export default ProfileRC
