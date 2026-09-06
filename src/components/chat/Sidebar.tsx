'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare, Home, Layers, TrendingUp, Settings,
  Plus, Trash2, X, User, History, Sparkles, LogIn, LogOut,
  UserCircle, Crown
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
  isLoggedIn?: boolean
  user?: User | null
  onLoginClick?: () => void
  onSignupClick?: () => void
  onLogoutClick?: () => void
  chatCount?: number
  maxChats?: number
}

interface User {
  name: string
  email: string
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
  onToggleTheme,
  isLoggedIn = false,
  user = null,
  onLoginClick,
  onSignupClick,
  onLogoutClick,
  chatCount = 0,
  maxChats = 6
}: SidebarProps) {
  const router = useRouter()
  
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose])

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      )}
      
      <aside 
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-gradient-to-b from-gray-950 to-gray-900 backdrop-blur-xl border-r border-cyan-500/30 z-50 transform transition-all duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">NEXUS AI</span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Powered by Llama</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <Button 
              onClick={() => { onNewChat(); onClose(); }}
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white h-11"
            >
              <Plus className="w-4 h-4 mr-2" /> New Chat
            </Button>
            
            {/* Upgrade Pro Button - ALWAYS VISIBLE ON ALL DEVICES */}
            <a
              href="/pricing"
              onClick={(e) => { e.preventDefault(); onClose(); setTimeout(() => window.location.href = '/pricing', 100); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                gap: '8px',
                padding: '12px 14px',
                minHeight: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.45), rgba(236, 72, 153, 0.45))',
                border: '2px solid rgba(168, 85, 247, 0.75)',
                color: '#ffffff',
                textDecoration: 'none',
                marginTop: '10px',
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.35), 0 0 40px rgba(168, 85, 247, 0.15)',
                boxSizing: 'border-box',
                position: 'relative',
                zIndex: 10,
                touchAction: 'manipulation'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="2.5">
                <path d="M2 10s3-5 10-5 10 5 10 5-3 5-10 5S2 10 2 10z"/>
                <path d="M12 15a5 5 0 0 1-5-5h10a5 5 0 0 1-5 5z" fill="#facc15"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 800, flex: 1, letterSpacing: '0.3px' }}>Upgrade Pro</span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #facc15, #f97316, #ef4444)',
                color: '#000000',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>⭐ PRO</span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="mb-6">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-3 font-semibold">Main Menu</p>
              
              <SidebarButton icon={<MessageSquare className="w-4 h-4" />} label="AI Chat" active={currentView === 'chat'} onClick={() => { onViewChange('chat'); onClose(); }} />
              <SidebarButton icon={<Home className="w-4 h-4" />} label="Home" active={currentView === 'home'} onClick={() => { onViewChange('home'); onClose(); }} />
              <SidebarButton icon={<Layers className="w-4 h-4" />} label="Features" active={currentView === 'features'} onClick={() => { onViewChange('features'); onClose(); }} />
              <SidebarButton icon={<TrendingUp className="w-4 h-4" />} label="Statistics" active={currentView === 'stats'} onClick={() => { onViewChange('stats'); onClose(); }} />
              <SidebarButton icon={<Settings className="w-4 h-4" />} label="Settings" active={currentView === 'settings'} onClick={() => { onViewChange('settings'); onClose(); }} />

              {isLoggedIn && (
                <SidebarButton icon={<UserCircle className="w-4 h-4" />} label="My Profile" active={false} onClick={() => { router.push('/profile'); onClose(); }} />
              )}
            </div>

            {/* Chat History */}
            {sessions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Recent Chats</p>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{sessions.length}</span>
                </div>
                <div className="space-y-1">
                  {sessions.slice(0, 8).map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        activeSessionId === session.id
                          ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent'
                      }`}
                      onClick={() => { onSelectSession(session.id); onClose(); }}
                    >
                      <History className="w-4 h-4 opacity-60" />
                      <span className="text-sm truncate flex-1">{session.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 p-3 border-t border-gray-800/50">
            {isLoggedIn && user ? (
              <div className="space-y-2">
                <button onClick={() => { router.push('/profile'); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800/50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                    {(user as any).avatar ? <img src={(user as any).avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" /> : <User className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{user.name}</p>
                    <p className="text-xs text-green-400">✓ Unlimited Chats</p>
                  </div>
                </button>
                {onLogoutClick && (
                  <button onClick={() => { onLogoutClick(); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Free Chats</span>
                    <span className={`font-medium ${chatCount >= maxChats ? 'text-red-400' : 'text-cyan-400'}`}>{chatCount}/{maxChats}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${chatCount >= maxChats ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-violet-500'}`} style={{ width: `${Math.min((chatCount / maxChats) * 100, 100)}%` }} />
                  </div>
                </div>
                <button onClick={() => { onLoginClick?.(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20">
                  <LogIn className="w-5 h-5 text-cyan-400" />
                  <div className="text-left"><p className="text-sm font-medium text-white">Login</p><p className="text-xs text-gray-500">Already have account</p></div>
                </button>
                <button onClick={() => { onSignupClick?.(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 bg-violet-500/10 border border-violet-500/30 rounded-xl hover:bg-violet-500/20">
                  <LogIn className="w-5 h-5 text-violet-400" />
                  <div className="text-left"><p className="text-sm font-medium text-white">Create Account</p><p className="text-xs text-gray-500">Save history - Free</p></div>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-400 border border-cyan-500/30'
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent'
      }`}
    >
      <div className={`${active ? 'text-cyan-400' : 'text-gray-500'}`}>{icon}</div>
      <span className="text-sm font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
    </button>
  )
}
