'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, RefreshCw, Copy, Check, Sparkles, User, Bot, ThumbsUp, ThumbsDown, RotateCcw, Square, Paperclip, X, Wrench, ChevronDown, Cpu, Zap, Brain, Star, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ToolsPanel from './ToolsPanel'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  image?: string // Base64 image data
  imageMimeType?: string
  // Document support (PDF, DOC, TXT, etc.)
  fileName?: string
  fileType?: string
  fileSize?: number
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

interface FullScreenChatProps {
  messages: ChatMessage[]
  inputValue: string
  setInputValue: (value: string) => void
  isLoading: boolean
  onSubmit: () => void
  onStop?: () => void
  copiedCode: boolean
  onCopy: (text: string) => void
  onFileAttach?: (file: File) => void
  onClearAttachment?: () => void // Callback to clear attachment after send
  isLoggedIn?: boolean // Authentication state
  onLoginRequired?: () => void // Callback when login is required
}

export default function FullScreenChat({
  messages,
  inputValue,
  setInputValue,
  isLoading,
  onSubmit,
  onStop,
  copiedCode,
  onCopy,
  onFileAttach,
  onClearAttachment,
  isLoggedIn = false,
  onLoginRequired
}: FullScreenChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  
  // Tools Panel State
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  
  // AI Model Selector State
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])
  const [showModelSelector, setShowModelSelector] = useState(false)

  // Sync with parent - clear file when parent sends
  useEffect(() => {
    if (!isLoading && attachedFile && onClearAttachment) {
      // File will be cleared by parent after submit
    }
  }, [isLoading])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      onSubmit()
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile(file)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
      
      if (onFileAttach) {
        onFileAttach(file)
      }
    }
  }

  // Handle file attachment click
  const handleAttachClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('📎 Attach button clicked!')
    console.log('  - isLoggedIn:', isLoggedIn)
    
    // Check if user is logged in
    if (!isLoggedIn) {
      console.log('  - User NOT logged in, triggering login modal...')
      // Trigger login modal if callback provided
      if (onLoginRequired) {
        console.log('  - Calling onLoginRequired...')
        onLoginRequired()
      } else {
        console.log('  - ERROR: onLoginRequired not provided!')
        alert('Login required but no handler!')
      }
      return
    }
    console.log('  - User logged in, opening file picker...')
    fileInputRef.current?.click()
  }

  // Remove attached file
  const handleRemoveFile = () => {
    setAttachedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle insert text from tools panel to chat input
  const handleInsertFromTools = (text: string) => {
    setInputValue(inputValue ? `${inputValue}\n${text}` : text)
    setIsToolsOpen(false)
    textareaRef.current?.focus()
  }

  // Track if we just sent a message (to clear attachment only after send)
  const wasSendingRef = useRef(false)

  // Update ref when isLoading changes
  useEffect(() => {
    if (isLoading) {
      wasSendingRef.current = true
    }
  }, [isLoading])

  // Clear file ONLY after successful send (when loading stops AND we were sending)
  useEffect(() => {
    if (!isLoading && wasSendingRef.current && attachedFile) {
      wasSendingRef.current = false
      // Clear after a small delay to ensure message was processed
      const timer = setTimeout(() => {
        handleRemoveFile()
      }, 500) // Longer delay to ensure send completed
      return () => clearTimeout(timer)
    }
  }, [isLoading, attachedFile])

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-hidden rounded-none">
      {/* Scrollbar Style - Hidden but functional */}
      <style>{`
        /* Hide scrollbar visually but keep functionality */
        .chat-scroll::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
        
        .chat-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Smooth scroll behavior */
        .chat-scroll {
          scroll-behavior: smooth;
        }
      `}</style>
      
      {/* Welcome Screen - Perfect Fit Layout (No Scroll) */}
      {messages.length <= 1 ? (
        <>
          {/* Centered Content Area */}
          <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
            <div className="text-center max-w-xl">
              {/* Logo - Compact */}
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-xl shadow-cyan-500/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              
              {/* Title - Compact */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  NEXUS AI
                </span>
              </h2>
              
              {/* Description - Compact */}
              <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Your advanced AI assistant powered by Llama 3.1. Ask me anything — I'm here to help!
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
      {/* Messages Area - Scroll only when content overflows (hidden scrollbar) */}
      <div className="flex-1 overflow-y-auto min-h-0 chat-scroll">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {/* Skip welcome message when showing chat */}
          {messages.slice(1).map((message) => {
            // DEBUG: Log each message to check document data
            console.log('📨 Rendering message:', {
              id: message.id,
              hasFileName: !!message.fileName,
              hasImage: !!message.image,
              content: message.content?.substring(0, 50),
              shouldShowDoc: (message.fileName || (message.content && message.content.includes('📎'))) && !message.image
            })
            
            return (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''} animate-fadeIn`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`relative group ${message.role === 'user' ? 'order-1 max-w-[85%] md:max-w-[75%]' : 'max-w-[85%] md:max-width-[80%]'}`}>
                {/* Message Bubble */}
                <div className={`rounded-2xl px-5 py-3.5 relative overflow-hidden ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-xl shadow-cyan-500/25'
                    : 'bg-gray-800/80 border border-gray-700/50 backdrop-blur-sm shadow-lg'
                }`}>
                  {/* Gradient overlay for user messages */}
                  {message.role === 'user' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  {/* Image Display - Show attached image in message */}
                  {message.image && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-white/20 shadow-lg cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={`data:${message.imageMimeType || 'image/png'};base64,${message.image}`}
                        alt="Attached image"
                        className="w-full max-w-[300px] rounded-lg"
                        onClick={() => {
                          // Open image in new tab for full view
                          const win = window.open('')
                          if (win) {
                            win.document.write(`<html><head><title>Image View</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;}img{max-width:100%;height:auto;}</style></head><body><img src="data:${message.imageMimeType};base64,${message.image}" /></body></html>`)
                            win.document.close()
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Document Display - Show attached document (PDF, DOC, etc.) */}
                  {(message.fileName || (message.content && message.content.includes('📎'))) && !message.image && (
                    <div className={`mb-3 p-4 rounded-xl border-2 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-400/40' 
                        : 'bg-gray-700/60 border-gray-500/40'
                    } shadow-lg`}>
                      <div className="flex items-center gap-4">
                        {/* File Icon based on type */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                          message.fileType?.includes('pdf') || message.fileName?.endsWith('.pdf') ? 'bg-red-500/30' :
                          message.fileType?.includes('word') || message.fileName?.endsWith('.docx') || message.fileName?.endsWith('.doc') ? 'bg-blue-500/30' :
                          message.fileType?.includes('sheet') || message.fileName?.endsWith('.xlsx') || message.fileName?.endsWith('.xls') ? 'bg-green-500/30' :
                          message.fileType?.includes('text') || message.fileName?.endsWith('.txt') ? 'bg-yellow-500/30' :
                          message.fileName?.endsWith('.json') ? 'bg-purple-500/30' :
                          message.fileName?.endsWith('.csv') ? 'bg-emerald-500/30' :
                          'bg-cyan-500/30'
                        }`}>
                          {message.fileType?.includes('pdf') || message.fileName?.endsWith('.pdf') ? (
                            <span className="text-red-400 font-bold text-sm">PDF</span>
                          ) : message.fileType?.includes('word') || message.fileName?.endsWith('.docx') || message.fileName?.endsWith('.doc') ? (
                            <span className="text-blue-400 font-bold text-sm">DOC</span>
                          ) : message.fileType?.includes('sheet') || message.fileName?.endsWith('.xlsx') || message.fileName?.endsWith('.xls') ? (
                            <span className="text-green-400 font-bold text-sm">XLS</span>
                          ) : message.fileType?.includes('text') || message.fileName?.endsWith('.txt') ? (
                            <span className="text-yellow-400 font-bold text-sm">TXT</span>
                          ) : message.fileName?.endsWith('.json') ? (
                            <span className="text-purple-400 font-bold text-sm">JSON</span>
                          ) : message.fileName?.endsWith('.csv') ? (
                            <span className="text-emerald-400 font-bold text-sm">CSV</span>
                          ) : (
                            <Paperclip className="w-7 h-7 text-cyan-400" />
                          )}
                        </div>
                        
                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold truncate text-white">
                            📎 {message.fileName || message.content.replace('📎 ', '')}
                          </p>
                          <p className="text-sm opacity-80 mt-1">
                            {message.fileType ? message.fileType.split('/')[1]?.toUpperCase() || 'Document' : 'Document'}
                            {message.fileSize && ` • ${(message.fileSize / 1024).toFixed(1)} KB`}
                          </p>
                          <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                            ✅ Document attached successfully
                          </p>
                        </div>

                        {/* Download/View indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <Paperclip className="w-4 h-4 text-cyan-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {renderMessageContent(message.content, onCopy, copiedCode)}
                  </div>
                </div>

                {/* Message Actions */}
                <div className={`flex items-center gap-2 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}>
                  <p className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {message.role === 'assistant' && (
                    <>
                      <button 
                        onClick={() => onCopy(message.content)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy response"
                      >
                        {copiedCode ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                        )}
                      </button>
                      <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors" title="Good response">
                        <ThumbsUp className="w-3.5 h-3.5 text-gray-400 hover:text-green-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors" title="Bad response">
                        <ThumbsDown className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors" title="Regenerate">
                        <RotateCcw className="w-3.5 h-3.5 text-gray-400 hover:text-cyan-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 order-2 shadow-lg">
                  <User className="w-5 h-5 text-gray-200" />
                </div>
              )}
            </div>
            )
          })}

          {/* Loading Indicator - Enhanced */}
          {isLoading && (
            <div className="flex gap-4 animate-fadeIn">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Bot className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div className="bg-gray-800/80 border border-gray-700/50 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-gradient-to-t from-violet-400 to-violet-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-gradient-to-t from-pink-400 to-pink-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-300 font-medium">NEXUS is thinking</span>
                    <span className="text-xs text-gray-500">Generating response...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
        </>
      )}

      {/* Input Area - Fixed at bottom - Shared for Welcome & Chat - Clean Compact Design */}
      <div className="flex-shrink-0 border-t border-gray-800/60 bg-gray-900/98 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          {/* Attached File Preview - Shows ABOVE input box when file is attached */}
          {attachedFile && !isLoading && (
            <div className="mb-2 p-2.5 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-3">
                {/* File Preview/Thumbnail */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-800/80 border border-gray-600/30 overflow-hidden flex items-center justify-center">
                  {filePreview ? (
                    <img src={filePreview} alt={attachedFile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`p-1.5 rounded-lg ${
                      attachedFile.type.includes('pdf') ? 'bg-red-500/20' :
                      attachedFile.type.includes('word') || attachedFile.name.endsWith('.docx') ? 'bg-blue-500/20' :
                      attachedFile.type.includes('sheet') || attachedFile.name.endsWith('.xlsx') ? 'bg-green-500/20' :
                      attachedFile.type.includes('text') || attachedFile.name.endsWith('.txt') ? 'bg-yellow-500/20' :
                      'bg-cyan-500/20'
                    }`}>
                      {attachedFile.type.includes('pdf') ? (
                        <span className="text-red-400 font-bold text-[10px]">PDF</span>
                      ) : attachedFile.type.includes('word') || attachedFile.name.endsWith('.docx') ? (
                        <span className="text-blue-400 font-bold text-[10px]">DOC</span>
                      ) : attachedFile.type.includes('sheet') || attachedFile.name.endsWith('.xlsx') ? (
                        <span className="text-green-400 font-bold text-[10px]">XLS</span>
                      ) : attachedFile.type.includes('text') || attachedFile.name.endsWith('.txt') ? (
                        <span className="text-yellow-400 font-bold text-[10px]">TXT</span>
                      ) : (
                        <Paperclip className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="text-sm font-medium text-white truncate">{attachedFile.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(attachedFile.size / 1024).toFixed(1)} KB • {attachedFile.type || 'Unknown'}</p>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* AI Model Selector - Above Input Box */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                  "bg-white/5 border border-white/10 hover:border-cyan-400/40",
                  "transition-all duration-200 group"
                )}
                aria-label="Select AI Model"
              >
                <selectedModel.icon className={cn("w-4 h-4", selectedModel.color)} />
                <span className="text-white/80 group-hover:text-white">{selectedModel.name}</span>
                <ChevronDown className={cn(
                  "w-3 h-3 text-gray-500 transition-transform duration-200",
                  showModelSelector && "rotate-180"
                )} />
              </button>

              {/* Model Selector Dropdown - Opens Upward */}
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
                    "bg-gray-900/95 backdrop-blur-xl border border-cyan-400/20",
                    "rounded-xl shadow-2xl shadow-black/50 overflow-hidden",
                    "animate-fadeIn"
                  )}>
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border-b border-white/5">
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Select AI Model</p>
                      <p className="text-xs text-gray-400 mt-0.5">Choose the best model for your task</p>
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
                            selectedModel.id === model.id && "bg-cyan-400/10 border border-cyan-400/30"
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
                              <span className="font-medium text-white text-sm">{model.name}</span>
                              {model.isPopular && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-400/20 text-cyan-400 rounded">POPULAR</span>
                              )}
                              {model.isNew && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded">NEW</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{model.provider}</p>
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
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-black/30 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 text-center">
                        ⚡ Current: <span className="text-cyan-400 font-medium">{selectedModel.name}</span> by {selectedModel.provider}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick info badges */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className={cn("w-2 h-2 rounded-full", 
                  selectedModel.speed === 'fast' && "bg-blue-400",
                  selectedModel.speed === 'balanced' && "bg-yellow-400",
                  selectedModel.speed === 'powerful' && "bg-red-400"
                )} />
                {selectedModel.speed}
              </span>
              <span>•</span>
              <span>Press Enter to send</span>
            </div>
          </div>

          {/* Input Container - Clean Design */}
          <div className="relative bg-gray-800/70 border border-gray-700/60 rounded-2xl focus-within:border-cyan-500/50 focus-within:shadow-lg focus-within:shadow-cyan-500/10 transition-all duration-200 overflow-hidden">
            
            <div className="relative flex items-center gap-2.5 p-2.5">
              {/* File Attachment Button */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.txt,.doc,.docx,.md,.json,.csv"
              />
              <button
                type="button"
                onClick={handleAttachClick}
                disabled={isLoading}
                className={`p-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !isLoggedIn 
                    ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border border-yellow-500/30' 
                    : attachedFile 
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-transparent text-gray-400 hover:text-cyan-400 hover:bg-gray-700/50'
                }`}
                title={!isLoggedIn ? "🔒 Login to attach files" : "Attach file"}
              >
                <Paperclip className="w-[19px] h-[19px]" />
              </button>

              {/* AI Tools Button */}
              <button
                type="button"
                onClick={() => setIsToolsOpen(true)}
                disabled={isLoading}
                className={`p-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isToolsOpen
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                    : 'bg-transparent text-gray-400 hover:text-violet-400 hover:bg-gray-700/50'
                }`}
                title="AI Tools (Web Search, Images, Voice, Code, Files, Translate)"
              >
                <Wrench className="w-[19px] h-[19px]" />
              </button>
              
              {/* Text Input */}
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NEXUS AI anything..."
                className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0 focus:outline-none text-sm px-1 py-1"
                disabled={isLoading}
                rows={1}
              />

              {/* Action Buttons Container */}
              <div className="flex items-center gap-1.5">
                {/* Stop Button - Shows when loading */}
                {isLoading && onStop && (
                  <Button
                    onClick={onStop}
                    size="sm"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white px-3 h-9 rounded-lg shadow-md shadow-red-500/25 hover:shadow-red-500/35 transition-all duration-200"
                    title="Stop generating"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1 text-xs font-medium hidden sm:inline">Stop</span>
                  </Button>
                )}
                
                {/* Send Button */}
                <Button
                  onClick={onSubmit}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className={`bg-gradient-to-r ${isLoading ? 'from-gray-600 to-gray-700' : 'from-cyan-500 to-violet-600'} ${isLoading ? '' : 'hover:from-cyan-400 hover:to-violet-500'} text-white px-3.5 h-9 rounded-lg shadow-md ${isLoading ? '' : 'shadow-cyan-500/25 hover:shadow-cyan-500/35'} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Helper Text - Compact */}
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[11px] text-gray-500 leading-tight">
              Press <kbd className="px-1.5 py-0.5 bg-gray-800/80 rounded text-gray-400 text-[10px] font-mono mx-1 border border-gray-700/50">Enter</kbd> to send
              <span className="mx-1.5 text-gray-600">|</span>
              <kbd className="px-1.5 py-0.5 bg-gray-800/80 rounded text-gray-400 text-[10px] font-mono mx-1 border border-gray-700/50">Shift+Enter</kbd> for new line
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <selectedModel.icon className={cn("w-3 h-3", selectedModel.color)} />
              <span className="font-medium text-cyan-400">{selectedModel.name}</span>
              <span className="text-gray-600">•</span>
              <span>NEXUS AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools Panel */}
      <ToolsPanel
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        onInsertToChat={handleInsertFromTools}
        isLoggedIn={isLoggedIn}
        onLoginRequired={onLoginRequired}
      />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }

        /* Hide scrollbar by default - show only when scrolling/long content */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  )
}

// Render markdown-like content
function renderMessageContent(
  content: string, 
  onCopy: (text: string) => void, 
  copiedCode: boolean
): React.ReactNode {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let currentParagraph = ''
  let inCodeBlock = false
  let codeContent = ''

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      elements.push(
        <p key={`p-${elements.length}`} className="text-gray-200 my-2 whitespace-pre-wrap leading-relaxed">
          {formatInlineMarkdown(currentParagraph.trim())}
        </p>
      )
      currentParagraph = ''
    }
  }

  lines.forEach((line, lineIndex) => {
    // Code block handling
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${elements.length}`} className="my-4 relative group/code">
            {/* Code header */}
            <div className="flex items-center justify-between bg-gray-900 rounded-t-lg px-4 py-2 border-b border-gray-700">
              <span className="text-xs text-gray-400 font-mono">code</span>
              <button
                onClick={() => onCopy(codeContent)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-xs text-gray-300 transition-colors opacity-0 group-hover/code:opacity-100"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900/80 rounded-b-lg p-4 overflow-x-auto text-sm border border-gray-800 border-t-0">
              <code className="text-emerald-400 font-mono leading-relaxed">{codeContent}</code>
            </pre>
          </div>
        )
        codeContent = ''
        inCodeBlock = false
      } else {
        flushParagraph()
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeContent += line + '\n'
      return
    }

    // Headers
    if (line.startsWith('# ')) {
      flushParagraph()
      elements.push(<h1 key={lineIndex} className="text-2xl font-bold text-white mt-6 mb-3 text-gradient">{line.slice(2)}</h1>)
      return
    }
    if (line.startsWith('## ')) {
      flushParagraph()
      elements.push(<h2 key={lineIndex} className="text-xl font-semibold text-white mt-5 mb-2.5">{line.slice(3)}</h2>)
      return
    }
    if (line.startsWith('### ')) {
      flushParagraph()
      elements.push(<h3 key={lineIndex} className="text-lg font-medium text-cyan-400 mt-4 mb-2">{line.slice(4)}</h3>)
      return
    }

    // Lists
    if (line.match(/^\s*[-*]\s+/)) {
      flushParagraph()
      elements.push(
        <li key={lineIndex} className="ml-4 text-gray-200 list-disc mb-1 marker:text-cyan-500">
          {formatInlineMarkdown(line.replace(/^\s*[-*]\s+/, ''))}
        </li>
      )
      return
    }
    if (line.match(/^\d+\.\s+/)) {
      flushParagraph()
      elements.push(
        <li key={lineIndex} className="ml-4 text-gray-200 list-decimal mb-1 marker:text-violet-400">
          {formatInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}
        </li>
      )
      return
    }

    // Horizontal rule
    if (line.trim() === '---') {
      flushParagraph()
      elements.push(<hr key={lineIndex} className="my-4 border-gray-700/50" />)
      return
    }

    // Regular paragraph
    if (line.trim()) {
      currentParagraph += (currentParagraph ? ' ' : '') + line
    } else {
      flushParagraph()
    }
  })

  flushParagraph()

  return elements.length > 0 ? elements : content
}

// Format inline markdown
function formatInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /\*\*(.*?)\*\*|`(.*?)`|\*(.*?)\*/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    
    if (match[1]) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{match[1]}</strong>)
    } else if (match[2]) {
      parts.push(<code key={match.index} className="px-2 py-0.5 bg-gray-800/80 rounded-md text-cyan-300 text-sm font-mono border border-gray-700/50">{match[2]}</code>)
    } else if (match[3]) {
      parts.push(<em key={match.index} className="italic text-gray-300">{match[3]}</em>)
    }
    
    lastIndex = regex.lastIndex
  }
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  
  return parts.length > 0 ? parts : text
}
