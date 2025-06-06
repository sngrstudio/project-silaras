import { atom, computed } from 'nanostores'

/**
 * @fileoverview Toast Store
 *
 * Manages toast notification state for the SILARAS application.
 * Provides a centralized way to display success, error, and informational
 * messages to users with automatic dismissal and manual close functionality.
 *
 * Features:
 * - Error and success message variants with appropriate styling
 * - Auto-dismiss after 5 seconds (configured in Toast.Provider)
 * - Manual dismissal via close button
 * - Bottom-center positioning with pill-shaped design
 * - Radix UI integration for accessibility
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Type definition for toast message data
 * Defines the structure of toast notifications
 */
export type ToastMessage =
  | {
      /** Whether this is an error message (affects styling and icon) */
      error?: boolean | undefined
      /** The message content to display to the user */
      message: string | undefined
    }
  | undefined

/**
 * Nanostore for toast message data
 * Contains the current toast message information
 *
 * @default undefined - No toast message active initially
 */
export const $toastMessage = atom<ToastMessage>(undefined)

/**
 * Computed store for toast visibility state
 * Automatically determines if toast should be visible based on message content
 *
 * @returns true if a valid message exists and should be displayed, false otherwise
 */
export const $isToastOpen = computed($toastMessage, (message) => {
  return message !== undefined && message.message !== undefined
})

/**
 * Generic function to display a toast message
 *
 * @param message - The text content to display in the toast
 * @param isError - Whether this is an error message (affects styling and icon)
 *
 * @example
 * showToast('Data saved successfully', false) // Success toast
 * showToast('Something went wrong', true)     // Error toast
 */
export const showToast = (message: string, isError = false) => {
  $toastMessage.set({
    error: isError,
    message
  })
}

/**
 * Convenience function to display an error toast
 * Shows red styling with error icon
 *
 * @param message - The error message to display
 *
 * @example
 * showErrorToast('Failed to save data')
 * showErrorToast('Network connection error')
 */
export const showErrorToast = (message: string) => {
  showToast(message, true)
}

/**
 * Convenience function to display a success toast
 * Shows green styling with success icon
 *
 * @param message - The success message to display
 *
 * @example
 * showSuccessToast('Data saved successfully')
 * showSuccessToast('User created successfully')
 */
export const showSuccessToast = (message: string) => {
  showToast(message, false)
}

/**
 * Function to manually hide the current toast
 * Useful for programmatic dismissal or cleanup
 *
 * Note: Toasts auto-dismiss after 5 seconds, so manual hiding
 * is typically only needed for immediate dismissal scenarios
 */
export const hideToast = () => {
  $toastMessage.set(undefined)
}
