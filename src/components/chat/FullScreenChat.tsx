'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, RefreshCw, Copy, Check, Sparkles, User, Bot, ThumbsUp, ThumbsDown, RotateCcw, Square, Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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
  const handleAttachClick = () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Trigger login modal if callback provided
      if (onLoginRequired) {
        onLoginRequired()
      }
      return
    }
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
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      {/* Welcome Header - Only show when no messages or first load */}
      {messages.length <= 1 && (
        <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto custom-scrollbar sidebar-scroll">
          <div className="text-center max-w-2xl py-8">
            {/* Logo */}
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-2xl shadow-cyan-500/25 animate-pulse-slow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-[family-name:var(--font-orbitron)]">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                NEXUS AI
              </span>
            </h2>
            
            <p className="text-gray-400 text-base mb-6 max-w-xl mx-auto leading-relaxed">
              Your advanced AI assistant powered by Llama 3.1. Ask me anything — I'm here to help!
            </p>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
              {[
                { icon: '💡', text: 'Explain', prompt: 'Explain quantum computing' },
                { icon: '💻', text: 'Code', prompt: 'Write Python code' },
                { icon: '📝', text: 'Write', prompt: 'Help me write an email' },
                { icon: '🎯', text: 'Ideas', prompt: 'Creative business ideas' }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(action.prompt)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all duration-200 group"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area - ONLY this scrolls */}
      <div className={`flex-1 overflow-y-auto min-h-0 custom-scrollbar sidebar-scroll ${messages.length <= 1 ? 'hidden' : ''}`}>
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

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto p-3">
          {/* Attached File Preview - Shows ABOVE input box when file is attached */}
          {attachedFile && !isLoading && (
            <div className="mb-2 p-3 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-xl animate-fadeIn">
              <div className="flex items-start gap-3">
                {/* File Preview/Thumbnail - LEFT SIDE */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-800/80 border border-gray-600/30 overflow-hidden flex items-center justify-center">
                  {filePreview ? (
                    /* Image Preview */
                    <img 
                      src={filePreview} 
                      alt={attachedFile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Document Icon based on type */
                    <div className={`p-2 rounded-lg ${
                      attachedFile.type.includes('pdf') ? 'bg-red-500/20' :
                      attachedFile.type.includes('word') || attachedFile.name.endsWith('.docx') ? 'bg-blue-500/20' :
                      attachedFile.type.includes('sheet') || attachedFile.name.endsWith('.xlsx') ? 'bg-green-500/20' :
                      attachedFile.type.includes('text') || attachedFile.name.endsWith('.txt') ? 'bg-yellow-500/20' :
                      'bg-cyan-500/20'
                    }`}>
                      {attachedFile.type.includes('pdf') ? (
                        <span className="text-red-400 font-bold text-xs">PDF</span>
                      ) : attachedFile.type.includes('word') || attachedFile.name.endsWith('.docx') ? (
                        <span className="text-blue-400 font-bold text-xs">DOC</span>
                      ) : attachedFile.type.includes('sheet') || attachedFile.name.endsWith('.xlsx') ? (
                        <span className="text-green-400 font-bold text-xs">XLS</span>
                      ) : attachedFile.type.includes('text') || attachedFile.name.endsWith('.txt') ? (
                        <span className="text-yellow-400 font-bold text-xs">TXT</span>
                      ) : (
                        <Paperclip className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* File Info - MIDDLE */}
                <div className="min-w-0 flex-1 py-1">
                  <p className="text-sm font-medium text-white truncate">
                    {attachedFile.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(attachedFile.size / 1024).toFixed(1)} KB • {attachedFile.type || 'Unknown type'}
                  </p>
                  {filePreview && (
                    <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Image ready to send
                    </p>
                  )}
                </div>
                
                {/* Remove Button - RIGHT */}
                <button
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 mt-1"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input Container */}
          <div className="relative bg-gray-800/50 border border-gray-700/50 rounded-2xl focus-within:border-cyan-500/50 focus-within:shadow-lg focus-within:shadow-cyan-500/10 transition-all duration-300 overflow-hidden">
            {/* Gradient border effect on focus */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-violet-500/0 to-pink-500/0 focus-within:from-cyan-500/10 focus-within:via-violet-500/10 focus-within:to-pink-500/10 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="relative flex gap-3 items-end p-2">
              {/* File Attachment Button - Left Side */}
              <div className="flex items-center gap-1">
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
                  className={`p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border ${
                    !isLoggedIn 
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/40 hover:from-orange-500/30 hover:to-red-500/30 animate-pulse' 
                      : attachedFile 
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' 
                        : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-cyan-400 border-gray-600/30 hover:border-cyan-500/30'
                  }`}
                  title={!isLoggedIn ? "🔒 Login to attach files" : "Attach file"}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NEXUS AI anything..."
                className="flex-1 min-h-[52px] max-h-[200px] resize-none bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0 focus:outline-none text-base px-2"
                disabled={isLoading}
                rows={1}
              />

              {/* Stop Button - Shows when loading */}
              {isLoading && onStop && (
                <Button
                  onClick={onStop}
                  className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white px-4 h-11 rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 animate-pulse"
                  title="Stop generating"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span className="ml-1.5 text-sm font-medium hidden sm:inline">Stop</span>
                </Button>
              )}
              
              {/* Send Button */}
              <Button
                onClick={onSubmit}
                disabled={!inputValue.trim() || isLoading}
                className={`bg-gradient-to-r ${isLoading ? 'from-gray-600 to-gray-700' : 'from-cyan-500 to-violet-600'} ${isLoading ? '' : 'hover:from-cyan-400 hover:to-violet-500'} text-white px-5 h-11 rounded-xl shadow-lg ${isLoading ? '' : 'shadow-cyan-500/25 hover:shadow-cyan-500/40'} transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="flex items-center justify-between mt-3 px-2">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 text-[10px] font-mono">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 text-[10px] font-mono">Shift+Enter</kbd> for new line
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Llama 3.1</span>
            </div>
          </div>
        </div>
      </div>

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
