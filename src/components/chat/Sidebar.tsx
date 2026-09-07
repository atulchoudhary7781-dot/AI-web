'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare, Home, Settings,
  Plus, Trash2, X, User, History, Sparkles, 
  LogIn, LogOut, UserCircle, Crown
} from 'lucide-react'

// ============================================
// TYPES
// ============================================
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
  onLogoutClick: () => void
  chatCount?: number
  maxChats?: number
}

interface User {
  name: string
  email: string
}

// ============================================
// SIDEBAR COMPONENT
// ============================================
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
  isLoggedIn = false,
  user = null,
  onLoginClick,
  onSignupClick,
  onLogoutClick,
  chatCount = 0,
  maxChats = 6
}: SidebarProps) {
  const router = useRouter()
  
  // Close sidebar on ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    
    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-gradient-to-b from-[#0f172a] to-[#1a1a2e] backdrop-blur-xl border-r border-white/[0.08] z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-white/[0.06]">
            {/* Logo & Close */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                    NEXUS AI
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Powered by Llama</p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="p-2 hover:bg-red-500/20 rounded-xl transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            
            {/* New Chat Button */}
            <button
              onClick={() => { 
                onNewChat() 
                onClose() 
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
            
            {/* Upgrade Pro Button */}
            <a
              href="/pricing"
              onClick={(e) => { 
                e.preventDefault() 
                onClose() 
                window.location.href = '/pricing' 
              }}
              className="flex items-center gap-3 mt-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30 text-white hover:border-violet-500/50 transition-all duration-200 group"
            >
              <Crown className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="flex-1 font-semibold text-sm">Upgrade Pro</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-full">
                PRO
              </span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
            {/* Main Menu Section */}
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 px-3 font-semibold">
                Main Menu
              </p>
              
              <div className="space-y-1">
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
                  icon={<Settings className="w-4 h-4" />}
                  label="Settings"
                  active={currentView === 'settings'}
                  onClick={() => { onViewChange('settings'); onClose(); }}
                />

                {isLoggedIn && (
                  <SidebarButton
                    icon={<UserCircle className="w-4 h-4" />}
                    label="My Profile"
                    active={false}
                    onClick={() => { router.push('/profile'); onClose(); }}
                  />
                )}
              </div>
            </div>

            {/* Recent Chats Section */}
            {sessions.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-3 mb-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Recent Chats
                  </p>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-medium">
                    {sessions.length}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {sessions.slice(0, 8).map((session) => (
                    <ChatSessionItem
                      key={session.id}
                      session={session}
                      isActive={activeSessionId === session.id}
                      onSelect={() => { onSelectSession(session.id); onClose(); }}
                      onDelete={(e) => { 
                        e.stopPropagation() 
                        onDeleteSession(session.id) 
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Footer - User Section */}
          <div className="flex-shrink-0 p-3 border-t border-white/[0.06]">
            {isLoggedIn && user ? (
              /* Logged In User */
              <div className="space-y-2">
                <button
                  onClick={() => { router.push('/profile'); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-green-400">Unlimited Access</p>
                  </div>
                </button>
                
                <button
                  onClick={() => { onLogoutClick(); onClose(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              /* Guest User */
              <div className="space-y-2">
                {/* Usage Progress */}
                <div className="px-3 py-2.5 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Free Messages</span>
                    <span className={`text-xs font-semibold ${chatCount >= maxChats ? 'text-red-400' : 'text-cyan-400'}`}>
                      {chatCount}/{maxChats}
                    </span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        chatCount >= maxChats ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-violet-500'
                      }`}
                      style={{ width: `${Math.min((chatCount / maxChats) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  onClick={() => { onLoginClick?.(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-colors"
                >
                  <LogIn className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Sign In</p>
                    <p className="text-xs text-gray-500">Access all features</p>
                  </div>
                </button>

                {/* Signup Button */}
                <button
                  onClick={() => { onSignupClick?.(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-violet-500/10 border border-violet-500/30 rounded-xl hover:bg-violet-500/20 transition-colors"
                >
                  <LogIn className="w-5 h-5 text-violet-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Create Account</p>
                    <p className="text-xs text-gray-500">Save your history</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

// ============================================
// SIDEBAR BUTTON COMPONENT
// ============================================
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-400 border border-cyan-500/30'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      <div className={`${active ? 'text-cyan-400' : 'text-gray-500'} transition-colors`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      
      {/* Active Indicator */}
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      )}
    </button>
  )
}

// ============================================
// CHAT SESSION ITEM COMPONENT
// ============================================
function ChatSessionItem({
  session,
  isActive,
  onSelect,
  onDelete
}: {
  session: ChatSession
  isActive: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-400 border border-cyan-500/30'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      <History className="w-4 h-4 opacity-60 flex-shrink-0" />
      
      <span className="text-sm truncate flex-1">{session.title}</span>
      
      {/* Delete Button - Show on Hover */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-md transition-all"
        aria-label="Delete chat"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-400" />
      </button>
    </div>
  )
}
