'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage IMMEDIATELY on client
  useEffect(() => {
    // Prevent hydration mismatch - check localStorage immediately
    const stored = localStorage.getItem('nexus-theme') as Theme | null
    const newTheme = stored || 'dark'
    
    setThemeState(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    document.documentElement.style.colorScheme = newTheme
    
    // Mark as mounted
    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('nexus-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    document.documentElement.style.colorScheme = newTheme
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  
  // Return default values during SSR or if not in provider
  if (context === undefined) {
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }
  
  return context
}

export default ThemeProvider
