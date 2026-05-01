'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function isTheme(v: unknown): v is Theme { return v === 'light' || v === 'dark' }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<Theme>('theme', 'dark')
  const theme: Theme = isTheme(stored) ? stored : 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // Pick up OS preference on first visit (no stored value)
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) setStored('light')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTheme = () => setStored(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
