'use client'

import { Settings, Shield, Cpu } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SettingsProps {
  isDarkMode?: boolean
  onToggleTheme?: () => void
}

export default function SettingsView({ isDarkMode, onToggleTheme }: SettingsProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 h-full overflow-y-auto custom-scrollbar sidebar-scroll">
      <h1 className="text-3xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
        ⚙️ Settings
      </h1>

      <div className="space-y-6 pb-8">
        {/* AI Model Info */}
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              AI Model
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border-cyan-500/30">
                Llama 3.1 8B
              </Badge>
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                Active
              </Badge>
            </div>
            <p className="text-gray-400 text-sm">
              Currently using Meta&apos;s Llama 3.1 8B Instruct model through OpenRouter API.
              This model provides fast, intelligent responses with excellent context understanding.
            </p>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              API Configuration
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Provider</span>
                <span className="text-white">OpenRouter</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Endpoint</span>
                <code className="text-sm text-cyan-400 bg-gray-800 px-2 py-1 rounded">/api/chat</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Response Time</span>
                <span className="text-green-400">&lt;1 second</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-pink-400" />
              About NEXUS AI
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              NEXUS AI is a next-generation AI platform built with Next.js 16, React 19, and Tailwind CSS 4.
              It leverages state-of-the-art language models to provide intelligent conversational experiences
              with a premium cinematic user interface.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Version 1.0.0 • Built with ❤️ using Next.js 16 &amp; OpenRouter
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://github.com/atulchoudhary7781-dot/AI-web"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
              <a 
                href="https://openrouter.ai/models"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
              >
                <Cpu className="w-4 h-4" />
                AI Models
              </a>
              <a 
                href="https://vercel.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 22.525H0V1.475h24v21.05zM1.475 20.05h21.05V2.95H1.475v17.1z"/><path d="M19.25 16.273l-1.43-1.43-5.32 5.322-5.32-5.322-1.43 1.43 6.75 6.75 6.75-6.75z"/></svg>
                Vercel Docs
              </a>
              <a 
                href="https://ai-web-rho-fawn.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Live Demo
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
