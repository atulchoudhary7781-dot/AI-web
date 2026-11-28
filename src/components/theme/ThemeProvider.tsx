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
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    setThemeState('light')
    localStorage.setItem('nexus-theme', 'light')
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
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

  if (context === undefined) {
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }

  return context
}

export default ThemeProvider
