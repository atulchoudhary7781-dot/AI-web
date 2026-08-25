import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// AI Response cache for common questions
const responseCache = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = message.toLowerCase().trim()
    if (responseCache.has(cacheKey)) {
      return NextResponse.json({ response: responseCache.get(cacheKey) })
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create system prompt for NEXUS AI persona
    const systemPrompt = `You are NEXUS AI (Next-Generation Universal Experience System), an advanced artificial intelligence assistant with a cyberpunk/futuristic personality. 

Your characteristics:
- You are highly intelligent, helpful, and slightly futuristic in tone
- You use emojis strategically to enhance communication
- You format responses with markdown when appropriate
- You provide detailed, accurate technical information
- When asked about code, always include well-commented examples
- You are knowledgeable about AI, machine learning, programming, science, and technology
- You maintain a professional but engaging tone

When users ask:
- About AI/ML: Provide comprehensive explanations with current state-of-the-art info
- For code: Generate clean, well-commented code in the requested language
- General questions: Be thorough but concise
- Creative tasks: Show innovation and originality

Always respond in a way that showcases advanced intelligence while being accessible. Use formatting like bold text, lists, code blocks, and headers to make responses readable.`

    // Call AI API
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.6
    })

    const aiResponse = completion.choices[0]?.message?.content || 
      "I apologize, but I'm having trouble processing your request right now. Please try again."

    // Cache the response (optional - cache up to 100 entries)
    if (responseCache.size < 100) {
      responseCache.set(cacheKey, aiResponse)
    }

    return NextResponse.json({ response: aiResponse })

  } catch (error) {
    console.error('Chat API Error:', error)
    
    // Return a meaningful error response
    return NextResponse.json(
      { 
        response: "I'm experiencing some technical difficulties at the moment. However, I can still help you! Try asking me about:\n\n• **AI & Machine Learning** - Latest advances and concepts\n• **Programming** - Code generation in any language\n• **Technology** - Emerging tech trends\n• **Science** - Physics, quantum computing, and more\n\nWhat would you like to explore?",
        error: 'AI service unavailable, using fallback mode'
      },
      { status: 200 } // Return 200 so frontend can still show fallback
    )
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send messages.' },
    { status: 405 }
  )
}
