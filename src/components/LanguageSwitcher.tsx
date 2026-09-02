'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Safe i18n hook for SSR compatibility
function useSafeI18n() {
  try {
    const { useI18n } = require('@/lib/i18n')
    return useI18n()
  } catch {
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: string) => key,
      availableLocales: [],
    }
  }
}

const languages: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
]

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useSafeI18n()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const currentLanguage = languages.find(l => l.code === locale) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg",
          "hover:bg-white/10 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
        )}
        aria-label={t('language.select')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4 text-neon-cyan" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage.nativeLabel}
        </span>
        <ChevronDown 
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </Button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 mt-2 w-48 rounded-xl overflow-hidden transition-all duration-200 origin-top-right z-50",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
        role="listbox"
        aria-label={t('language.select')}
      >
        <div className="glass-strong border border-white/10 shadow-xl shadow-black/30">
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('language.select')}
            </p>
          </div>

          {/* Language options */}
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors duration-150",
                  "hover:bg-neon-cyan/10 focus:bg-neon-cyan/10 focus:outline-none",
                  locale === lang.code && "bg-neon-cyan/5"
                )}
                role="option"
                aria-selected={locale === lang.code}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{lang.code === 'en' ? '🇺🇸' : '🇮🇳'}</span>
                  <div className="text-left">
                    <span className="font-medium text-foreground block">
                      {lang.nativeLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {lang.label}
                    </span>
                  </div>
                </div>
                {locale === lang.code && (
                  <Check className="w-4 h-4 text-neon-cyan" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LanguageSwitcher
