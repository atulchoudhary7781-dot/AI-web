'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, Menu, X, Zap, Cpu, MessageSquare,
  ChevronDown, LayoutDashboard, CreditCard, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/Toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Navigation items
const navItems = [
  { label: 'nav.features', href: '#features', icon: Zap },
  { label: 'nav.aiChat', href: '#chat', icon: MessageSquare },
  { label: 'nav.technology', href: '#tech', icon: Cpu },
]

// Additional nav items for logged-in users
const userNavItems = [
  { label: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'nav.pricing', href: '/pricing', icon: CreditCard },
  { label: 'nav.settings', href: '/settings', icon: Settings },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useI18n()

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "navbar-glass shadow-lg shadow-black/20" 
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Feature A: Custom Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                {/* Logo glow effect on hover */}
                <div className="absolute inset-0 bg-neon-orange/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img 
                  src="/nexus-logo.png" 
                  alt="NEXUS AI Logo" 
                  className={cn(
                    "relative w-10 h-10 rounded-xl object-cover transition-all duration-300",
                    "group-hover:scale-110 logo-glow"
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-display tracking-wider gradient-text-nexus">
                  NEXUS
                </span>
                <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase -mt-1">
                  AI Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "text-sm font-medium text-foreground/70 transition-all duration-200",
                    "hover:text-neon-orange hover:bg-neon-orange/10",
                    "hover:shadow-[inset_0_0_20px_rgba(255,107,53,0.05)]"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.label as any)}
                </Link>
              ))}
              
              {/* Additional nav items with separator */}
              <div className="w-px h-6 bg-white/10 mx-2" />
              
              {userNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    "text-sm font-medium text-foreground/60 transition-all duration-200",
                    "hover:text-neon-orange hover:bg-neon-orange/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{t(item.label as any)}</span>
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle - Feature E */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              
              {/* Language Switcher - Feature J */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              {/* Desktop CTA Buttons */}
              <div className="hidden md:flex items-center gap-3 ml-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="neon" size="sm">
                    {t('nav.getStarted')}
                    <ChevronDown className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button - Feature B */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  "text-foreground hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neon-orange/50"
                )}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay - Feature B: Slide-in from right */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300",
          isMobileMenuOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop - closes menu on click */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-[300px] max-w-[85vw]",
            "glass-strong border-l border-white/10 shadow-2xl",
            "transform transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="font-display font-semibold text-foreground">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-140px)] custom-scrollbar">
            {/* Main Nav Items */}
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                Navigation
              </p>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg",
                    "text-sm font-medium text-foreground/80 transition-all duration-200",
                    "hover:text-neon-orange hover:bg-neon-orange/10 active:bg-neon-orange/15"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {t(item.label as any)}
                </Link>
              ))}
            </div>

            {/* User Nav Items */}
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                Account
              </p>
              {userNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg",
                    "text-sm font-medium text-foreground/80 transition-all duration-200",
                    "hover:text-neon-orange hover:bg-neon-orange/10 active:bg-neon-orange/15"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {t(item.label as any)}
                </Link>
              ))}
            </div>

            {/* Theme & Language in mobile */}
            <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-foreground/80">Theme</span>
                <ThemeToggle />
              </div>
              
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-foreground/80">Language</span>
                <LanguageSwitcher />
              </div>
            </div>
          </nav>

          {/* Footer with auth buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 glass-strong">
            <div className="space-y-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  {t('nav.signIn')}
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="neon" className="w-full">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
