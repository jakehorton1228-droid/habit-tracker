import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

/**
 * Toast notification context and hook.
 * Provides toast.success(), toast.error(), toast.warning(), and toast.info() methods.
 * Toasts auto-dismiss and support optional undo actions.
 */

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

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

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (message, options) => addToast(message, { ...options, type: 'success' }),
    error: (message, options) => addToast(message, { ...options, type: 'error' }),
    warning: (message, options) => addToast(message, { ...options, type: 'warning' }),
    info: (message, options) => addToast(message, { ...options, type: 'info' }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
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

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
