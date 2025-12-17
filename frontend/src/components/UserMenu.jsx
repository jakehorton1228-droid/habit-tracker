import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useAuth } from '../hooks/useAuth'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSetting } = useSettings()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  const initial = user?.username?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="relative ml-auto" ref={menuRef}>
      <button
        className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-lg cursor-pointer transition-all hover:bg-[var(--glass)] hover:transform-none hover:shadow-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-7 h-7 bg-gradient-to-br from-accent to-accent-2 rounded-full flex items-center justify-center font-semibold text-sm">
          {initial}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 w-60 p-2 rounded-xl border border-black/10 dark:border-white/10 backdrop-blur-2xl z-[200] animate-[dropdownFadeIn_0.15s_ease]"
          style={{
            background: 'var(--bg-grad)',
            boxShadow: 'var(--soft-shadow), var(--card-glow)',
          }}
        >
          <div className="py-1">
            <div className="px-3 py-2 text-[0.7rem] uppercase tracking-wider text-muted font-semibold">Account</div>
            <div className="flex items-center gap-2.5 w-full px-3 py-2.5 text-text text-sm">
              <span className="text-base w-5 text-center">👤</span>
              <span>{user?.username || 'User'}</span>
            </div>
            {user?.email && (
              <div className="px-3 pb-2 text-xs text-muted pl-10">{user.email}</div>
            )}
          </div>

          <div className="py-1">
            <div className="px-3 py-2 text-[0.7rem] uppercase tracking-wider text-muted font-semibold">Preferences</div>

            <div className="flex items-center gap-2.5 w-full px-3 py-2.5 text-text text-sm">
              <span className="text-base w-5 text-center">🎨</span>
              <span>Theme</span>
              <select
                className="ml-auto min-w-[100px] px-2 py-1.5 rounded-md border border-black/10 dark:border-white/10 text-text text-xs cursor-pointer bg-[var(--bg-1)] focus:outline-none focus:border-accent-2"
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
              >
                <option className="bg-[var(--bg-1)]" value="sunset">Sunset</option>
                <option className="bg-[var(--bg-1)]" value="dark">Dark</option>
                <option className="bg-[var(--bg-1)]" value="light">Light</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 w-full px-3 py-2.5 text-text text-sm">
              <span className="text-base w-5 text-center">📅</span>
              <span>Week starts</span>
              <select
                className="ml-auto min-w-[100px] px-2 py-1.5 rounded-md border border-black/10 dark:border-white/10 text-text text-xs cursor-pointer bg-[var(--bg-1)] focus:outline-none focus:border-accent-2"
                value={settings.weekStart}
                onChange={(e) => updateSetting('weekStart', e.target.value)}
              >
                <option className="bg-[var(--bg-1)]" value="sunday">Sunday</option>
                <option className="bg-[var(--bg-1)]" value="monday">Monday</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-black/5 dark:bg-white/5 my-2" />

          <button
            className="flex items-center gap-2.5 w-full px-3 py-2.5 bg-transparent border-none rounded-lg text-accent text-sm cursor-pointer text-left hover:bg-accent/15 hover:transform-none hover:shadow-none transition-colors"
            onClick={handleSignOut}
          >
            <span className="text-base w-5 text-center">🚪</span>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
