/**
 * @fileoverview Site Settings Component
 *
 * This component provides a simple container for the site settings management functionality
 * within the SILARAS platform. It serves as a wrapper for the SiteForm component,
 * providing a clean separation of concerns in the site configuration management flow.
 *
 * Key Features:
 * - Simple container component for site settings management
 * - Clean component composition pattern
 * - Integration with SiteForm for actual functionality
 *
 * @module Components/Settings/Site
 * @author SNGR Creative
 * @since 1.0.0
 */

import { type FC } from 'react'
import SiteForm from './site-form'

const SiteSettingsRC: FC = () => {
  return <SiteForm />
}

export default SiteSettingsRC
