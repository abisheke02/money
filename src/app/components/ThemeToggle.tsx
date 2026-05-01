'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/10 hover:border-accent/20 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 animate-fadeIn" />
      ) : (
        <Moon className="w-5 h-5 animate-fadeIn" />
      )}
    </button>
  )
}
