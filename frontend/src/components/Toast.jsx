import { useState, useEffect } from 'react'

/**
 * Toast notification component with auto-dismiss and optional undo action.
 * Displays success, info, warning, or error messages with a progress bar.
 * @param {Object} props
 * @param {string} props.message - Toast message text
 * @param {'success'|'info'|'warning'|'error'} [props.type='info'] - Toast type
 * @param {Function} [props.onUndo] - Optional undo callback (shows undo button if provided)
 * @param {Function} props.onClose - Callback when toast is dismissed
 * @param {number} [props.duration=5000] - Auto-dismiss duration in ms
 */

const iconColors = {
  success: 'bg-success/20 text-success',
  info: 'bg-info/20 text-info',
  warning: 'bg-warning/20 text-warning',
  error: 'bg-error/20 text-error',
}

const icons = {
  success: '✓',
  info: 'ℹ',
  warning: '⚠',
  error: '✕',
}

export default function Toast({ message, type = 'info', onUndo, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        handleClose()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  function handleClose() {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  function handleUndo() {
    onUndo?.()
    handleClose()
  }

  return (
    <div
      className={`min-w-[300px] max-w-[450px] rounded-xl border border-white/10 backdrop-blur-2xl overflow-hidden z-[1000] transition-all duration-200 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(26,16,37,0.98) 0%, rgba(15,10,24,0.99) 100%)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), var(--card-glow)',
      }}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${iconColors[type]}`}>
          {icons[type]}
        </span>
        <span className="flex-1 text-sm text-text">{message}</span>
        {onUndo && (
          <button
            className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-accent to-accent-2 border-none rounded-md text-white cursor-pointer hover:brightness-110 transition-all"
            onClick={handleUndo}
          >
            Undo
          </button>
        )}
        <button
          className="w-6 h-6 p-0 bg-transparent border-none text-muted cursor-pointer text-sm flex items-center justify-center rounded hover:bg-white/10 hover:text-text transition-all"
          onClick={handleClose}
        >
          ✕
        </button>
      </div>
      <div
        className="h-[3px] bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-50"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
