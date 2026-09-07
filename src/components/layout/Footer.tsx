'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Sparkles, Github, Twitter, Mail, Heart, 
  MessageSquare, Zap, Cpu, Shield, Globe,
  ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Footer navigation links organized by category
const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features', icon: Zap },
      { label: 'AI Chat', href: '#chat', icon: MessageSquare },
      { label: 'Technology', href: '#tech', icon: Cpu },
    ]
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Help Center', href: '/help' },
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ]
  }
}

// Social media links
const socialLinks = [
  { 
    label: 'GitHub', 
    href: 'https://github.com/atulchoudhary7781-dot/AI-web', 
    icon: Github,
    color: 'hover:text-white hover:bg-gray-800'
  },
  { 
    label: 'Twitter', 
    href: 'https://twitter.com/nexusai', 
    icon: Twitter,
    color: 'hover:text-sky-400 hover:bg-sky-400/10'
  },
  { 
    label: 'Email', 
    href: 'mailto:support@nexusai.com', 
    icon: Mail,
    color: 'hover:text-pink-400 hover:bg-pink-400/10'
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative mt-auto" role="contentinfo">
      {/* Main Footer Content */}
      <div className="border-t border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Footer Grid - Properly Centered */}
          <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src="/nexus-logo.png" 
                    alt="NEXUS AI Logo" 
                    className="relative w-9 h-9 rounded-xl shadow-lg shadow-cyan-500/20"
                  />
                </div>
                <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  NEXUS
                </span>
              </Link>
              
              {/* Tagline */}
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Pioneering the future of artificial intelligence. Building systems that understand, reason, and create.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-2 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-200",
                      "text-gray-500 bg-white/5 border border-white/5",
                      social.color
                    )}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {footerLinks.product.title}
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group inline-flex items-center gap-2 text-sm text-gray-400",
                        "transition-colors duration-200 hover:text-cyan-400"
                      )}
                    >
                      {'icon' in link && (
                        <link.icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {footerLinks.company.title}
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group inline-flex items-center gap-2 text-sm text-gray-400",
                        "transition-colors duration-200 hover:text-violet-400"
                      )}
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Newsletter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {footerLinks.legal.title}
              </h3>
              <ul className="space-y-3 mb-6">
                {footerLinks.legal.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group inline-flex items-center gap-2 text-sm text-gray-400",
                        "transition-colors duration-200 hover:text-pink-400"
                      )}
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-gray-400">Secure & Private</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Copyright */}
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>© {currentYear} NEXUS AI.</span>
                <span className="hidden sm:inline">Made with</span>
                <Heart className="w-3.5 h-3.5 text-red-400 fill-current hidden sm:inline animate-pulse" />
                <span className="hidden sm:inline">for the future.</span>
              </div>

              {/* Bottom Links */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <Link 
                  href="/privacy" 
                  className="hover:text-gray-300 transition-colors"
                >
                  Privacy
                </Link>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <Link 
                  href="/terms" 
                  className="hover:text-gray-300 transition-colors"
                >
                  Terms
                </Link>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <button
                  onClick={scrollToTop}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                    "bg-white/5 hover:bg-white/10 border border-white/5",
                    "transition-all duration-200 hover:border-white/10",
                    "text-gray-400 hover:text-white"
                  )}
                  aria-label="Scroll to top"
                >
                  <span>Back to Top</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Line at Top */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </footer>
  )
}

export default Footer
