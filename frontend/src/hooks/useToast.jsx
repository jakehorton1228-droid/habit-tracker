/**
 * Toast Notification Hook and Context Provider
 *
 * Provides a toast notification system for displaying temporary messages
 * to users. Supports different toast types (success, error, warning, info)
 * and optional undo actions.
 *
 * Features:
 * - Auto-dismissing notifications with configurable duration
 * - Four toast types with distinct styling
 * - Optional undo callback for reversible actions
 * - Stacked display in bottom-right corner
 *
 * Usage:
 *   // In App.jsx or main.jsx
 *   import { ToastProvider } from './hooks/useToast'
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 *
 *   // In components
 *   import { useToast } from './hooks/useToast'
 *   const toast = useToast()
 *   toast.success('Item saved!')
 *   toast.error('Something went wrong')
 *   toast.success('Habit completed', { onUndo: () => undoAction() })
 *
 * @module hooks/useToast
 */
import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

/**
 * React Context for toast notifications.
 * Should not be used directly - use useToast() hook instead.
 */
const ToastContext = createContext(null)

/**
 * Toast Provider Component
 *
 * Wraps the application and provides toast notification context.
 * Renders active toasts in a fixed position container.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 *
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({ children }) {
  /** Array of currently displayed toasts */
  const [toasts, setToasts] = useState([])

  /**
   * Add a new toast notification.
   *
   * @param {string} message - The message to display
   * @param {Object} options - Toast configuration options
   * @param {string} options.type - Toast type: 'success', 'error', 'warning', 'info'
   * @param {Function} options.onUndo - Optional callback for undo action
   * @param {number} options.duration - Auto-dismiss duration in ms (default: 5000)
   * @returns {number} The toast ID (can be used to manually remove)
   */
  const addToast = useCallback((message, options = {}) => {
    const id = Date.now()
    const toast = {
      id,
      message,
      type: options.type || 'info',
      onUndo: options.onUndo,
      duration: options.duration || 5000,
    }
    setToasts((prev) => [...prev, toast])
    return id
  }, [])

  /**
   * Remove a toast by its ID.
   * Called automatically on dismiss or manually if needed.
   *
   * @param {number} id - The toast ID to remove
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  /**
   * Toast API object provided to consumers.
   * Contains convenience methods for each toast type.
   */
  const toast = {
    /**
     * Show a success toast (green styling).
     * @param {string} message - Message to display
     * @param {Object} options - Optional configuration
     */
    success: (message, options) => addToast(message, { ...options, type: 'success' }),

    /**
     * Show an error toast (red styling).
     * @param {string} message - Message to display
     * @param {Object} options - Optional configuration
     */
    error: (message, options) => addToast(message, { ...options, type: 'error' }),

    /**
     * Show a warning toast (yellow styling).
     * @param {string} message - Message to display
     * @param {Object} options - Optional configuration
     */
    warning: (message, options) => addToast(message, { ...options, type: 'warning' }),

    /**
     * Show an info toast (blue styling).
     * @param {string} message - Message to display
     * @param {Object} options - Optional configuration
     */
    info: (message, options) => addToast(message, { ...options, type: 'info' }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container - fixed to bottom-right of viewport */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[1000]">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onUndo={t.onUndo}
            onClose={() => removeToast(t.id)}
            duration={t.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * Hook to access toast notification API.
 *
 * Must be used within a ToastProvider. Throws error if used outside.
 *
 * @returns {Object} Toast API with success, error, warning, info methods
 * @throws {Error} If used outside of ToastProvider
 *
 * @example
 * function MyComponent() {
 *   const toast = useToast()
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData()
 *       toast.success('Data saved successfully!')
 *     } catch (error) {
 *       toast.error('Failed to save data')
 *     }
 *   }
 *
 *   const handleDelete = async () => {
 *     await deleteItem()
 *     toast.success('Item deleted', {
 *       onUndo: () => restoreItem()
 *     })
 *   }
 * }
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
