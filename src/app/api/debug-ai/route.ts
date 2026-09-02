import { NextResponse } from 'next/server'

export async function GET() {
  // Debug endpoint to check if env vars are loaded
  return NextResponse.json({
    status: 'debug',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.OPENROUTER_API_KEY,
      apiKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
      apiKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...',
      model: process.env.OPENROUTER_MODEL || 'not set',
      visionModel: process.env.OPENROUTER_VISION_MODEL || 'not set'
    },
    message: 'If hasApiKey is true, your env vars are working!'
  })
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    // Simple AI call test
    const apiKey = process.env.OPENROUTER_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'No API key found',
        debug: {
          allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPEN') || k.includes('API'))
        }
      })
    }
    
    console.log('🔑 Making test API call to OpenRouter...')
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nexus-ai.vercel.app',
        'X-Title': 'NEXUS AI Test'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Reply in one sentence.' },
          { role: 'user', content: message || 'Hello!' }
        ],
        max_tokens: 50
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenRouter Error:', errorText)
      return NextResponse.json({
        error: 'OpenRouter API failed',
        status: response.status,
        details: errorText
      })
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      response: data.choices[0]?.message?.content || 'No response',
      model: data.model,
      usage: data.usage
    })
    
  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
