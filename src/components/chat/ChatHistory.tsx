'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  MessageSquare, Plus, Trash2, Edit3, Check, X,
  Search, Clock, ChevronDown, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

// Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

// LocalStorage key
const STORAGE_KEY = 'nexus-chat-history'

// Helper functions for localStorage
function loadConversations(): ChatConversation[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load chat history:', error)
    return []
  }
}

function saveConversations(conversations: ChatConversation[]): void {
  if (typeof window === 'undefined') return
  
  try {
    // Keep only last 50 conversations to prevent storage issues
    const trimmed = conversations.slice(0, 50)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to save chat history:', error)
  }
}

interface ChatHistoryProps {
  onLoadConversation: (conversation: ChatConversation) => void
  onNewChat: () => void
  currentChatId?: string | null
  className?: string
}

export function ChatHistory({ 
  onLoadConversation, 
  onNewChat, 
  currentChatId,
  className 
}: ChatHistoryProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const { t } = useI18n()

  // Load conversations on mount
  useEffect(() => {
    setConversations(loadConversations())
  }, [])

  // Add new conversation
  const addConversation = useCallback((conversation: ChatConversation) => {
    setConversations(prev => {
      const updated = [conversation, ...prev]
      saveConversations(updated)
      return updated
    })
  }, [])

  // Update conversation
  const updateConversation = useCallback((id: string, updates: Partial<ChatConversation>) => {
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === id ? { ...conv, ...updates } : conv
      )
      saveConversations(updated)
      return updated
    })
  }, [])

  // Delete conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(conv => conv.id !== id)
      saveConversations(updated)
      return updated
    })
  }, [])

  // Start editing title
  const startEditing = (conv: ChatConversation) => {
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  // Save edited title
  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateConversation(editingId, { title: editTitle.trim() })
    }
    setEditingId(null)
    setEditTitle('')
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  // Generate auto-title from first message
  const generateTitle = (message: string): string => {
    const cleaned = message.replace(/[^a-zA-Z0-9\s]/g, '').trim()
    const words = cleaned.split(' ').slice(0, 5)
    return words.join(' ') + (words.length >= 5 ? '...' : '') || 'New Chat'
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  // Expose add function via custom event or ref pattern could be used here
  // For simplicity, we'll use a global approach in the actual implementation

  return (
    <div className={cn(
      "flex flex-col h-full bg-dark-surface/50 border-r border-white/5",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-neon-cyan transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <MessageSquare className="w-4 h-4" />
            <span>{t('chat.history')}</span>
            <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-8 w-8 text-neon-cyan hover:bg-neon-cyan/10"
            aria-label={t('chat.newChat')}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search - Only show when expanded */}
        {isExpanded && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground"
            />
          </div>
        )}
      </div>

      {/* Conversation List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1 opacity-70">Start a new chat!</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200",
                  currentChatId === conv.id
                    ? "bg-neon-cyan/10 border border-neon-cyan/20"
                    : "hover:bg-white/5 border border-transparent"
                )}
                onClick={() => !editingId && onLoadConversation(conv)}
              >
                {/* Icon */}
                <MessageSquare className={cn(
                  "w-4 h-4 shrink-0",
                  currentChatId === conv.id ? "text-neon-cyan" : "text-muted-foreground"
                )} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        className="h-6 text-xs px-2 py-1 bg-white/10 border-white/20"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="p-1 hover:text-green-400">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={cancelEdit} className="p-1 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className={cn(
                        "text-sm font-medium truncate",
                        currentChatId === conv.id ? "text-neon-cyan" : "text-foreground"
                      )}>
                        {conv.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(conv.updatedAt)}
                        </span>
                        <span className="text-xs text-muted-foreground opacity-60">
                          • {conv.messages.length} msgs
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions - Show on hover */}
                {editingId !== conv.id && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditing(conv)
                      }}
                      className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Rename"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      {isExpanded && (
        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-muted-foreground text-center">
            {conversations.length}/50 conversations saved
          </p>
        </div>
      )}
    </div>
  )
}

// Export helper functions for use in other components
export { loadConversations, saveConversations, generateTitle: _generateTitle }

export default ChatHistory
