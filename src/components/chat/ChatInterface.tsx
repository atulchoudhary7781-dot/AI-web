'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Send, Bot, User, Copy, Check, RefreshCw, 
  Sparkles, Trash2, Maximize2, Minimize2,
  History, Plus, ThumbsUp, ThumbsDown, Share2
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
}

// Track reaction state for messages
interface MessageReactions {
  [messageId: string]: 'liked' | 'disliked' | null
}

// Sample messages for demo
const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Greetings, human. I am NEXUS AI, your advanced neural companion. I'm designed to assist with complex reasoning, creative tasks, and deep analysis. How may I serve you today?",
    timestamp: new Date(),
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
  
  // Post-response action states
  const [reactions, setReactions] = useState<MessageReactions>({})
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [completedMessageIds, setCompletedMessageIds] = useState<Set<string>>(new Set(['1'])) // Initial message is already complete
  
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
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    
    // Save to chat history if we have a conversation
    if (currentConversation) {
      // This would be handled by a proper state management system
      // For now, just update local messages
    }
    
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const newAiMessageId = (Date.now() + 1).toString()
      const aiMessage: Message = {
        id: newAiMessageId,
        role: 'assistant',
        content: `I've analyzed your query about "${input.slice(0, 30)}...". Based on my neural processing capabilities, I can provide you with comprehensive insights. The data suggests multiple pathways for exploration. Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
      // Mark this message as completed so buttons appear
      setTimeout(() => {
        setCompletedMessageIds(prev => new Set([...prev, newAiMessageId]))
      }, 100) // Small delay for animation
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

  // Handle like/dislike reactions
  const handleReaction = (messageId: string, reaction: 'liked' | 'disliked') => {
    setReactions(prev => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction // Toggle off if same reaction
    }))
  }

  // Handle regenerate response
  const handleRegenerate = async (messageId: string) => {
    // Find the user message before this AI message
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex <= 0) return
    
    const userMessage = messages[messageIndex - 1]
    if (!userMessage || userMessage.role !== 'user') return
    
    setRegeneratingId(messageId)
    setIsTyping(true)
    
    // Remove the old AI response temporarily
    setMessages(prev => prev.filter(m => m.id !== messageId))
    
    // Simulate new AI response (in production, this would call the API again)
    setTimeout(() => {
      const regeneratedMessageId = Date.now().toString()
      const newAiMessage: Message = {
        id: regeneratedMessageId,
        role: 'assistant',
        content: `🔄 [Regenerated] I've re-analyzed your query about "${userMessage.content.slice(0, 30)}..." with fresh perspective. Here's an alternative approach or refined answer based on deeper processing. The neural pathways have been recalibrated for optimal output. Does this response better address your needs?`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, newAiMessage])
      setIsTyping(false)
      setRegeneratingId(null)
      // Mark as completed so buttons appear
      setTimeout(() => {
        setCompletedMessageIds(prev => new Set([...prev, regeneratedMessageId]))
      }, 100)
    }, 1500 + Math.random() * 1000)
  }

  // Handle share response
  const handleShare = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEXUS AI Response',
          text: content,
          url: window.location.href
        })
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy(content, 'share-' + Date.now())
    }
  }

  // Handle clear chat
  const handleClear = () => {
    setMessages([])
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
        timestamp: new Date(msg.timestamp)
      })))
    }
    setShowHistory(false)
  }, [])

  return (
    <div className="flex h-[600px] md:h-[700px] rounded-2xl overflow-hidden transition-all duration-500 glass-strong border border-white/10 shadow-[0_0_40px_rgba(0,255,255,0.1)]">
      
      {/* Feature C: Chat History Sidebar */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-80 z-20 transition-transform duration-300 ease-out",
          showHistory ? "translate-x-0" : "-translate-x-full",
          "glass-strong border-r border-white/10"
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-dark-surface/50">
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
                    ? "bg-gradient-to-br from-neon-cyan to-electric-blue text-deep-black"
                    : "bg-gradient-to-br from-neon-purple to-purple-500 text-white",
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
                
                {/* ✅ POST-RESPONSE ACTION BUTTONS - ONLY SHOW AFTER AI COMPLETES ANSWER */}
                {message.role === 'assistant' && completedMessageIds.has(message.id) && (
                  <div 
                    className="flex items-center gap-1 mt-3 pt-3 border-t border-white/10 animate-fadeIn"
                    style={{ animationDuration: '0.3s' }}
                  >
                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground mr-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {/* 📋 Copy Button - Copies text to clipboard */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(message.content, message.id)
                      }}
                      className="p-2 rounded-lg hover:bg-neon-cyan/20 transition-all duration-200 group tooltip-container"
                      title="Copy to clipboard"
                      aria-label="Copy response"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-4 h-4 text-green-400 animate-bounce" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 group-hover:text-neon-cyan transition-colors" />
                      )}
                    </button>
                    
                    {/* 👍 Like Button - Marks response as good */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReaction(message.id, 'liked')
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        reactions[message.id] === 'liked'
                          ? 'bg-green-500/25 text-green-400 scale-110'
                          : 'hover:bg-green-500/15 text-gray-400 hover:text-green-400'
                      }`}
                      title="Good response"
                      aria-label="Like this response"
                    >
                      <ThumbsUp className={`w-4 h-4 transition-transform ${reactions[message.id] === 'liked' ? 'fill-current scale-110' : ''}`} />
                    </button>
                    
                    {/* 👎 Dislike Button - Marks response as bad */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReaction(message.id, 'disliked')
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        reactions[message.id] === 'disliked'
                          ? 'bg-red-500/25 text-red-400 scale-110'
                          : 'hover:bg-red-500/15 text-gray-400 hover:text-red-400'
                      }`}
                      title="Bad response"
                      aria-label="Dislike this response"
                    >
                      <ThumbsDown className={`w-4 h-4 transition-transform ${reactions[message.id] === 'disliked' ? 'fill-current scale-110' : ''}`} />
                    </button>
                    
                    {/* 🔄 Regenerate Button - Gets new AI response */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isTyping && regeneratingId !== message.id) {
                          handleRegenerate(message.id)
                        }
                      }}
                      disabled={regeneratingId === message.id || isTyping}
                      className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        regeneratingId === message.id
                          ? 'animate-spin bg-neon-purple/20 text-neon-purple'
                          : 'hover:bg-purple-500/15 text-gray-400 hover:text-purple-400'
                      }`}
                      title="Regenerate response"
                      aria-label="Regenerate this response"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    
                    {/* ↗️ Share Button - Share via Web Share API */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(message.content)
                      }}
                      className="p-2 rounded-lg hover:bg-blue-500/15 transition-all duration-200 group"
                      title="Share response"
                      aria-label="Share this response"
                    >
                      <Share2 className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
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
                      className="p-1 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-neon-cyan"
                      aria-label={t('chat.copy') || 'Copy'}
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
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-purple-500 text-white flex items-center justify-center shadow-lg">
                <Bot className="w-4 h-4" />
              </div>
              <div className="message-ai px-5 py-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neon-purple animate-typing" />
                  <span className="w-2 h-2 rounded-full bg-neon-purple animate-typing" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-neon-purple animate-typing" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area with Voice Input - Feature D */}
        <div className="px-6 py-4 border-t border-white/10 bg-dark-surface/50">
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
              <Badge variant="cyberpunk">GPT-4</Badge>
              <Badge variant="cyberpunk">Secure</Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {t('chat.pressEnter')} · {t('chat.shiftEnter')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
