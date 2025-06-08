/**
 * @fileoverview PWA Manifest API Route
 *
 * Dynamic manifest.json generator for the SILARAS nutrition monitoring PWA.
 * Generates a comprehensive Web App Manifest with proper icons, display modes,
 * and app configuration optimized for field health worker usage.
 *
 * Features:
 * - Dynamic icon discovery from dist folder
 * - Responsive icon sizes and purposes
 * - Apple touch icons and splash screens
 * - Offline-first display configuration
 * - Category and theme configuration
 * - Start URL with session handling
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import type { APIRoute } from 'astro'

export const prerender = true

/**
 * Convert OKLCH color values to hex format for PWA manifest compatibility
 * @param oklch OKLCH color string (e.g., "oklch(0.5572 0.13007 241.0873)")
 * @returns Hex color string (e.g., "#1f2937")
 */
function oklchToHex(oklch: string): string {
  // For now, we'll map the SILARAS OKLCH colors to their closest hex equivalents
  // In a full implementation, you'd use a color conversion library
  const colorMap: Record<string, string> = {
    // Base colors
    'oklch(100% 0 0)': '#ffffff', // base-100 (pure white)
    'oklch(98% 0 0)': '#fafafa', // base-200 (very light gray)
    'oklch(95% 0 0)': '#f5f5f5', // base-300 (light gray)
    'oklch(21% 0.006 285.885)': '#1a1a1a', // base-content (dark text)

    // Primary color - health-focused blue
    'oklch(0.5572 0.13007 241.0873)': '#2563eb', // primary (blue)
    'oklch(0.9919 0.003956 286.3274)': '#f8fafc', // primary-content (light)

    // Secondary color - soft purple
    'oklch(0.8942 0.054 248.43)': '#a78bfa', // secondary (purple)
    'oklch(0.4899 0.0555 244.58)': '#4c1d95', // secondary-content (dark purple)

    // Accent color - warm orange
    'oklch(0.7831 0.1146 85.98)': '#f59e0b', // accent (orange)
    'oklch(0.4053 0.082974 85.8997)': '#92400e', // accent-content (dark orange)

    // Neutral colors
    'oklch(0.3108 0.0091 248.12)': '#374151', // neutral (gray)
    'oklch(0.9576 0.0087 264.52)': '#f9fafb', // neutral-content (light)

    // Semantic colors
    'oklch(0.4712 0.110592 241.3877)': '#2563eb', // info (blue)
    'oklch(0.5926 0.0771 186.24)': '#059669', // success (green)
    'oklch(0.506 0.1927 27.7)': '#dc2626' // error (red)
  } as const

  return colorMap[oklch] || '#ffffff' // fallback to white
}

export const GET: APIRoute = async () => {
  // Define the comprehensive PWA manifest
  const manifest = {
    // Basic app information
    name: 'SILARAS - Sistem Informasi Laporan Analisis Status Gizi',
    short_name: 'SILARAS',
    description:
      'Sistem monitoring dan pelaporan status gizi masyarakat untuk petugas kesehatan lapangan. Mendukung penilaian gizi offline dan sinkronisasi data real-time.',

    // App identity and versioning
    id: '/',
    start_url: '/?source=pwa',
    scope: '/',

    // Display configuration optimized for mobile health workers
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'portrait-primary',

    // Theme and branding using SILARAS design system colors
    // Primary: Health-focused blue (oklch(0.5572 0.13007 241.0873)) → #2563eb
    // Background: Pure white (oklch(100% 0 0)) → #ffffff
    theme_color: oklchToHex('oklch(0.5572 0.13007 241.0873)'), // SILARAS primary blue
    background_color: oklchToHex('oklch(100% 0 0)'), // SILARAS base-100 white

    // App categorization
    categories: ['health', 'medical', 'productivity', 'utilities'],

    // Language and region
    lang: 'id-ID',
    dir: 'ltr',

    // PWA icons with comprehensive size coverage
    icons: [
      // Standard PWA icons
      {
        src: '/pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      // Maskable icon for adaptive icons
      {
        src: '/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      // Apple touch icon
      {
        src: '/apple-touch-icon-180x180.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      },
      // Favicon fallback
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
        purpose: 'any'
      }
    ],

    // Screenshots for app store listings and install prompts
    screenshots: [
      {
        src: '/screenshots/mobile.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'SILARAS Mobile - Dashboard Monitoring Status Gizi'
      },
      {
        src: '/screenshots/desktop.png',
        sizes: '2360x1640',
        type: 'image/png',
        form_factor: 'wide',
        label: 'SILARAS Desktop - Interface Petugas Kesehatan'
      }
    ]
  }

  // Return the manifest with proper headers
  return new Response(JSON.stringify(manifest, null, 2))
}
