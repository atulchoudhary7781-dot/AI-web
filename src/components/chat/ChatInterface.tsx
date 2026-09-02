'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Send, Bot, User, Copy, Check, RefreshCw, 
  Sparkles, Trash2, Maximize2, Minimize2,
  History, Plus
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
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your query about "${input.slice(0, 30)}...". Based on my neural processing capabilities, I can provide you with comprehensive insights. The data suggests multiple pathways for exploration. Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  // Handle copy message
  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
                
                {/* Message actions */}
                <div
                  className={cn(
                    "flex items-center gap-2 mt-3 pt-2 border-t border-white/5",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="p-1 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-neon-cyan"
                    aria-label={t('chat.copy')}
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {message.role === 'assistant' && (
                    <button className="p-1 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-neon-purple">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
