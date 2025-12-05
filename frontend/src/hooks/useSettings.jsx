import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'habit-tracker-settings'

const defaultSettings = {
  theme: 'sunset',
  weekStart: 'sunday',
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) }
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
