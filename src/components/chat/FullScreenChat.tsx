'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bot, Check, Copy, Mic, Paperclip, RotateCcw, Send,
  Sparkles, StopCircle, ThumbsDown, ThumbsUp, User
} from 'lucide-react'

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

const SUGGESTIONS = [
  { title: 'Explain a concept', prompt: 'Explain how large language models work in simple terms.' },
  { title: 'Help me write', prompt: 'Help me write a professional email to follow up after an interview.' },
  { title: 'Code assistance', prompt: 'Write a Python function that parses a CSV and returns a summary.' },
  { title: 'Plan a project', prompt: 'Help me plan a 2-week launch for a new AI chatbot product.' },
]

export default function FullScreenChat({
  isLoggedIn = false,
  canChat = true,
  onLoginClick,
}: FullScreenChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (canChat) inputRef.current?.focus()
  }, [canChat])

  const resizeInput = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const handleSend = async (preset?: string) => {
    const trimmed = (preset ?? inputValue).trim()
    if (!trimmed || !canChat || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      let reply =
        "I'm NEXUS AI — your assistant for writing, coding, research, and planning. How else can I help?"

      if (res.ok) {
        const data = await res.json().catch(() => null)
        reply =
          data?.response ||
          data?.content ||
          data?.message ||
          data?.reply ||
          data?.text ||
          reply
      } else {
        reply = `Got it: "${trimmed}"\n\nI couldn't reach the AI service just now. Please try again in a moment.`
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Thanks — I received: "${trimmed}"\n\nThe chat API isn't connected in this preview, but the interface is ready. Ask me to write, explain, or plan something next.`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
    } catch {
      /* ignore */
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 py-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400 to-violet-500 opacity-40 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-glow-cyan">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-center font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome to <span className="gradient-text-nexus">NEXUS AI</span>
            </h1>
            <p className="mt-3 max-w-xl text-center text-sm text-slate-400 sm:text-base">
              Your advanced AI assistant. Ask anything — writing, code, research, or ideas.
            </p>
            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSend(item.prompt)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                copied={copiedId === message.id}
                onCopy={() => handleCopy(message.content, message.id)}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-white/8 bg-[#07071a]/80 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          {!isLoggedIn && (
            <p className="mb-2 text-center text-xs text-slate-500">
              <button onClick={onLoginClick} className="text-cyan-400 hover:underline">
                Sign in
              </button>{' '}
              to save chat history
            </p>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#0f1224] p-2 shadow-glass focus-within:border-cyan-400/40 focus-within:shadow-[0_0_0_3px_rgba(0,229,255,0.12)]">
            <button className="mb-0.5 rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Attach file">
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                resizeInput()
              }}
              onKeyDown={handleKeyDown}
              placeholder={canChat ? 'Ask NEXUS AI anything…' : 'Sign in to continue chatting'}
              disabled={!canChat}
              rows={1}
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button className="mb-0.5 rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Voice input">
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || !canChat || isTyping}
              className="mb-0.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 p-2.5 text-slate-950 shadow-glow-cyan transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              {isTyping ? <StopCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            NEXUS AI can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  copied,
  onCopy,
}: {
  message: ChatMessage
  copied: boolean
  onCopy: () => void
}) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`flex max-w-[88%] items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isUser
              ? 'bg-gradient-to-br from-cyan-400 to-violet-500'
              : 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
          }`}
        >
          {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
        </div>
        <div className={`group relative ${isUser ? 'message-user' : 'message-ai'}`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{message.content}</div>
          <div className={`absolute -bottom-8 flex gap-1 opacity-0 transition group-hover:opacity-100 ${isUser ? 'right-0' : 'left-0'}`}>
            <button onClick={onCopy} className="rounded-md p-1.5 hover:bg-white/10" aria-label="Copy">
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
            </button>
            <button className="rounded-md p-1.5 hover:bg-white/10" aria-label="Like">
              <ThumbsUp className="h-4 w-4 text-slate-400" />
            </button>
            <button className="rounded-md p-1.5 hover:bg-white/10" aria-label="Dislike">
              <ThumbsDown className="h-4 w-4 text-slate-400" />
            </button>
            <button className="rounded-md p-1.5 hover:bg-white/10" aria-label="Regenerate">
              <RotateCcw className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="rounded-2xl rounded-bl-md border border-violet-500/20 bg-[#12122a] px-5 py-3.5">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce-dot" />
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce-dot" />
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce-dot" />
          </div>
        </div>
      </div>
    </div>
  )
}
