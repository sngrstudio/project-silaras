/**
 * @fileoverview Navigation Component (React)
 *
 * React counterpart for the navigation bar component, providing responsive
 * navigation functionality with site branding and mobile drawer integration.
 * Works in conjunction with the Astro navigation component.
 *
 * @author SNGR Creative
 * @version 1.0.0
 */
import type { FC, PropsWithChildren } from 'react'
import type { Site } from './navigation.astro'

/**
 * Props interface for the NavigationRC component
 *
 * @interface NavigationRCProps
 */
interface NavigationRCProps extends PropsWithChildren {
  /**
   * Site configuration object containing branding information.
   * Typically includes site name and other metadata.
   */
  site: Site
}

/**
 * Navigation React Component
 *
 * Renders the main navigation bar with site branding and responsive behavior.
 * Integrates with the drawer system for mobile navigation and maintains
 * consistent styling across the application.
 *
 * Features:
 * - Responsive design with mobile drawer integration
 * - Site branding with configurable name
 * - Consistent styling with DaisyUI navbar components
 * - Home link functionality
 * - Mobile-first approach with xl: breakpoint visibility controls
 *
 * @component
 * @param props - Component properties
 * @param props.children - Content to render in the mobile section (typically drawer toggle)
 * @param props.site - Site configuration with branding information
 *
 * @example
 * ```tsx
 * // Basic usage with site config
 * <NavigationRC site={{ SITE_NAME: "SILARAS" }}>
 *   <DrawerToggle />
 * </NavigationRC>
 *
 * // Integration with drawer system
 * <NavigationRC site={siteConfig}>
 *   <label htmlFor="drawer" className="btn btn-ghost">
 *     <MenuIcon />
 *   </label>
 * </NavigationRC>
 * ```
 *
 * @see {@link Site} - Site configuration type
 * @see {@link navigation.astro} - Astro counterpart component
 */
const NavigationRC: FC<NavigationRCProps> = ({ children, site }) => {
  return (
    <nav className='navbar border-base-300 border-b'>
      <div className='xl:hidden'>{children}</div>
      <div className='flex-1'>
        <a className='btn btn-ghost text-lg' href='/'>
          <span>{site.SITE_NAME}</span>
        </a>
      </div>
    </nav>
  )
}

export default NavigationRC
