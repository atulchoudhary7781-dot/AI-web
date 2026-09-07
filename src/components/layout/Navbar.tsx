'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, Menu, X, Zap, Cpu, MessageSquare,
  ChevronDown, LayoutDashboard, CreditCard, Settings, Crown,
  Github, Twitter, Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/Toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Navigation items for all users
const navItems = [
  { label: 'nav.features', href: '#features', icon: Zap },
  { label: 'nav.aiChat', href: '#chat', icon: MessageSquare },
  { label: 'nav.technology', href: '#tech', icon: Cpu },
]

// Navigation items for logged-in users
const userNavItems = [
  { label: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'nav.pricing', href: '/pricing', icon: CreditCard },
  { label: 'nav.settings', href: '/settings', icon: Settings },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { t } = useI18n()

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setActiveDropdown(null)
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      {/* Header/Navbar - Properly Centered */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          isScrolled 
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20" 
            : "bg-transparent"
        )}
        role="banner"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo Section - Left */}
            <div className="flex items-center flex-shrink-0">
              <Link 
                href="/" 
                className="flex items-center gap-2.5 sm:gap-3 group"
                aria-label="NEXUS AI Home"
              >
                <div className="relative">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src="/nexus-logo.png" 
                    alt="NEXUS AI Logo" 
                    className={cn(
                      "relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover",
                      "transition-all duration-300 group-hover:scale-110",
                      "shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40"
                    )}
                  />
                </div>
                
                {/* Desktop Logo Text */}
                <div className="hidden sm:flex flex-col">
                  <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                    NEXUS
                  </span>
                  <span className="text-[9px] tracking-[0.25em] text-gray-400 uppercase -mt-1 font-medium">
                    AI Platform
                  </span>
                </div>
                
                {/* Mobile Logo Text */}
                <span className="sm:hidden text-lg font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  NEXUS
                </span>
              </Link>
            </div>

            {/* Center Navigation - Desktop Only */}
            <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
                    "text-gray-300 transition-all duration-200",
                    "hover:text-cyan-400 hover:bg-white/5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{t(item.label as any)}</span>
                </Link>
              ))}
              
              {/* Separator */}
              <div className="w-px h-6 bg-white/10 mx-2" />
              
              {/* User Nav Items */}
              {userNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium",
                    "text-gray-400 transition-all duration-200",
                    "hover:text-cyan-400 hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{t(item.label as any)}</span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              
              {/* Language Switcher */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              {/* Pro Upgrade Button */}
              <Link 
                href="/pricing"
                className="hidden xs:flex items-center flex-shrink-0"
              >
                <Button 
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500",
                    "hover:from-amber-500 hover:via-orange-600 hover:to-red-600",
                    "text-white font-semibold text-xs sm:text-sm",
                    "shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50",
                    "transition-all duration-300 hover:scale-105 active:scale-100",
                    "border border-amber-400/30 rounded-full",
                    "px-3 sm:px-4 py-1.5 sm:py-2",
                    "relative overflow-hidden group"
                  )}
                >
                  {/* Shimmer Effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  
                  <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 fill-current flex-shrink-0 relative z-10" />
                  <span className="hidden sm:inline relative z-10">Pro</span>
                  <span className="sm:hidden relative z-10">⭐</span>
                </Button>
              </Link>

              {/* Auth Buttons - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm px-4 text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm"
                    className={cn(
                      "bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400",
                      "text-white text-sm font-semibold px-4 py-2 rounded-full",
                      "shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40",
                      "transition-all duration-300 hover:scale-105 active:scale-100"
                    )}
                  >
                    {t('nav.getStarted')}
                    <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "lg:hidden p-2.5 rounded-xl transition-all duration-200 flex-shrink-0",
                  "text-gray-300 hover:text-white hover:bg-white/10",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
                  isMobileMenuOpen && "bg-white/10 text-white"
                )}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-out",
          isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Panel from Right */}
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-[320px] max-w-[90vw]",
            "bg-gray-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl",
            "transform transition-transform duration-300 ease-out",
            "flex flex-col overflow-hidden",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <img 
                src="/nexus-logo.png" 
                alt="" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                NEXUS
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* Main Navigation */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Main Menu
              </p>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl",
                      "text-sm font-medium text-gray-300 transition-all duration-200",
                      "hover:text-cyan-400 hover:bg-white/5 active:bg-cyan-500/10"
                    )}
                  >
                    <item.icon className="w-5 h-5 text-cyan-400" />
                    {t(item.label as any)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Navigation */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Account
              </p>
              <div className="space-y-1">
                {userNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl",
                      "text-sm font-medium text-gray-300 transition-all duration-200",
                      "hover:text-cyan-400 hover:bg-white/5 active:bg-cyan-500/10"
                    )}
                  >
                    <item.icon className="w-5 h-5 text-violet-400" />
                    {t(item.label as any)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Theme & Language Settings */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <span className="text-sm font-medium text-gray-300">Theme</span>
                <ThemeToggle />
              </div>
              
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <span className="text-sm font-medium text-gray-300">Language</span>
                <LanguageSwitcher />
              </div>
            </div>
          </nav>

          {/* Mobile Footer Actions */}
          <div className="p-4 border-t border-white/10 space-y-3 flex-shrink-0 bg-gray-900/80">
            {/* Pro Upgrade in Mobile */}
            <Link 
              href="/pricing" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block w-full"
            >
              <Button 
                className={cn(
                  "w-full",
                  "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500",
                  "hover:from-amber-500 hover:via-orange-600 hover:to-red-600",
                  "text-white font-semibold",
                  "shadow-lg shadow-orange-500/30",
                  "transition-all duration-300",
                  "border border-amber-400/30 rounded-xl",
                  "py-3 text-sm relative overflow-hidden group"
                )}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Crown className="w-5 h-5 mr-2 fill-current flex-shrink-0 relative z-10" />
                <span className="relative z-10">Upgrade to Pro</span>
                <Sparkles className="w-4 h-4 ml-2 flex-shrink-0 relative z-10" />
              </Button>
            </Link>
            
            {/* Auth Buttons Row */}
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="block"
              >
                <Button 
                  variant="outline" 
                  className="w-full py-3 text-sm border-white/20 hover:bg-white/5 hover:border-white/30 rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="block"
              >
                <Button 
                  variant="neon" 
                  className="w-full py-3 text-sm rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400"
                >
                  Get Started
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
