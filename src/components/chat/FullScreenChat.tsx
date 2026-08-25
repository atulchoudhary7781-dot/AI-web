'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, RefreshCw, Copy, Check, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface FullScreenChatProps {
  messages: ChatMessage[]
  inputValue: string
  setInputValue: (value: string) => void
  isLoading: boolean
  onSubmit: () => void
  copiedCode: boolean
  onCopy: (text: string) => void
}

export default function FullScreenChat({
  messages,
  inputValue,
  setInputValue,
  isLoading,
  onSubmit,
  copiedCode,
  onCopy
}: FullScreenChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white'
                    : 'bg-gray-800/50 border border-gray-700'
                }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {renderMessageContent(message.content, onCopy, copiedCode)}
                  </div>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 order-2">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-400">NEXUS is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask NEXUS AI anything..."
              className="flex-1 min-h-[52px] max-h-[200px] resize-none bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={onSubmit}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-6 h-[52px] rounded-xl glow-cyan"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Powered by Llama 3.1 via OpenRouter
          </p>
        </div>
      </div>
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
        <p key={`p-${elements.length}`} className="text-gray-200 my-2 whitespace-pre-wrap">
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
          <div key={`code-${elements.length}`} className="my-4 relative group">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onCopy(codeContent)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-green-400 font-mono">{codeContent}</code>
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
      elements.push(<h1 key={lineIndex} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>)
      return
    }
    if (line.startsWith('## ')) {
      flushParagraph()
      elements.push(<h2 key={lineIndex} className="text-xl font-semibold text-white mt-5 mb-2">{line.slice(3)}</h2>)
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
        <li key={lineIndex} className="ml-4 text-gray-200 list-disc">
          {formatInlineMarkdown(line.replace(/^\s*[-*]\s+/, ''))}
        </li>
      )
      return
    }
    if (line.match(/^\d+\.\s+/)) {
      flushParagraph()
      elements.push(
        <li key={lineIndex} className="ml-4 text-gray-200 list-decimal">
          {formatInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}
        </li>
      )
      return
    }

    // Horizontal rule
    if (line.trim() === '---') {
      flushParagraph()
      elements.push(<hr key={lineIndex} className="my-4 border-gray-700" />)
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
      parts.push(<code key={match.index} className="px-1.5 py-0.5 bg-gray-800 rounded text-cyan-300 text-sm font-mono">{match[2]}</code>)
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
