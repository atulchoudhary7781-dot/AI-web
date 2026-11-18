'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Bot, Check, ChevronDown, Copy, FileText, Mic, Paperclip, RotateCcw, Send,
  Sparkles, StopCircle, ThumbsDown, ThumbsUp, User, X
} from 'lucide-react'
import { isImageFile, isTextLikeFile } from '@/lib/fileTypes'
import { DEFAULT_MODEL_ID, WORKING_MODELS } from '@/lib/models'
import { getSessionUser } from '@/lib/session'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  image?: string
  fileName?: string
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
  onGuestMessageSent?: () => void
  userName?: string | null
  userEmail?: string | null
}

interface AttachedFile {
  file: File
  preview?: string
  base64?: string
  mime?: string
  fileText?: string
  fileData?: string
}

async function compressImage(file: File): Promise<{ preview: string; base64: string; mime: string }> {
  const bitmap = await createImageBitmap(file)
  const max = 1280
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas unavailable')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
  const base64 = dataUrl.split(',')[1] || ''
  if (!base64) throw new Error('Could not encode image')
  return { preview: dataUrl, base64, mime: 'image/jpeg' }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
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
  onLoginRequired,
  onGuestMessageSent,
  userEmail,
}: FullScreenChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [attached, setAttached] = useState<AttachedFile | null>(null)
  const [listening, setListening] = useState(false)
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)
  const [showModels, setShowModels] = useState(false)
  const [statusNote, setStatusNote] = useState('')
  const [dailyLimit, setDailyLimit] = useState(false)

  useEffect(() => {
    setDailyLimit(false)
  }, [userEmail, isLoggedIn])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const baseInputRef = useRef('')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop() } catch { /* ignore */ }
    }
  }, [])

  const resizeInput = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const showNote = (text: string) => {
    setStatusNote(text)
    setTimeout(() => setStatusNote(''), 3500)
  }

  const handleAttachClick = () => {
    if (!canChat) {
      onLoginRequired?.()
      onLoginClick?.()
      return
    }
    if (dailyLimit && isLoggedIn) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > 3.5 * 1024 * 1024) {
      showNote('File must be under 3.5MB')
      return
    }

    if (isImageFile(file.name, file.type)) {
      try {
        const compressed = await compressImage(file)
        setAttached({ file, ...compressed })
        showNote('Image attached — send to analyze')
      } catch {
        try {
          const dataUrl = await readFileAsDataUrl(file)
          const base64 = dataUrl.split(',')[1] || ''
          setAttached({ file, preview: dataUrl, base64, mime: file.type || 'image/jpeg' })
        } catch {
          showNote('Could not read that image')
        }
      }
      return
    }

    try {
      if (isTextLikeFile(file.name, file.type)) {
        const text = await file.text()
        if (!text.trim()) {
          showNote('File is empty')
          return
        }
        setAttached({ file, fileText: text.slice(0, 20000), mime: file.type || 'text/plain' })
        showNote('File attached — send to analyze')
        return
      }

      const dataUrl = await readFileAsDataUrl(file)
      const fileData = dataUrl.split(',')[1] || ''
      if (!fileData) {
        showNote('Could not read that file')
        return
      }
      if (fileData.length > 6_000_000) {
        showNote('File is too large to analyze (max ~4MB)')
        return
      }
      setAttached({ file, fileData, mime: file.type || 'application/octet-stream' })
      showNote('File attached — send to analyze')
    } catch {
      showNote('Could not read that file')
    }
  }

  const toggleVoice = () => {
    if (!canChat) {
      onLoginRequired?.()
      onLoginClick?.()
      return
    }
    if (dailyLimit && isLoggedIn) return

    if (listening) {
      try { recognitionRef.current?.stop() } catch { /* ignore */ }
      setListening(false)
      return
    }

    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechAPI) {
      showNote('Voice input needs Chrome, Edge or Safari')
      return
    }

    try {
      const rec = new SpeechAPI()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = navigator.language || 'en-IN'
      baseInputRef.current = inputValue

      rec.onresult = (event: any) => {
        let text = ''
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript
        }
        const prefix = baseInputRef.current.trim() ? `${baseInputRef.current.trim()} ` : ''
        const next = prefix + text.trim()
        setInputValue(next)
        requestAnimationFrame(resizeInput)
      }

      rec.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          showNote('Microphone permission denied. Allow mic in the browser.')
        } else if (event.error === 'no-speech') {
          showNote('No speech heard. Try again.')
        } else if (event.error !== 'aborted') {
          showNote('Voice input failed. Try again.')
        }
        setListening(false)
      }

      rec.onend = () => setListening(false)

      recognitionRef.current = rec
      rec.start()
      setListening(true)
      setStatusNote('Listening… tap mic to stop')
    } catch {
      showNote('Could not start microphone')
    }
  }

  const handleSend = async (preset?: string) => {
    const trimmed = (preset ?? inputValue).trim()
    if (isTyping) return
    if (!canChat) {
      onLoginRequired?.()
      return
    }
    if (dailyLimit && isLoggedIn) return
    if (!trimmed && !attached) return

    if (listening) {
      try { recognitionRef.current?.stop() } catch { /* ignore */ }
      setListening(false)
    }

    const content = trimmed || `Please analyze this file: ${attached?.file.name}`
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      image: attached?.preview,
      fileName: attached && !attached.preview ? attached.file.name : undefined,
    }

    const history = messages.slice(-12).map((item) => ({
      role: item.role,
      content: item.content.slice(0, 4000),
    }))
    const payload: Record<string, unknown> = { message: content, model: modelId, history }
    const email = (userEmail || (isLoggedIn ? getSessionUser()?.email : '') || '').trim()
    if (email) payload.userEmail = email
    if (attached?.base64) {
      payload.imageData = attached.base64
      payload.imageMimeType = attached.mime || attached.file.type || 'image/jpeg'
    } else if (attached?.fileText) {
      payload.fileName = attached.file.name
      payload.fileType = attached.mime || attached.file.type || 'text/plain'
      payload.fileText = attached.fileText
    } else if (attached?.fileData) {
      payload.fileName = attached.file.name
      payload.fileType = attached.mime || attached.file.type || 'application/octet-stream'
      payload.fileData = attached.fileData
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setAttached(null)
    setStatusNote('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      })

      let reply = 'The AI is busy right now. Please send again in a few seconds.'
      const data = await res.json().catch(() => null)
      if (data?.dailyLimit && isLoggedIn) {
        setDailyLimit(true)
      }
      reply =
        (typeof data?.response === 'string' && data.response.trim()) ||
        (typeof data?.content === 'string' && data.content.trim()) ||
        (typeof data?.message === 'string' && data.message.trim()) ||
        reply

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'The AI is busy right now. Please send again in a few seconds.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
      if (!isLoggedIn) onGuestMessageSent?.()
    }
  }

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
    } catch { /* ignore */ }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0
  const limitLocked = dailyLimit && isLoggedIn
  const canSend = canChat && !limitLocked && !isTyping && (!!inputValue.trim() || !!attached)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
            <div className="relative mb-5 sm:mb-6">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400 to-violet-500 opacity-40 blur-2xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-glow-cyan sm:h-16 sm:w-16">
                <Sparkles className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
            </div>
            <h1 className="px-2 text-center font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome to <span className="gradient-text-nexus">NEXUS AI</span>
            </h1>
            <p className="mt-3 max-w-xl px-2 text-center text-sm text-slate-400 sm:text-base">
              Your advanced AI assistant. Ask anything — writing, code, research, or ideas.
            </p>
            <div className="mt-6 grid w-full grid-cols-1 gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSend(item.prompt)}
                  disabled={!canChat || limitLocked}
                  className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 sm:p-4"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-7 px-3 py-5 sm:space-y-8 sm:px-4 sm:py-8">
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

      <div className="nexus-composer border-t border-white/10 bg-[#07071a]/80 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4">
        <div className="mx-auto max-w-3xl">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          {!isLoggedIn && (
            <p className="mb-2 text-center text-xs text-slate-500">
              <button onClick={onLoginClick} className="text-cyan-400 hover:underline">
                Sign in
              </button>{' '}
              to save chat history
            </p>
          )}

          {limitLocked && (
            <div className="mb-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 text-center">
              <p className="text-sm font-medium text-amber-200">Today's NEXUS AI limit is full.</p>
              <p className="mt-0.5 text-xs text-amber-200/80">It will take 1 day to reset. Please come back tomorrow to chat.</p>
            </div>
          )}

          {statusNote && (
            <p className={`mb-2 text-center text-xs ${listening ? 'text-cyan-400' : 'text-amber-400'}`}>
              {statusNote}
            </p>
          )}

          {attached && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              {attached.preview ? (
                <img src={attached.preview} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <FileText className="h-5 w-5 text-cyan-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{attached.file.name}</p>
                <p className="text-[11px] text-slate-500">{Math.max(1, Math.round(attached.file.size / 1024))} KB</p>
              </div>
              <button
                onClick={() => setAttached(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="relative flex items-end gap-1.5 rounded-2xl border border-white/10 bg-[#0f1224] p-1.5 shadow-glass focus-within:border-cyan-400/40 focus-within:shadow-[0_0_0_3px_rgba(0,229,255,0.12)] sm:gap-2 sm:p-2">
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={!canChat || limitLocked || isTyping}
              className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-40"
              aria-label="Attach any file"
              title="Attach any file — PDF, Word, Excel, code, images, and more"
            >
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
              placeholder={
                !canChat
                  ? 'Sign in to continue chatting'
                  : limitLocked
                    ? "Today's limit is full — come back tomorrow"
                    : 'Ask NEXUS AI anything…'
              }
              disabled={!canChat || limitLocked}
              rows={1}
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-1 py-2.5 text-base text-white outline-none placeholder:text-slate-500 sm:text-sm"
            />
            <div className="relative mb-0.5">
              <button
                type="button"
                onClick={() => setShowModels((open) => !open)}
                className="inline-flex h-11 max-w-[132px] items-center gap-1 rounded-xl px-2 text-cyan-300 hover:bg-white/5 sm:max-w-[160px] sm:px-2.5"
                aria-label="Choose model"
                title={WORKING_MODELS.find((m) => m.id === modelId)?.name || 'Choose model'}
              >
                <Sparkles className="h-5 w-5 shrink-0" />
                <span className="hidden truncate text-[11px] font-medium sm:inline">
                  {WORKING_MODELS.find((m) => m.id === modelId)?.name || 'Model'}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition ${showModels ? 'rotate-180' : ''}`} />
              </button>
              {showModels && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close models"
                    onClick={() => setShowModels(false)}
                  />
                  <div className="absolute bottom-12 right-0 z-50 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0b1020] py-1 shadow-2xl">
                    {WORKING_MODELS.map((model) => {
                      const active = modelId === model.id
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setModelId(model.id)
                            setShowModels(false)
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs ${
                            active ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span>
                            <span className="block font-medium">{model.name}</span>
                            <span className="block text-[10px] text-slate-500">{model.provider}</span>
                          </span>
                          {active && <Check className="h-4 w-4 text-cyan-400" />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={toggleVoice}
              disabled={!canChat || limitLocked || isTyping}
              className={`mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl disabled:opacity-40 ${
                listening
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              aria-label={listening ? 'Stop listening' : 'Speak to type'}
              title={listening ? 'Stop listening' : 'Speak to type'}
            >
              {listening ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!canSend}
              className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 shadow-glow-cyan transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              {isTyping ? <StopCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400 sm:text-xs">
            Nexus is AI and can make mistakes.
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageActions({
  copied,
  onCopy,
  align = 'start',
}: {
  copied: boolean
  onCopy: () => void
  align?: 'start' | 'end'
}) {
  return (
    <div className={`mt-3 flex items-center gap-1 ${align === 'end' ? 'justify-end' : 'justify-start'}`}>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-100"
        aria-label={copied ? 'Copied' : 'Copy answer'}
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      {align === 'start' && (
        <>
          <button type="button" className="rounded-md p-2.5 hover:bg-white/10" aria-label="Like">
            <ThumbsUp className="h-4 w-4 text-slate-400" />
          </button>
          <button type="button" className="rounded-md p-2.5 hover:bg-white/10" aria-label="Dislike">
            <ThumbsDown className="h-4 w-4 text-slate-400" />
          </button>
        </>
      )}
    </div>
  )
}

function MarkdownAnswer({ content }: { content: string }) {
  return (
    <div className="answer-prose">
      <ReactMarkdown
        components={{
          pre({ children }) {
            return <CopyableCode>{children}</CopyableCode>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function CopyableCode({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false)

  const textOf = (node: ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (!node || typeof node !== 'object') return ''
    if (Array.isArray(node)) return node.map(textOf).join('')
    const el = node as { props?: { children?: ReactNode } }
    return textOf(el.props?.children)
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(textOf(children).replace(/\n$/, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* ignore */ }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-2 top-2 z-10 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-[#0b1020]/90 px-2.5 text-[11px] font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-cyan-100"
        aria-label={copied ? 'Copied' : 'Copy code'}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>{children}</pre>
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

  if (!isUser) {
    return (
      <article className="mx-auto w-full max-w-3xl animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <MarkdownAnswer content={message.content} />
            <MessageActions copied={copied} onCopy={onCopy} />
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="flex justify-end animate-slide-up">
      <div className="flex max-w-[85%] items-start gap-2 sm:max-w-[70%]">
        <div className="message-user">
          {message.image && (
            <img src={message.image} alt="attachment" className="mb-2 max-h-56 w-auto rounded-xl object-contain" />
          )}
          {message.fileName && (
            <p className="mb-1 flex items-center gap-1.5 text-xs text-cyan-300">
              <FileText className="h-3.5 w-3.5" />
              {message.fileName}
            </p>
          )}
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{message.content}</div>
          <MessageActions copied={copied} onCopy={onCopy} align="end" />
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500">
          <User className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-start gap-3 animate-fade-in">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <p className="pt-1.5 text-sm font-medium tracking-wide text-violet-300 animate-pulse">
        Thinking
      </p>
    </div>
  )
}
