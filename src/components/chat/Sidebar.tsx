'use client'

import { useEffect } from 'react'
import { 
  MessageSquare, Home, Layers, TrendingUp, Settings,
  Github, Cpu, BookOpen, FileText, Plus, Trash2, Moon, Sun,
  ChevronLeft, X, User, History, Sparkles, PanelLeftClose
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatSession {
  id: string
  title: string
  date: Date
  messages: any[]
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  onNewChat: () => void
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onViewChange: (view: string) => void
  currentView: string
  isDarkMode: boolean
  onToggleTheme: () => void
}

export default function Sidebar({
  isOpen,
  onClose,
  onToggle,
  onNewChat,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onViewChange,
  currentView,
  isDarkMode,
  onToggleTheme
}: SidebarProps) {
  // ESC key handler to close sidebar
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay - Works on ALL screen sizes when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Always overlay, never pushes content */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-950 to-gray-900 backdrop-blur-xl border-r border-cyan-500/30 z-50 transform transition-all duration-300 ease-out shadow-2xl shadow-cyan-500/10 ${
        isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        {/* Content */}
        <div className={`h-full flex flex-col ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-800/50 bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold font-[family-name:var(--font-orbitron)] bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                    NEXUS AI
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Powered by Llama</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
                title="Close sidebar (ESC)"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
            
            {/* New Chat Button */}
            <Button 
              onClick={() => { onNewChat(); onClose(); }}
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 h-11 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {/* Main Views */}
            <div className="mb-6">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-3 font-semibold">Main Menu</p>
              
              <SidebarButton
                icon={<MessageSquare className="w-4 h-4" />}
                label="AI Chat"
                active={currentView === 'chat'}
                onClick={() => { onViewChange('chat'); onClose(); }}
              />
              
              <SidebarButton
                icon={<Home className="w-4 h-4" />}
                label="Home"
                active={currentView === 'home'}
                onClick={() => { onViewChange('home'); onClose(); }}
              />

              <SidebarButton
                icon={<Layers className="w-4 h-4" />}
                label="Features"
                active={currentView === 'features'}
                onClick={() => { onViewChange('features'); onClose(); }}
              />

              <SidebarButton
                icon={<TrendingUp className="w-4 h-4" />}
                label="Statistics"
                active={currentView === 'stats'}
                onClick={() => { onViewChange('stats'); onClose(); }}
              />

              <SidebarButton
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
                active={currentView === 'settings'}
                onClick={() => { onViewChange('settings'); onClose(); }}
              />
            </div>

            {/* External Links */}
            <div className="mb-6">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-3 font-semibold">Resources</p>
              
              <ExternalLinkButton
                icon={<Github className="w-4 h-4" />}
                label="GitHub Repository"
                href="https://github.com/atulchoudhary7781-dot/AI-web"
              />

              <ExternalLinkButton
                icon={<Cpu className="w-4 h-4" />}
                label="AI Models"
                href="https://openrouter.ai/models"
              />

              <ExternalLinkButton
                icon={<BookOpen className="w-4 h-4" />}
                label="Documentation"
                href="https://openrouter.ai/docs"
              />

              <ExternalLinkButton
                icon={<FileText className="w-4 h-4" />}
                label="Vercel Docs"
                href="https://vercel.com/docs"
              />
            </div>

            {/* Chat History */}
            {sessions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Recent Chats</p>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{sessions.length}</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {sessions.slice(0, 8).map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        activeSessionId === session.id
                          ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent'
                      }`}
                      onClick={() => { onSelectSession(session.id); onClose(); }}
                    >
                      <History className="w-4 h-4 flex-shrink-0 opacity-60" />
                      <span className="text-sm truncate flex-1">{session.title}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Footer / Settings */}
          <div className="p-3 border-t border-gray-800/50 space-y-1 bg-gray-900/30">
            <button
              onClick={() => { onToggleTheme(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              <div className={`ml-auto w-8 h-5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-violet-500/30' : 'bg-gray-700'} relative`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
              </div>
            </button>

            <div className="pt-2 border-t border-gray-800/50">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">NEXUS User</p>
                  <p className="text-xs text-gray-500">Free Plan • v1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// Helper Components for Sidebar
function SidebarButton({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/5' 
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent hover:border-gray-700/50'
      }`}
    >
      <div className={`${active ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      )}
    </button>
  )
}

function ExternalLinkButton({ 
  icon, 
  label, 
  href 
}: { 
  icon: React.ReactNode
  label: string
  href: string 
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200 group border border-transparent hover:border-gray-700/50"
    >
      <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium flex-1">{label}</span>
      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
