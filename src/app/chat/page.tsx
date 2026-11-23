'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, LogIn, LogOut, Menu, Plus, Sparkles, X } from 'lucide-react'
import { clearSessionUser, getSessionUser, saveSessionUser } from '@/lib/session'
import Sidebar from '@/components/chat/Sidebar'
import FullScreenChat from '@/components/chat/FullScreenChat'
import AuthModal from '@/components/chat/AuthModal'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  date: Date
  messages: ChatMessage[]
}

interface User {
  name: string
  email: string
}

const MAX_FREE_CHATS = 6

export default function ChatPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [chatEpoch, setChatEpoch] = useState(0)
  const [chatCount, setChatCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalReason, setAuthModalReason] = useState<'chat_limit' | 'file_attach'>('chat_limit')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const canChat = isLoggedIn || chatCount < MAX_FREE_CHATS

  useEffect(() => {
    const session = getSessionUser()
    if (session) {
      setIsLoggedIn(true)
      setUser(session)
    }
    const savedChatCount = localStorage.getItem('nexus_chat_count')
    if (savedChatCount) {
      const parsed = parseInt(savedChatCount, 10)
      if (Number.isFinite(parsed) && parsed >= 0) setChatCount(parsed)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    const savedSessions = localStorage.getItem('nexus_sessions')
    if (!savedSessions) return
    try {
      setSessions(JSON.parse(savedSessions))
    } catch {
      /* ignore bad cache */
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn && sessions.length > 0) {
      localStorage.setItem('nexus_sessions', JSON.stringify(sessions))
    }
  }, [sessions, isLoggedIn])

  const handleLogin = (userData: User) => {
    saveSessionUser(userData)
    setIsLoggedIn(true)
    setUser(userData)
    setShowAuthModal(false)
    setChatCount(0)
    localStorage.removeItem('nexus_chat_count')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setSessions([])
    setActiveSessionId(null)
    setChatCount(0)
    setChatEpoch((value) => value + 1)
    clearSessionUser()
    localStorage.removeItem('nexus_sessions')
    localStorage.removeItem('nexus_chat_count')
  }

  const handleGuestMessageSent = () => {
    if (isLoggedIn) return
    setChatCount((prev) => {
      const next = prev + 1
      localStorage.setItem('nexus_chat_count', String(next))
      if (next >= MAX_FREE_CHATS) {
        setTimeout(() => {
          setAuthModalReason('chat_limit')
          setShowAuthModal(true)
        }, 400)
      }
      return next
    })
  }

  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      date: new Date(),
      messages: [],
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setChatEpoch((value) => value + 1)
    setSidebarOpen(false)
  }, [])

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id)
    setSidebarOpen(false)
  }, [])

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id))
    setActiveSessionId((current) => (current === id ? null : current))
  }, [])

  return (
    <div className="nexus-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((open) => !open)}
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onViewChange={() => {}}
        currentView="chat"
        isDarkMode
        onToggleTheme={() => {}}
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => router.push('/login')}
        onSignupClick={() => router.push('/signup')}
        onLogoutClick={handleLogout}
        chatCount={chatCount}
        maxChats={MAX_FREE_CHATS}
      />

      <div className="nexus-main">
        <header className="nexus-topbar">
          <div className="nexus-topbar-left">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className={`liquid-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                sidebarOpen ? 'rotate-90' : ''
              }`}
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? (
                <X className="h-[18px] w-[18px] text-red-400" />
              ) : (
                <Menu className="h-[18px] w-[18px] text-amber-100" />
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/chat')}
              className="flex min-w-0 items-center gap-2"
              title="Open chat"
            >
              <div className="liquid-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Sparkles className="h-4 w-4 text-amber-100" />
              </div>
              <span className="hidden truncate text-[15px] font-semibold tracking-wide text-white min-[380px]:inline">
                NEXUS AI
              </span>
            </button>
          </div>

          <a
            href="/pricing"
            className="nexus-topbar-center liquid-glass hidden h-10 items-center gap-1.5 rounded-full px-4 text-xs font-bold text-white sm:inline-flex"
          >
            <Crown className="h-3.5 w-3.5 text-yellow-300" />
            PRO
          </a>

          <div className="nexus-topbar-right">
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="liquid-glass inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-white sm:px-4"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="liquid-glass inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-red-300 sm:px-4"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="liquid-glass inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-white"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
            )}
          </div>
        </header>

        <div className="nexus-content">
          <FullScreenChat
            key={chatEpoch}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
            onNewChat={handleNewChat}
            sessionId={activeSessionId || undefined}
            isLoggedIn={isLoggedIn}
            canChat={canChat}
            onGuestMessageSent={handleGuestMessageSent}
            onLoginRequired={() => {
              setAuthModalReason('chat_limit')
              setShowAuthModal(true)
            }}
            onLoginClick={() => router.push('/login')}
            onSignupClick={() => router.push('/signup')}
            onSettingsClick={() => router.push('/settings')}
            userName={user?.name}
            userEmail={user?.email}
          />
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onSignup={handleLogin}
        chatCount={chatCount}
        maxChats={MAX_FREE_CHATS}
        reason={authModalReason}
      />
    </div>
  )
}
