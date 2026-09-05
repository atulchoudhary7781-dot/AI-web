'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { 
  Send, Bot, User, Copy, Check, RefreshCw, 
  Sparkles, Trash2, Maximize2, Minimize2,
  History, Plus, ThumbsUp, ThumbsDown, Share2,
  ChevronDown, Cpu, Zap, Brain, Star, Rocket, Lock,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { VoiceInput } from './VoiceInput'
import { ChatHistory, type ChatConversation } from './ChatHistory'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  showButtons?: boolean
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  speed: 'fast' | 'balanced' | 'powerful'
  isPopular?: boolean
  isNew?: boolean
  isLocked?: boolean
}

// ==================== CONSTANTS ====================
const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most capable, best for complex tasks',
    icon: Brain,
    color: 'text-green-400',
    speed: 'powerful',
    isPopular: true,
    isLocked: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Fast & affordable for everyday tasks',
    icon: Zap,
    color: 'text-blue-400',
    speed: 'fast',
    isNew: true,
    isLocked: true,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Great at reasoning & coding',
    icon: Star,
    color: 'text-orange-400',
    speed: 'balanced',
    isPopular: true,
    isLocked: true,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most intelligent for analysis',
    icon: Cpu,
    color: 'text-purple-400',
    speed: 'powerful',
    isLocked: true,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Multimodal & creative',
    icon: Sparkles,
    color: 'text-cyan-400',
    speed: 'balanced',
    isLocked: true,
  },
  {
    id: 'llama-3.1',
    name: 'Llama 3.1',
    provider: 'Meta',
    description: 'Open source & privacy focused - FREE',
    icon: Rocket,
    color: 'text-purple-300',
    speed: 'fast',
    isNew: true,
    isLocked: false,
  },
]

const DEFAULT_MODEL = AI_MODELS.find(m => m.id === 'llama-3.1') || AI_MODELS[5]

// ==================== MEMOIZED SUB-COMPONENTS ====================

// Model Icon Component - Optimized & Mobile Friendly
const ModelIcon = memo(({ model, size = 'md' }: { model: AIModel; size?: 'sm' | 'md' | 'lg' }) => {
  const Icon = model.icon
  const sizeClasses = {
    sm: 'w-8 h-8',      // Mobile: smaller
    md: 'w-10 h-10',    // Tablet/Desktop
    lg: 'w-12 h-12'     // Desktop large
  }
  
  return (
    <div className={cn(
      "flex-shrink-0 rounded-lg flex items-center justify-center relative bg-gradient-to-br",
      sizeClasses[size],
      model.speed === 'fast' && "from-blue-500/20 to-cyan-500/20",
      model.speed === 'balanced' && "from-purple-500/20 to-pink-500/20",
      model.speed === 'powerful' && "from-green-500/20 to-emerald-500/20"
    )}>
      <Icon className={cn("w-5 h-5", model.color)} />
      
      {/* Lock Overlay */}
      {model.isLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <Lock className="w-4 h-4 text-red-400" />
        </div>
      )}
    </div>
  )
})

ModelIcon.displayName = 'ModelIcon'

// Model Badge Component
const ModelBadge = memo(({ model }: { model: AIModel }) => {
  if (!model.isLocked) {
    return (
      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-500/30 text-green-400 rounded-full border border-green-500/40 hidden sm:inline-flex">
        ✓ FREE
      </span>
    )
  }
  
  return (
    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/30 text-red-400 rounded-full border border-red-500/40 animate-pulse hidden sm:inline-flex">
      🔒 PRO
    </span>
  )
})

ModelBadge.displayName = 'ModelBadge'

// Locked Banner Component
const LockedBanner = memo(() => (
  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 py-1 px-2 flex items-center justify-center gap-1.5 z-10">
    <Lock className="w-3 h-3 text-white" />
    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Subscription Required</span>
  </div>
))

LockedBanner.displayName = 'LockedBanner'

// Message Bubble Component - Fully Mobile Optimized
const MessageBubble = memo(({ 
  message, 
  isUser, 
  copiedId, 
  onCopy, 
  likedMessages, 
  dislikedMessages,
  onLike,
  onDislike,
  onRegenerate,
  t
}: { 
  message: Message
  isUser: boolean
  copiedId: string | null
  onCopy: (content: string, id: string) => void
  likedMessages: Set<string>
  dislikedMessages: Set<string>
  onLike: (id: string) => void
  onDislike: (id: string) => void
  onRegenerate: (id: string) => void
  t: (key: any) => string
}) => (
  <div className={cn("flex gap-3 sm:gap-4 chat-message-enter", isUser ? "flex-row-reverse" : "")}>
    {/* Avatar - Smaller on mobile */}
    <div className={cn(
      "flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg border",
      // Mobile: w-8 h-8, Desktop: w-9 h-9
      "w-8 h-8 sm:w-9 sm:h-9",
      isUser 
        ? "bg-gradient-to-br from-neon-cyan to-cyan-600 text-white border-neon-cyan/30" 
        : "bg-gradient-to-br from-gray-800 to-gray-900 text-white border-neon-purple/30"
    )}>
      {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
    </div>

    {/* Content - Max width optimized for mobile */}
    <div className={cn(
      "rounded-2xl shadow-lg px-3 py-3 sm:px-5 sm:py-4",
      // Mobile: max-w-[85%], Desktop: max-w-[80%]
      "max-w-[85%] sm:max-w-[80%]",
      isUser 
        ? "message-user bg-gradient-to-r from-neon-cyan/20 to-cyan-600/20 border border-neon-cyan/30 text-white" 
        : "message-ai bg-gray-800/50 backdrop-blur-sm border border-white/5 text-gray-100"
    )}>
      {/* Message Content - Responsive typography */}
      <div className="prose prose-invert prose-sm max-w-none message-content">
        {message.content.split('\n').map((line, i) => (
          <p key={i} className="mb-2 last:mb-0 text-sm sm:text-base">{line}</p>
        ))}
      </div>

      {/* Action Buttons - Hidden on small screens, shown on larger */}
      {!isUser && message.showButtons && (
        <div className="flex items-center gap-1 sm:gap-2 mt-3 pt-3 border-t border-white/5 overflow-x-auto">
          {/* Primary actions always visible */}
          <button
            onClick={() => onCopy(message.content, message.id)}
            className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-all duration-200 cursor-pointer flex-shrink-0",
              copiedId === message.id 
                ? "bg-green-500/20 text-green-400" 
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-neon-cyan"
            )}
            title={t('chat.copy')}
            type="button"
          >
            {copiedId === message.id ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          <button
            onClick={() => onRegenerate(message.id)}
            className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-neon-purple transition-all duration-200 cursor-pointer flex-shrink-0"
            title={t('chat.regenerate')}
            type="button"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className="flex-1 min-w-[8px]" />

          {/* Reaction buttons - Always visible but compact */}
          <button
            onClick={() => onLike(message.id)}
            className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-all duration-200 cursor-pointer flex-shrink-0",
              likedMessages.has(message.id)
                ? "bg-neon-cyan/25 text-neon-cyan"
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-neon-cyan"
            )}
            title="Good response"
            type="button"
          >
            <ThumbsUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${likedMessages.has(message.id) ? 'fill-neon-cyan' : ''}`} />
          </button>

          <button
            onClick={() => onDislike(message.id)}
            className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-all duration-200 cursor-pointer flex-shrink-0",
              dislikedMessages.has(message.id)
                ? "bg-red-500/25 text-red-400"
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400"
            )}
            title="Bad response"
            type="button"
          >
            <ThumbsDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${dislikedMessages.has(message.id) ? 'fill-red-400' : ''}`} />
          </button>

          {/* Share button - Hidden on very small screens */}
          <button
            className="hidden sm:flex p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-neon-cyan transition-all duration-200 cursor-pointer flex-shrink-0"
            title={t('chat.share')}
            type="button"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Timestamp & Copy for User Messages */}
      {isUser && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 justify-end">
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => onCopy(message.content, message.id)}
            className={cn(
              "p-1 rounded hover:bg-white/10 transition-colors cursor-pointer",
              copiedId === message.id ? "text-green-400" : "text-muted-foreground hover:text-neon-cyan"
            )}
            aria-label={t('chat.copy')}
            type="button"
          >
            {copiedId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  </div>
))

MessageBubble.displayName = 'MessageBubble'

// ==================== MAIN COMPONENT ====================
export function ChatInterface() {
  const { t } = useI18n()
  
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Greetings, human! I am NEXUS AI, your advanced neural companion. How may I assist you today?",
      timestamp: new Date(),
      showButtons: true,
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  
  // AI Model State - Default to Llama 3.1 (FREE)
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL!)
  const [showModelSelector, setShowModelSelector] = useState(false)
  
  // Reaction states
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle voice input transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    textareaRef.current?.focus()
  }, [])

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessageId = 'ai-' + Date.now()
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: `🤖 **${selectedModel.name}** (${selectedModel.provider})\n\nI've analyzed your query using ${selectedModel.name}. How can I help you further?`,
        timestamp: new Date(),
        showButtons: false,
      }
      
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
      
      // Show buttons after delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, showButtons: true } : msg
        ))
      }, 800)
    }, 1500 + Math.random() * 1000)
  }, [input, selectedModel])

  // Handle copy message
  const handleCopy = useCallback(async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  // Handle reactions
  const handleLike = useCallback((id: string) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
    setDislikedMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  const handleDislike = useCallback((id: string) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
    setLikedMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  // Handle regenerate response
  const handleRegenerate = useCallback((id: string) => {
    setRegeneratingId(id)
    
    setTimeout(() => {
      const regeneratedContent = `🔄 **Regenerated Response (${selectedModel.name}**)\n\nHere's my fresh perspective based on ${selectedModel.provider}'s capabilities.\n\nWould you like me to explore anything specific?`
      
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, content: regeneratedContent, showButtons: true } : msg
      ))
      setRegeneratingId(null)
    }, 1500 + Math.random() * 1000)
  }, [selectedModel])

  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Clear chat
  const handleClearChat = useCallback(() => {
    if (window.confirm(t('chat.clearConfirm'))) {
      setMessages([])
      setLikedMessages(new Set())
      setDislikedMessages(new Set())
    }
  }, [t])

  // Handle model selection
  const handleModelSelect = useCallback((model: AIModel) => {
    if (model.isLocked) {
      alert('🔒 Subscription Required!\n\nThis model is only available with a premium subscription.\nComing soon!')
      return
    }
    setSelectedModel(model)
    setShowModelSelector(false)
  }, [])

  // Memoized values
  const sortedModels = useMemo(() => [...AI_MODELS].sort((a, b) => {
    if (a.isLocked === b.isLocked) return 0
    return a.isLocked ? 1 : -1
  }), [])

  return (
    <div className="flex flex-col h-[100dvh] bg-dark-bg text-foreground font-sans antialiased overflow-hidden">
      {/* ==================== HEADER - MOBILE OPTIMIZED ==================== */}
      <header className="flex-shrink-0 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-white/10 bg-dark-surface/95 backdrop-blur-md z-20 safe-area-top">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-electric-blue bg-clip-text text-transparent truncate">
            NEXUS AI
          </h1>
          <Badge variant="cyberpunk" className="hidden md:inline-flex text-[10px]">
            Neural v4.0
          </Badge>
        </div>
        
        {/* Right: Action Buttons - Touch friendly (44px+ tap target) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Clear chat - Hidden on small mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="hidden sm:flex text-muted-foreground hover:text-red-400 h-9 w-9"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          {/* History */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className="text-muted-foreground hover:text-neon-cyan h-9 w-9 sm:h-10 sm:w-10"
          >
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          {/* Expand/Collapse - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden sm:flex text-muted-foreground hover:text-neon-cyan h-9 w-9"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* ==================== MESSAGES AREA - FULLY RESPONSIVE ==================== */}
      <div className="messages-container flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-neon-cyan/20 scrollbar-track-transparent">
        {messages.length === 0 ? (
          /* Empty State - Centered & Responsive */
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 sm:space-y-6 px-4">
            {/* Icon - Smaller on mobile */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neon-cyan via-neon-purple to-electric-blue p-[2px] animate-pulse-slow">
              <div className="w-full h-full rounded-2xl sm:rounded-3xl bg-dark-bg flex items-center justify-center">
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-neon-cyan" />
              </div>
            </div>
            
            {/* Text - Responsive sizes */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Ready to Connect
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground max-w-xs sm:max-w-md">
                Start a conversation with NEXUS AI. Ask anything!
              </p>
            </div>
          </div>
        ) : (
          /* Messages List */
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === 'user'}
              copiedId={copiedId}
              onCopy={handleCopy}
              likedMessages={likedMessages}
              dislikedMessages={dislikedMessages}
              onLike={handleLike}
              onDislike={handleDislike}
              onRegenerate={handleRegenerate}
              t={t}
            />
          ))
        )}

        {/* Typing Indicator - Compact on mobile */}
        {isTyping && (
          <div className="flex gap-3 sm:gap-4 chat-message-enter">
            <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center shadow-lg border border-neon-purple/30">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="message-ai px-3 py-2 sm:px-5 sm:py-4 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-typing" />
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-typing" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-typing" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ==================== INPUT AREA - MOBILE FIRST ==================== */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 border-t border-white/10 bg-dark-surface/95 backdrop-blur-md safe-area-bottom">
        
        {/* AI Model Selector - Compact on mobile */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="relative z-30">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 group",
                selectedModel.isLocked 
                  ? "bg-red-500/10 border-red-500/40 hover:border-red-500/60" 
                  : "bg-green-500/10 border-green-500/30 hover:border-green-500/50"
              )}
              aria-label="Select AI Model"
            >
              <selectedModel.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", selectedModel.color)} />
              
              {/* Model Name - Truncated on mobile */}
              <span className={cn(
                "group-hover:text-foreground max-w-[60px] sm:max-w-none truncate",
                selectedModel.isLocked ? "text-red-400" : "text-green-400"
              )}>{selectedModel.name}</span>
              
              {/* Status Badge - Only on desktop */}
              {selectedModel.isLocked ? (
                <Lock className="w-3 h-3 text-red-400 hidden sm:block" />
              ) : (
                <Check className="w-3 h-3 text-green-400 hidden sm:block" />
              )}
              
              <ChevronDown className={cn(
                "w-3 h-3 text-muted-foreground transition-transform duration-200",
                showModelSelector && "rotate-180"
              )} />
            </button>

            {/* ==================== MODEL SELECTOR DROPDOWN ==================== */}
            {showModelSelector && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
                  onClick={() => setShowModelSelector(false)} 
                />
                
                {/* Dropdown Panel - BOTTOM SHEET ON MOBILE, DROPUP ON DESKTOP */}
                <div className={cn(
                  // Mobile: Full width bottom sheet
                  // Desktop: Dropup from button
                  "fixed sm:absolute inset-x-0 sm:inset-x-auto bottom-0 sm:bottom-auto left-0 sm:left-0 right-0 sm:right-auto",
                  "z-50 mb-0 sm:mb-2 w-full sm:w-80",
                  "bg-gray-900/98 backdrop-blur-xl border border-white/10 sm:border-neon-cyan/20",
                  "rounded-t-2xl sm:rounded-xl shadow-2xl shadow-black/50 overflow-hidden",
                  "animate-in slide-in-from-bottom-4 sm:animate-in fade-in zoom-in-95 duration-200"
                )}>
                  {/* Header with Close Button (Mobile) */}
                  <div className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-500 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        SELECT AI MODEL
                      </p>
                      <p className="text-[10px] sm:text-xs text-white/80 mt-0.5">Llama 3.1 is FREE</p>
                    </div>
                    
                    {/* Close button for mobile */}
                    <button
                      onClick={() => setShowModelSelector(false)}
                      className="sm:hidden p-1 rounded-lg hover:bg-white/10 text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Models List - Scrollable */}
                  <div className="model-list-scroll p-2 sm:p-3 max-h-[50vh] sm:max-h-64 overflow-y-auto scrollbar-thin">
                    {sortedModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model)}
                        disabled={model.isLocked}
                        className={cn(
                          "w-full flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-left relative overflow-hidden mt-1.5 sm:mt-2 first:mt-0",
                          "transition-all duration-150 group/model",
                          model.isLocked 
                            ? "opacity-70 cursor-not-allowed bg-red-500/5 border border-red-500/20" 
                            : "hover:bg-white/5 cursor-pointer border border-transparent",
                          selectedModel.id === model.id && !model.isLocked && "bg-neon-cyan/10 border-neon-cyan/30",
                          selectedModel.id === model.id && model.isLocked && "bg-yellow-500/10 border-yellow-500/30"
                        )}
                      >
                        {/* Lock Banner */}
                        {model.isLocked && <LockedBanner />}

                        {/* Model Icon - Smaller on mobile */}
                        <ModelIcon model={model} size="sm" />

                        {/* Model Info */}
                        <div className="flex-1 min-w-0 mt-2 sm:mt-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className={cn(
                              "font-medium text-xs sm:text-sm truncate",
                              model.isLocked ? "text-gray-300 line-through" : "text-foreground"
                            )}>{model.name}</span>
                            
                            <ModelBadge model={model} />
                            
                            {model.isPopular && !model.isLocked && (
                              <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold bg-neon-cyan/20 text-neon-cyan rounded hidden sm:inline-block">POPULAR</span>
                            )}
                            {model.isNew && (
                              <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold bg-purple-500/20 text-purple-400 rounded">NEW</span>
                            )}
                          </div>
                          
                          <p className={cn(
                            "text-[10px] sm:text-xs mt-0.5 truncate",
                            model.isLocked ? "text-gray-500" : "text-muted-foreground"
                          )}>{model.provider}</p>
                          
                          {/* Speed indicator - Only on desktop */}
                          <div className="items-center gap-1 mt-1.5 sm:mt-2 hidden sm:flex">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              model.speed === 'fast' && "bg-blue-400",
                              model.speed === 'balanced' && "bg-yellow-400",
                              model.speed === 'powerful' && "bg-red-400"
                            )} />
                            <span className="text-[10px] uppercase tracking-wider text-gray-500">{model.speed}</span>
                          </div>

                          {/* Upgrade CTA */}
                          {model.isLocked && (
                            <p className="text-[9px] sm:text-[10px] text-orange-400 mt-1.5 sm:mt-2 font-medium animate-pulse">
                              → Unlock with subscription
                            </p>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        {selectedModel.id === model.id && !model.isLocked && (
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-2 sm:mt-3" />
                        )}
                        {selectedModel.id === model.id && model.isLocked && (
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-2 sm:mt-3" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 sm:py-2.5 bg-black/30 border-t border-white/5">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 text-center">
                      ⚡ Current: <span className={cn("font-medium", selectedModel.isLocked ? "text-red-400" : "text-green-400")}>{selectedModel.name}</span>
                      {selectedModel.isLocked ? " 🔒" : " ✓"}
                    </p>
                  </div>
                  
                  {/* Safe area padding for mobile */}
                  <div className="h-safe-area-inset-bottom sm:hidden" />
                </div>
              </>
            )}
          </div>

          {/* Quick Info Badges - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className={cn("w-2 h-2 rounded-full", 
                selectedModel.speed === 'fast' && "bg-blue-400",
                selectedModel.speed === 'balanced' && "bg-yellow-400",
                selectedModel.speed === 'powerful' && "bg-red-400"
              )} />
              {selectedModel.speed}
            </span>
            <span>•</span>
            <span>Enter to send</span>
          </div>
        </div>

        {/* ==================== INPUT BOX - TOUCH FRIENDLY ==================== */}
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              // Mobile: min-h bigger for easier tapping
              className="min-h-[48px] sm:min-h-[52px] max-h-[120px] sm:max-h-[150px] pr-20 sm:pr-24 resize-none text-sm sm:text-base"
            />
            
            {/* Right Side Buttons Inside Textarea */}
            <div className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 flex items-center gap-0.5 sm:gap-1">
              {/* Character count - Only on desktop or when typing */}
              {input.length > 0 && (
                <span className="text-[10px] sm:text-xs text-muted-foreground mr-0.5 hidden sm:inline">
                  {input.length}
                </span>
              )}
              
              {/* Voice Input Button - Touch friendly (40px+) */}
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                disabled={isTyping}
                className="w-8 h-8 sm:w-8 sm:h-8"
              />
            </div>
          </div>

          {/* Send Button - Larger on mobile for easy tapping */}
          <Button
            variant="neon"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 h-[48px] w-[48px] sm:h-[52px] sm:w-[52px]"
            aria-label={t('chat.send')}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Input Hints - Hidden on mobile to save space */}
        <div className="hidden sm:flex items-center justify-between mt-2 sm:mt-3">
          <div className="flex items-center gap-2">
            <Badge variant="cyberpunk" className="text-[9px]">Secure</Badge>
            <Badge variant="cyberpunk" className="text-[9px]">Encrypted</Badge>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            Enter · Shift+Enter for new line
          </span>
        </div>
      </div>

      {/* ==================== CHAT HISTORY SIDEBAR ==================== */}
      {showHistory && (
        <ChatHistory
          onLoadConversation={(conv) => {
            setCurrentConversation(conv)
            setShowHistory(false)
          }}
          onNewChat={() => {
            setMessages([])
            setCurrentConversation(null)
            setShowHistory(false)
          }}
          currentChatId={currentConversation?.id}
        />
      )}
    </div>
  )
}

export default ChatInterface
