'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, Menu, X, Zap, Cpu, MessageSquare,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Navigation items
const navItems = [
  { label: 'Features', href: '#features', icon: Zap },
  { label: 'AI Chat', href: '#chat', icon: MessageSquare },
  { label: 'Technology', href: '#tech', icon: Cpu },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
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
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              {/* Logo glow effect */}
              <div className="absolute inset-0 bg-neon-cyan/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center logo-glow">
                <Sparkles className="w-5 h-5 text-deep-black" />
              </div>
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
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "text-sm font-medium text-foreground/70 transition-all duration-200",
                  "hover:text-neon-cyan hover:bg-neon-cyan/10",
                  "hover:shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="neon" size="sm">
              Get Started
              <ChevronDown className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isMobileMenuOpen ? "max-h-96 pb-6" : "max-h-0"
          )}
        >
          <div className="glass-strong rounded-xl p-4 space-y-2 mt-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg",
                  "text-sm font-medium text-foreground/70 transition-all duration-200",
                  "hover:text-neon-cyan hover:bg-neon-cyan/10"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
              <Button variant="neon" className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
