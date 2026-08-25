'use client'

import { 
  MessageSquare, Home, Layers, TrendingUp, Settings,
  Github, Cpu, BookOpen, FileText, Plus, Trash2, Moon, Sun,
  ChevronLeft, X, User, History, Sparkles
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
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-950/95 backdrop-blur-xl border-r border-cyan-500/20 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span className="text-lg font-bold font-[family-name:var(--font-orbitron)] bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  NEXUS AI
                </span>
              </div>
              <button 
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* New Chat Button */}
            <Button 
              onClick={onNewChat}
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white glow-cyan"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Main Views */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Menu</p>
              
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
            </div>

            {/* External Links */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Resources</p>
              
              <ExternalLinkButton
                icon={<Github className="w-4 h-4" />}
                label="GitHub"
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
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Chats</p>
                <div className="space-y-1">
                  {sessions.slice(0, 10).map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        activeSessionId === session.id
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={() => { onSelectSession(session.id); onClose(); }}
                    >
                      <History className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate flex-1">{session.title}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
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
          <div className="p-4 border-t border-gray-800 space-y-2">
            <SidebarButton
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
              active={currentView === 'settings'}
              onClick={() => { onViewChange('settings'); onClose(); }}
            />

            <button
              onClick={onToggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <div className="pt-2 border-t border-gray-800">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">NEXUS User</p>
                  <p className="text-xs text-gray-500">Free Plan</p>
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
        active 
          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
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
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
    >
      {icon}
      <span className="text-sm">{label}</span>
    </a>
  )
}
