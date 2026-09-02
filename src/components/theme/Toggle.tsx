'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './ThemeProvider'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative w-9 h-9 rounded-lg transition-all duration-300",
        "hover:bg-white/10 hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-neon-orange/50"
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon for light mode */}
      <Sun
        className={cn(
          "w-5 h-5 absolute transition-all duration-300",
          theme === 'light'
            ? "rotate-0 scale-100 text-yellow-400"
            : "rotate-90 scale-0 text-transparent"
        )}
      />
      
      {/* Moon icon for dark mode */}
      <Moon
        className={cn(
          "w-5 h-5 absolute transition-all duration-300",
          theme === 'dark'
            ? "rotate-0 scale-100 text-neon-orange"
            : "-rotate-90 scale-0 text-transparent"
        )}
      />

      {/* Animated background glow */}
      <span
        className={cn(
          "absolute inset-0 rounded-lg transition-opacity duration-300",
          theme === 'dark'
            ? "bg-neon-orange/20 opacity-0 hover:opacity-100"
            : "bg-yellow-400/20 opacity-0 hover:opacity-100"
        )}
      />
    </Button>
  )
}

export default ThemeToggle
