import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (would use database in production)
// This is a simple implementation - in production, use Prisma/Supabase
const chatHistoryStorage = new Map<string, {
  id: string
  title: string
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}>()

// GET /api/chat/history - Retrieve all conversations or a specific one
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')
    
    // If specific ID requested
    if (conversationId) {
      const conversation = chatHistoryStorage.get(conversationId)
      
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ conversation })
    }
    
    // Return all conversations (sorted by updatedAt desc)
    const allConversations = Array.from(chatHistoryStorage.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    return NextResponse.json({
      conversations: allConversations,
      count: allConversations.length,
    })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}

// POST /api/chat/history - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, userId } = body
    
    const newConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    chatHistoryStorage.set(newConversation.id, newConversation)
    
    return NextResponse.json({
      conversation: newConversation,
      message: 'Conversation created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

// PUT /api/chat/history - Update a conversation (rename, add message)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, message } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }
    
    const existing = chatHistoryStorage.get(id)
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }
    
    // Update title if provided
    if (title !== undefined) {
      existing.title = title
    }
    
    // Add message if provided
    if (message && message.role && message.content) {
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: message.role,
        content: message.content,
        timestamp: new Date().toISOString(),
      }
      existing.messages.push(newMessage)
      
      // Auto-generate title from first user message
      if (message.role === 'user' && existing.messages.length === 1) {
        existing.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
      }
    }
    
    existing.updatedAt = new Date().toISOString()
    chatHistoryStorage.set(id, existing)
    
    return NextResponse.json({
      conversation: existing,
      message: 'Conversation updated successfully',
    })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/history - Delete a conversation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }
    
    const exists = chatHistoryStorage.has(conversationId)
    
    if (!exists) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }
    
    chatHistoryStorage.delete(conversationId)
    
    return NextResponse.json({
      message: 'Conversation deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}
