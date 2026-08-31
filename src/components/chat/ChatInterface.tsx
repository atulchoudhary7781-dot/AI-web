'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, Bot, User, Copy, Check, RefreshCw, 
  Sparkles, Trash2, Maximize2, Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

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
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl overflow-hidden transition-all duration-500",
        "glass-strong border border-white/10",
        isExpanded ? "fixed inset-4 md:inset-8 z-50" : "h-[600px]",
        "shadow-[0_0_40px_rgba(0,255,255,0.1)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-dark-surface/50">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.6)]" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-neon-cyan animate-ping opacity-30" />
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              NEXUS AI Chat
            </h3>
            <p className="text-xs text-muted-foreground">Neural Interface v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-red-400"
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

      {/* Input area */}
      <div className="px-6 py-4 border-t border-white/10 bg-dark-surface/50">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message to NEXUS AI..."
              className="min-h-[52px] max-h-[150px] pr-12 resize-none"
            />
            
            {/* Character count */}
            {input.length > 0 && (
              <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">
                {input.length}
              </span>
            )}
          </div>

          <Button
            variant="neon"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 h-[52px] w-[52px]"
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
            Press Enter to send · Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export default ChatInterface
