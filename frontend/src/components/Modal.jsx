import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] animate-[fadeIn_0.15s_ease]"
      onClick={handleBackdropClick}
    >
      <div
        className="w-[90%] max-w-[400px] rounded-lg border border-white/10 shadow-2xl backdrop-blur-2xl animate-[slideUp_0.2s_ease]"
        style={{
          background: 'linear-gradient(135deg, rgba(26,16,37,0.98) 0%, rgba(15,10,24,0.99) 100%)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), var(--card-glow)'
        }}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="m-0 text-base text-text">{title}</h3>
          <button
            className="w-7 h-7 p-0 bg-transparent border-none text-muted cursor-pointer text-base flex items-center justify-center rounded-md hover:bg-white/10 hover:text-text transition-all"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
