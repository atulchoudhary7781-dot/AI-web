'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Menu, Settings, Sparkles, Paperclip, Wrench,
  Send, ChevronDown, Brain, Cpu
} from 'lucide-react'

// Model options for selector
const models = [
  { id: 'gpt-4o', name: 'GPT-4o', icon: Brain },
  { id: 'nexus-ai', name: 'NEXUS AI', icon: Sparkles },
  { id: 'llama-3.1', name: 'Llama 3.1', icon: Cpu },
]

export default function Home() {
  const [message, setMessage] = useState('')
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px'
    }
  }, [message])

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Sending:', message)
    setMessage('')
    setIsLoading(false)
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative overflow-hidden">
      
      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.03)_0%,_transparent_50%)]" />
      </div>

      {/* Header - Simple & Clean */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30 backdrop-blur-sm">
        {/* Left: Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 text-gray-400 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Title */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-semibold text-white">AI Chat</h1>
        </div>

        {/* Right: Settings */}
        <button
          className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 text-gray-400 hover:text-cyan-400"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area - Centered Welcome */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10 overflow-y-auto">
        
        {/* Welcome Section */}
        <div className="text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
          
          {/* Logo Icon with Gradient Background */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              {/* Icon Container */}
              <div className="relative p-6 bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 rounded-3xl shadow-2xl shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow duration-300">
                <Sparkles className="w-12 h-12 text-white" />
                
                {/* Animated Sparkles on Icon */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-white">Welcome to </span>
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                NEXUS AI
              </span>
            </h2>
            
            <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
              Your advanced AI assistant powered by Llama 3.1. Ask me anything — I'm here to help!
            </p>
          </div>

          {/* Feature Pills/Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              <Brain className="w-4 h-4 text-cyan-400" />
              Neural Processing
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              <Cpu className="w-4 h-4 text-violet-400" />
              Lightning Fast
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Context Aware
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Input Area - Fixed at Bottom */}
      <div className="relative z-20 pb-6 px-4">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between px-1">
            {/* Model Selector */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
                  "bg-white/5 border border-white/10 text-sm text-gray-300",
                  "hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                )}
              >
                <selectedModel.icon className="w-4 h-4 text-green-400" />
                <span>{selectedModel.name}</span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  isModelDropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {isModelDropdownOpen && (
                <div className={cn(
                  "absolute bottom-full left-0 mb-2 py-2 min-w-[160px]",
                  "bg-[#16161d] border border-white/10 rounded-xl shadow-2xl",
                  "animate-slide-up origin-bottom"
                )}>
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model)
                        setIsModelDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                        selectedModel.id === model.id 
                          ? "text-white bg-white/10" 
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <model.icon className={cn(
                        "w-4 h-4",
                        selectedModel.id === model.id ? "text-green-400" : "text-gray-500"
                      )} />
                      <span>{model.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>powerful</span>
              <span className="mx-1 text-gray-600">•</span>
              <span>Press Enter to send</span>
            </div>
          </div>

          {/* Input Container */}
          <form onSubmit={handleSubmit} className="relative">
            <div className={cn(
              "relative flex items-end gap-2 p-3 pr-4",
              "bg-[#12121a] border border-white/10 rounded-2xl",
              "focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20",
              "transition-all duration-200 shadow-lg shadow-black/20"
            )}>
              
              {/* Left Tools */}
              <div className="flex items-center gap-1 pb-0.5">
                {/* Attachment Button */}
                <button
                  type="button"
                  className="p-2 rounded-lg text-yellow-500/70 hover:text-yellow-500 hover:bg-white/5 transition-all duration-200"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                {/* Tools Button */}
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
                  aria-label="Tools"
                >
                  <Wrench className="w-5 h-5" />
                </button>
              </div>

              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NEXUS AI anything..."
                rows={1}
                className={cn(
                  "flex-1 bg-transparent text-white placeholder-gray-500",
                  "resize-none outline-none text-base leading-relaxed",
                  "max-h-[200px] py-1.5 px-2"
                )}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 pb-0.5",
                  message.trim() && !isLoading
                    ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                )}
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {/* Helper Text Below Input */}
          <div className="flex items-center justify-between px-2 text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">Enter</kbd> to send</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">Shift+Enter</kbd> for new line</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-green-500/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {selectedModel.name}
              </span>
              <span className="text-gray-600">•</span>
              <span>NEXUS AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay (Optional) */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <aside className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] z-50 bg-[#0a0a0f] border-r border-white/10 shadow-2xl overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="font-semibold text-white">Menu</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {/* Sidebar Content */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <a href="#" className="block px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  New Chat
                </a>
                <a href="#" className="block px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  History
                </a>
                <a href="/dashboard" className="block px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  Dashboard
                </a>
                <a href="/settings" className="block px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  Settings
                </a>
                <a href="/pricing" className="block px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  Pricing
                </a>
              </nav>
              
              {/* Sidebar Footer */}
              <div className="p-4 border-t border-white/10">
                <a href="/login" className="block w-full px-4 py-2.5 text-center rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
                  Sign In
                </a>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

// Utility function for class names
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
