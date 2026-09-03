'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Send, Bot, User, Copy, Check, RefreshCw, 
  Sparkles, Trash2, Maximize2, Minimize2,
  History, Plus, ThumbsUp, ThumbsDown, Share2,
  ChevronDown, Cpu, Zap, Brain, Star, Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { VoiceInput } from './VoiceInput'
import { ChatHistory, type ChatConversation } from './ChatHistory'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  showButtons?: boolean // New flag to show buttons
}

// AI Model Options
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
}

const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most capable, best for complex tasks',
    icon: Brain,
    color: 'text-green-400',
    speed: 'powerful',
    isPopular: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Fast & affordable for everyday tasks',
    icon: Zap,
    color: 'text-blue-400',
    speed: 'fast',
    isNew: true
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Great at reasoning & coding',
    icon: Star,
    color: 'text-orange-400',
    speed: 'balanced',
    isPopular: true
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most intelligent for analysis',
    icon: Cpu,
    color: 'text-purple-400',
    speed: 'powerful'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Multimodal & creative',
    icon: Sparkles,
    color: 'text-cyan-400',
    speed: 'balanced'
  },
  {
    id: 'llama-3.1',
    name: 'Llama 3.1',
    provider: 'Meta',
    description: 'Open source & privacy focused',
    icon: Rocket,
    color: 'text-purple-300',
    speed: 'fast',
    isNew: true
  }
]

// Sample messages for demo
const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Greetings, human. I am NEXUS AI, your advanced neural companion. I'm designed to assist with complex reasoning, creative tasks, and deep analysis. How may I serve you today?",
    timestamp: new Date(),
    showButtons: true, // Initial message shows buttons
  },
]

export function ChatInterface() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Feature C: Chat History state
  const [showHistory, setShowHistory] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  
  // AI Model Selector State
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])
  const [showModelSelector, setShowModelSelector] = useState(false)
  
  // Reaction states - using simple object
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle voice input transcript - Feature D
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    textareaRef.current?.focus()
  }, [])

  // Handle send message
  const handleSend = async () => {
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
        content: `🤖 **${selectedModel.name}** (${selectedModel.provider})\n\nI've analyzed your query about "${input.slice(0, 30)}...". Based on my neural processing capabilities using ${selectedModel.name}, I can provide you with comprehensive insights. The data suggests multiple pathways for exploration. Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date(),
        showButtons: false, // Initially HIDE buttons
      }
      
      // Add message first (without buttons)
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
      
      // Then show buttons after 800ms delay (answer complete effect)
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, showButtons: true } : msg
        ))
      }, 800)
    }, 1500 + Math.random() * 1000)
  }

  // Handle copy message
  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // 👍 HANDLE LIKE - Simple and direct
  const handleLike = (messageId: string) => {
    console.log('👍 LIKE clicked for:', messageId)
    
    // Create new sets to trigger re-render
    const newLiked = new Set(likedMessages)
    const newDisliked = new Set(dislikedMessages)
    
    if (newLiked.has(messageId)) {
      // Already liked - unlike it
      newLiked.delete(messageId)
      console.log('❌ Unliked')
    } else {
      // Like it (and remove dislike if exists)
      newLiked.add(messageId)
      newDisliked.delete(messageId)
      console.log('✅ Liked!')
    }
    
    setLikedMessages(newLiked)
    setDislikedMessages(newDisliked)
  }

  // 👎 HANDLE DISLIKE - Simple and direct
  const handleDislike = (messageId: string) => {
    console.log('👎 DISLIKE clicked for:', messageId)
    
    // Create new sets to trigger re-render
    const newLiked = new Set(likedMessages)
    const newDisliked = new Set(dislikedMessages)
    
    if (newDisliked.has(messageId)) {
      // Already disliked - undislike it
      newDisliked.delete(messageId)
      console.log('❌ Undisliked')
    } else {
      // Dislike it (and remove like if exists)
      newDisliked.add(messageId)
      newLiked.delete(messageId)
      console.log('✅ Disliked!')
    }
    
    setLikedMessages(newLiked)
    setDislikedMessages(newDisliked)
  }

  // 🔄 HANDLE REGENERATE - Simple and direct
  const handleRegenerate = (messageId: string) => {
    console.log('🔄 REGENERATE clicked for:', messageId)
    
    // Prevent if already regenerating or typing
    if (isTyping || regeneratingId) {
      console.log('⚠️ Already busy, ignoring')
      return
    }
    
    // Find the AI message index
    const aiIndex = messages.findIndex(m => m.id === messageId)
    console.log('AI Message index:', aiIndex)
    
    if (aiIndex <= 0) {
      console.log('❌ Invalid message or first message')
      return
    }
    
    // Get user message before this AI response
    const userMessage = messages[aiIndex - 1]
    if (!userMessage || userMessage.role !== 'user') {
      console.log('❌ No user message found before')
      return
    }
    
    console.log('📝 Regenerating for:', userMessage.content.slice(0, 50))
    
    // Start regeneration
    setRegeneratingId(messageId)
    setIsTyping(true)
    
    // Remove old AI message
    setMessages(prev => prev.filter(m => m.id !== messageId))
    
    // Generate new response after delay
    setTimeout(() => {
      const newAiId = 'regen-' + Date.now()
      const newAiMessage: Message = {
        id: newAiId,
        role: 'assistant',
        content: `🔄 [REGENERATED with ${selectedModel.name}] I've re-analyzed your query about "${userMessage.content.slice(0, 30)}..." using ${selectedModel.name} (${selectedModel.provider}). Here's an alternative approach based on deeper processing. Does this better address your needs?`,
        timestamp: new Date(),
        showButtons: false, // Initially HIDE buttons
      }
      
      // Add message first (without buttons)
      setMessages(prev => [...prev, newAiMessage])
      setIsTyping(false)
      setRegeneratingId(null)
      
      // Then show buttons after 800ms delay (answer complete effect)
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newAiId ? { ...msg, showButtons: true } : msg
        ))
      }, 800)
      
      console.log('✅ Regeneration complete:', newAiId)
    }, 2000)
  }

  // ↗️ HANDLE SHARE
  const handleShare = async (content: string) => {
    console.log('↗️ SHARE clicked')
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEXUS AI Response',
          text: content,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      handleCopy(content, 'share-' + Date.now())
    }
  }

  // Handle clear chat
  const handleClear = () => {
    setMessages([])
    setLikedMessages(new Set())
    setDislikedMessages(new Set())
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle conversation selection from history
  const handleSelectConversation = useCallback((conversation: ChatConversation | null) => {
    setCurrentConversation(conversation)
    if (conversation && conversation.messages.length > 0) {
      setMessages(conversation.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        showButtons: msg.role === 'assistant', // Show buttons for AI messages
      })))
    }
    setShowHistory(false)
  }, [])

  return (
    <div className="flex h-[600px] md:h-[700px] rounded-2xl overflow-hidden transition-all duration-500 glass-strong border border-neon-cyan/20 shadow-[0_0_40px_rgba(0,255,255,0.15)]">
      
      {/* Feature C: Chat History Sidebar */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-80 z-20 transition-transform duration-300 ease-out",
          showHistory ? "translate-x-0" : "-translate-x-full",
          "glass-strong border-r border-neon-cyan/20"
        )}
      >
        <ChatHistory
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversation?.id}
          className="h-full"
        />
        
        {/* Close button */}
        <button
          onClick={() => setShowHistory(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors z-30"
          aria-label="Close history"
        >
          ✕
        </button>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-500",
        isExpanded ? "fixed inset-4 md:inset-8 z-50 rounded-2xl" : "",
        "min-w-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neon-cyan/20 bg-black/80">
          <div className="flex items-center gap-3">
            {/* History toggle button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "text-muted-foreground hover:text-neon-cyan",
                showHistory && "text-neon-cyan bg-neon-cyan/10"
              )}
              aria-label={t('chat.history')}
            >
              <History className="w-4 h-4" />
            </Button>
            
            {/* Status indicator */}
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.6)]" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-neon-cyan animate-ping opacity-30" />
            </div>
            
            <div>
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-cyan" />
                {t('chat.title')}
              </h3>
              <p className="text-xs text-muted-foreground">{t('chat.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-red-400"
              aria-label={t('chat.clear')}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-neon-cyan"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "chat-message-enter flex gap-4",
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                  message.role === 'user'
                    ? "bg-gradient-to-br from-neon-cyan to-electric-blue text-black"
                    : "bg-gradient-to-br from-gray-800 to-gray-900 text-white",
                  "shadow-lg"
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={cn(
                  "max-w-[80%] md:max-w-[70%] px-5 py-3.5",
                  message.role === 'user' 
                    ? "message-user" 
                    : "message-ai"
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* ✅ ACTION BUTTONS - Show only for AI messages with showButtons=true */}
                {message.role === 'assistant' && message.showButtons && (
                  <div 
                    className="flex items-center gap-1 mt-3 pt-3 border-t border-white/10 animate-fadeIn"
                  >
                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground mr-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {/* 📋 COPY BUTTON - ORANGE THEME */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleCopy(message.content, message.id)
                      }}
                      className="p-2 rounded-lg hover:bg-neon-cyan/20 active:scale-95 transition-all cursor-pointer"
                      title="Copy to clipboard"
                      type="button"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-4 h-4 text-neon-cyan" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-neon-cyan" />
                      )}
                    </button>
                    
                    {/* 👍 LIKE BUTTON - ORANGE THEME */}
                    <button
                      onClick={() => {
                        handleLike(message.id)
                      }}
                      className={`p-2 rounded-lg active:scale-95 transition-all cursor-pointer ${
                        likedMessages.has(message.id)
                          ? 'bg-neon-cyan/25'
                          : 'hover:bg-neon-cyan/15'
                      }`}
                      title="Good response"
                      type="button"
                    >
                      <ThumbsUp 
                        className={`w-4 h-4 transition-colors ${
                          likedMessages.has(message.id) 
                            ? 'text-neon-cyan fill-neon-cyan' 
                            : 'text-gray-400 hover:text-neon-cyan'
                        }`} 
                      />
                    </button>
                    
                    {/* 👎 DISLIKE BUTTON - AMBER THEME */}
                    <button
                      onClick={() => {
                        handleDislike(message.id)
                      }}
                      className={`p-2 rounded-lg active:scale-95 transition-all cursor-pointer ${
                        dislikedMessages.has(message.id)
                          ? 'bg-red-500/25'
                          : 'hover:bg-red-500/15'
                      }`}
                      title="Bad response"
                      type="button"
                    >
                      <ThumbsDown 
                        className={`w-4 h-4 transition-colors ${
                          dislikedMessages.has(message.id) 
                            ? 'text-red-400 fill-red-400' 
                            : 'text-gray-400 hover:text-red-400'
                        }`} 
                      />
                    </button>
                    
                    {/* 🔄 REGENERATE BUTTON - AMBER THEME */}
                    <button
                      onClick={() => {
                        if (!isTyping && !regeneratingId) {
                          handleRegenerate(message.id)
                        }
                      }}
                      disabled={regeneratingId === message.id || isTyping}
                      className={`p-2 rounded-lg active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        regeneratingId === message.id
                          ? 'bg-neon-purple/20 animate-spin'
                          : 'hover:bg-neon-purple/15'
                      }`}
                      title="Regenerate response"
                      type="button"
                    >
                      <RefreshCw 
                        className={`w-4 h-4 ${
                          regeneratingId === message.id 
                            ? 'text-neon-purple' 
                            : 'text-gray-400 hover:text-neon-purple'
                        }`} 
                      />
                    </button>
                    
                    {/* ↗️ SHARE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleShare(message.content)
                      }}
                      className="p-2 rounded-lg hover:bg-blue-500/15 active:scale-95 transition-all cursor-pointer"
                      title="Share response"
                      type="button"
                    >
                      <Share2 className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                    </button>
                  </div>
                )}
                
                {/* User message: Show only timestamp and copy */}
                {message.role === 'user' && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5 justify-end">
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="p-1 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-neon-cyan cursor-pointer"
                      aria-label={t('chat.copy') || 'Copy'}
                      type="button"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-4 chat-message-enter">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center shadow-lg border border-neon-purple/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="message-ai px-5 py-4">
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

        {/* Input area with Voice Input - Feature D */}
        <div className="px-6 py-4 border-t border-white/10 bg-dark-surface/50">
          {/* AI Model Selector - Above Input Box */}
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                  "bg-white/5 border border-white/10 hover:border-neon-cyan/40",
                  "transition-all duration-200 group"
                )}
                aria-label="Select AI Model"
              >
                <selectedModel.icon className={cn("w-4 h-4", selectedModel.color)} />
                <span className="text-foreground/80 group-hover:text-foreground">{selectedModel.name}</span>
                <ChevronDown className={cn(
                  "w-3 h-3 text-muted-foreground transition-transform duration-200",
                  showModelSelector && "rotate-180"
                )} />
              </button>

              {/* Model Selector Dropdown - Opens Upward from input area */}
              {showModelSelector && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowModelSelector(false)} 
                  />
                  
                  {/* Dropdown - Positioned above button */}
                  <div className={cn(
                    "absolute bottom-full left-0 mb-2 w-72 z-50",
                    "bg-gray-900/95 backdrop-blur-xl border border-neon-cyan/20",
                    "rounded-xl shadow-2xl shadow-black/50 overflow-hidden",
                    "animate-fadeIn"
                  )}>
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border-b border-white/5">
                      <p className="text-xs font-semibold text-neon-cyan uppercase tracking-wider">Select AI Model</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Choose the best model for your task</p>
                    </div>

                    {/* Models List */}
                    <div className="p-2 max-h-64 overflow-y-auto scrollbar-thin">
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model)
                            setShowModelSelector(false)
                          }}
                          className={cn(
                            "w-full flex items-start gap-3 p-3 rounded-lg text-left",
                            "hover:bg-white/5 transition-all duration-150 group/model",
                            selectedModel.id === model.id && "bg-neon-cyan/10 border border-neon-cyan/30"
                          )}
                        >
                          <div className={cn(
                            "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                            "bg-gradient-to-br",
                            model.speed === 'fast' && "from-blue-500/20 to-cyan-500/20",
                            model.speed === 'balanced' && "from-purple-500/20 to-pink-500/20",
                            model.speed === 'powerful' && "from-green-500/20 to-emerald-500/20"
                          )}>
                            <model.icon className={cn("w-5 h-5", model.color)} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground text-sm">{model.name}</span>
                              {model.isPopular && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-neon-cyan/20 text-neon-cyan rounded">POPULAR</span>
                              )}
                              {model.isNew && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded">NEW</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{model.provider}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{model.description}</p>
                            
                            {/* Speed indicator */}
                            <div className="flex items-center gap-1 mt-2">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                model.speed === 'fast' && "bg-blue-400",
                                model.speed === 'balanced' && "bg-yellow-400",
                                model.speed === 'powerful' && "bg-red-400"
                              )} />
                              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                                {model.speed}
                              </span>
                            </div>
                          </div>

                          {/* Selected checkmark */}
                          {selectedModel.id === model.id && (
                            <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-1" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-black/30 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 text-center">
                        ⚡ Current: <span className="text-neon-cyan font-medium">{selectedModel.name}</span> by {selectedModel.provider}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick info badges */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className={cn("w-2 h-2 rounded-full", 
                  selectedModel.speed === 'fast' && "bg-blue-400",
                  selectedModel.speed === 'balanced' && "bg-yellow-400",
                  selectedModel.speed === 'powerful' && "bg-red-400"
                )} />
                {selectedModel.speed}
              </span>
              <span>•</span>
              <span>{t('chat.pressEnter')} to send</span>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                className="min-h-[52px] max-h-[150px] pr-24 resize-none"
              />
              
              {/* Right side buttons inside textarea area */}
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                {/* Character count */}
                {input.length > 0 && (
                  <span className="text-xs text-muted-foreground mr-1">
                    {input.length}
                  </span>
                )}
                
                {/* Feature D: Voice Input Button */}
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  disabled={isTyping}
                  className="w-8 h-8"
                />
              </div>
            </div>

            <Button
              variant="neon"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 h-[52px] w-[52px]"
              aria-label={t('chat.send')}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {/* Input hints */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Badge variant="cyberpunk">Secure</Badge>
              <Badge variant="cyberpunk">Encrypted</Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {t('chat.pressEnter')} · {t('chat.shiftEnter')} for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
