'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Send, Copy, Check, Sparkles, User, Bot, 
  ThumbsUp, ThumbsDown, RotateCcw, StopCircle,
  Crown, LogIn, Settings, Menu, Mic, Paperclip,
  X, Maximize2
} from 'lucide-react'

// ============================================
// TYPES
// ============================================
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface FullScreenChatProps {
  onToggleSidebar?: () => void
  onNewChat?: () => void
  sessionId?: string
  isLoggedIn?: boolean
  canChat?: boolean
  onLoginRequired?: () => void
  onLoginClick?: () => void
  onSignupClick?: () => void
  onSettingsClick?: () => void
  userName?: string | null
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function FullScreenChat({
  onToggleSidebar,
  onNewChat,
  sessionId,
  isLoggedIn = false,
  canChat = true,
  onLoginRequired,
  onLoginClick,
  onSignupClick,
  onSettingsClick,
  userName
}: FullScreenChatProps) {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && canChat) {
      inputRef.current.focus()
    }
  }, [canChat])

  // Handle send message
  const handleSend = async () => {
    const trimmedInput = inputValue.trim()
    if (!trimmedInput || !canChat) return
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thank you for your message! I'm NEXUS AI, your intelligent assistant. I'm here to help you with any questions or tasks you might have.\n\nYou said: "${trimmedInput}"\n\nHow can I assist you further?`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  // Handle copy message
  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Check if chat has messages
  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full bg-[#030712]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-white">NEXUS AI</h1>
              <p className="text-xs text-gray-500">Powered by Llama 3.1</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors"
              aria-label="New chat"
            >
              <Maximize2 className="w-5 h-5 text-gray-400" />
            </button>
          )}
          
          {/* Settings Button */}
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          )}

          {/* User Menu / Login */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pr-3 hover:bg-white/[0.06] rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
                  {userName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm text-gray-300">{userName || 'User'}</span>
              </button>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[#1a1a2e] border border-white/[0.08] rounded-xl shadow-xl shadow-black/50 z-50 animate-fade-in">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/[0.06] transition-colors">
                      Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/[0.06] transition-colors">
                      Settings
                    </button>
                    <hr className="my-2 border-white/[0.06]" />
                    <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Welcome Screen */
          <WelcomeScreen 
            onStartChat={() => inputRef.current?.focus()}
            onSignupClick={onSignupClick}
          />
        ) : (
          /* Messages List */
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                copied={copiedId === message.id}
                onCopy={() => handleCopy(message.content, message.id)}
              />
            ))}
            
            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="border-t border-white/[0.06] p-4 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          {!isLoggedIn && (
            <div className="mb-3 text-center">
              <p className="text-xs text-gray-500">
                <span className="text-cyan-400 cursor-pointer hover:underline" onClick={onLoginClick}>Sign in</span>
                {' '}to save your chat history
              </p>
            </div>
          )}
          
          <div className="relative flex items-end gap-2 p-2 bg-[#0f172a] border border-white/[0.08] rounded-2xl focus-within:border-cyan-500/50 focus-within:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] transition-all duration-200">
            {/* Attachment Button */}
            <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-gray-500 hover:text-gray-300" aria-label="Attach file">
              <Paperclip className="w-5 h-5" />
            </button>
            
            {/* Text Input */}
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={canChat ? "Ask NEXUS AI anything..." : "Sign in to continue chatting"}
              disabled={!canChat}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none max-h-32 text-sm leading-relaxed py-2"
              style={{ minHeight: '44px' }}
            />
            
            {/* Voice Button */}
            <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-gray-500 hover:text-gray-300" aria-label="Voice input">
              <Mic className="w-5 h-5" />
            </button>
            
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || !canChat || isTyping}
              className="p-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95"
              aria-label="Send message"
            >
              {isTyping ? (
                <StopCircle className="w-5 h-5 text-white" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          
          {/* Footer Note */}
          <p className="mt-2 text-center text-xs text-gray-600">
            NEXUS AI makes mistakes. Consider checking important information.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// WELCOME SCREEN COMPONENT
// ============================================
function WelcomeScreen({ 
  onStartChat, 
  onSignupClick 
}: { 
  onStartChat: () => void
  onSignupClick?: () => void
}) {
  const features = [
    { icon: '💡', title: 'Explain a concept', desc: 'Learn anything in simple terms', emoji: '📚' },
    { icon: '✍️', title: 'Help me write', desc: 'Essays, emails, creative content', emoji: '📝' },
    { icon: '🔧', title: 'Code assistance', desc: 'Debug, explain, or write code', emoji: '💻' },
    { icon: '📊', title: 'Analyze data', desc: 'Get insights from information', emoji: '📈' }
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 animate-fade-in">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="inline-flex mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-3xl blur-2xl opacity-30 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            NEXUS AI
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-gray-400 mb-3">
          Powered by Llama 3.1 • Free Forever
        </p>
        
        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400">
            ⚡ AI-Powered
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-sm text-yellow-400">
            ⚡ Lightning Fast
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-400">
            🔒 Secure & Private
          </span>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={onStartChat}
              className="group p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// MESSAGE BUBBLE COMPONENT
// ============================================
function MessageBubble({ 
  message, 
  copied, 
  onCopy 
}: { 
  message: ChatMessage
  copied: boolean
  onCopy: () => void
}) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-cyan-500 to-violet-600' 
            : 'bg-gradient-to-br from-violet-500 to-purple-600'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`relative group ${
          isUser ? 'message-user' : 'message-ai'
        }`}>
          <div className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
          
          {/* Action Buttons - Show on Hover */}
          <div className={`absolute -bottom-8 ${isUser ? 'right-0' : 'left-0'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button
              onClick={onCopy}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors" aria-label="Like">
              <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-400" />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors" aria-label="Dislike">
              <ThumbsDown className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors" aria-label="Regenerate">
              <RotateCcw className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// TYPING INDICATOR COMPONENT
// ============================================
function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        
        <div className="bg-[#0f172a]/90 border border-violet-500/20 rounded-2xl rounded-bl-md px-5 py-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce-dot" />
            <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce-dot" />
            <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce-dot" />
          </div>
        </div>
      </div>
    </div>
  )
}
