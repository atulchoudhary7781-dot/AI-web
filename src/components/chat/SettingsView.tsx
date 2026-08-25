'use client'

import { Sun, Moon, Settings, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SettingsProps {
  isDarkMode: boolean
  onToggleTheme: () => void
}

export default function SettingsView({ isDarkMode, onToggleTheme }: SettingsProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
        ⚙️ Settings
      </h1>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200">Dark Mode</p>
                <p className="text-sm text-gray-400">Use dark theme throughout the app</p>
              </div>
              <Button
                onClick={onToggleTheme}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDarkMode ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Info */}
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Model</h3>
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
            <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
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
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">About NEXUS AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              NEXUS AI is a next-generation AI platform built with Next.js, React, and Tailwind CSS.
              It leverages state-of-the-art language models to provide intelligent conversational experiences.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Version 1.0.0 • Built with ❤️ using Next.js 16 &amp; OpenRouter
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
