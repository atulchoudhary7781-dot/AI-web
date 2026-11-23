'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/chat', label: 'Chat' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/settings', label: 'Settings' },
  { href: '/help', label: 'Help' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="liquid-glass-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-base font-bold tracking-wide text-white">
            NEXUS <span className="gradient-text-nexus">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'liquid-glass rounded-full px-3.5 py-2 text-sm font-medium',
                  active ? 'text-amber-100' : 'text-slate-200'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="liquid-glass rounded-full px-3.5 py-2 text-sm font-medium text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="liquid-glass-primary rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            Get Started
          </Link>
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="liquid-panel border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1.5">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="liquid-glass rounded-xl px-3 py-2.5 text-sm text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="liquid-glass rounded-xl px-3 py-2.5 text-sm text-white">
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="liquid-glass-primary mt-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
