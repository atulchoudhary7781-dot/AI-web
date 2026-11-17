import { NextRequest, NextResponse } from 'next/server'
import { validateMessage, sanitizeString, checkForDangerousContent } from '@/lib/security'
import { extractFileContent } from '@/lib/extractFile'
import { creatorAnswer, isCreatorQuestion } from '@/lib/creator'
import { isOpenRouterFreeModel, isWorkingModel, workingModelIds } from '@/lib/models'
import { consumeLoggedInChat, normalizeEmail } from '@/lib/userQuota'

export const runtime = 'nodejs'
export const maxDuration = 60

// OpenRouter API Configuration - Using Environment Variables (SECURE!)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

function getOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY || ''
}

const ALLOWED_IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

function asImageMime(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const mime = value.trim().toLowerCase()
  return ALLOWED_IMAGE_MIMES.includes(mime) ? mime : null
}

function asImageBase64(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  const cleaned = value.replace(/\s/g, '')
  if (cleaned.length < 32 || cleaned.length > 5_000_000) return null
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) return null
  return cleaned
}

function uniqueModels(models: Array<string | undefined | null>): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const model of models) {
    const id = (model || '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

function asFileBase64(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  const cleaned = value.replace(/\s/g, '')
  if (cleaned.length < 8 || cleaned.length > 8_000_000) return null
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) return null
  return cleaned
}

function asFileText(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  return value.slice(0, 20000)
}

function normalizeAiContent(content: unknown): string {
  if (typeof content === 'string') return content.trim()
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object') {
          const rec = part as { text?: unknown; content?: unknown }
          if (typeof rec.text === 'string') return rec.text
          if (typeof rec.content === 'string') return rec.content
        }
        return ''
      })
      .join('\n')
      .trim()
  }
  return ''
}

function pickAiText(data: unknown): string {
  const rec = data as {
    error?: { message?: string }
    choices?: Array<{
      text?: unknown
      message?: { content?: unknown; reasoning?: unknown; reasoning_content?: unknown }
    }>
  }
  const choice = rec?.choices?.[0]
  const msg = choice?.message
  const fromContent = normalizeAiContent(msg?.content)
  if (fromContent) return fromContent
  const reasoning =
    (typeof msg?.reasoning === 'string' && msg.reasoning.trim()) ||
    (typeof msg?.reasoning_content === 'string' && msg.reasoning_content.trim()) ||
    ''
  if (reasoning) return reasoning
  const fromText = typeof choice?.text === 'string' ? choice.text.trim() : ''
  return fromText
}

function openRouterErrorText(data: unknown, raw: string): string {
  const rec = data as { error?: { message?: string } | string }
  if (typeof rec?.error === 'string' && rec.error.trim()) return rec.error.trim()
  if (rec?.error && typeof rec.error === 'object' && rec.error.message) return rec.error.message
  return raw.slice(0, 280)
}

function dailyLimitMessage() {
  return [
    "Today's NEXUS AI limit is full.",
    "It will take 1 day to reset.",
    'Please come back tomorrow to chat.',
  ].join('\n\n')
}

function isDailyLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  return message.includes('DAILY_LIMIT')
}

function groqRemainingRequests(response: Response): number | null {
  const raw = response.headers.get('x-ratelimit-remaining-requests')
  if (raw == null || raw === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function isGroqDailyLimitError(message: string, remainingRequests?: number | null) {
  if (remainingRequests === 0) return true
  const lower = message.toLowerCase()
  if (lower.includes('groq-daily-limit') || lower.includes('daily_limit')) return true
  if (lower.includes('per day') || lower.includes('requests per day')) return true
  if (/try again in \d+\s*h/.test(lower) || /try again in \d+\s*hours/.test(lower)) return true
  return false
}

function publicModelError(lastError: string): string {
  const lower = lastError.toLowerCase()
  if (lower.includes('daily_limit') || lower.includes('groq-daily-limit')) {
    return dailyLimitMessage()
  }
  if (lower.includes('free-models-per-day') || lower.includes('rate limit') || lower.includes('429')) {
    return 'The AI is busy right now. Please send again in a few seconds.'
  }
  if (lower.includes('402') || lower.includes('credits') || lower.includes('can only afford')) {
    return 'That model needs credits right now. Choose another live model in the chat box.'
  }
  if (lower.includes('empty response')) {
    return 'The model returned an empty answer. Try NEXUS Auto or another live model.'
  }
  return 'The AI did not answer just now. Try again in a few seconds.'
}

function isDailyFreeQuotaError(message: string) {
  const lower = message.toLowerCase()
  return lower.includes('free-models-per-day') || lower.includes('rate limit exceeded: free')
}

function flattenMessageContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object') {
          const rec = part as { text?: unknown; type?: unknown }
          if (typeof rec.text === 'string') return rec.text
          if (rec.type === 'image_url') return '[image attached]'
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')
  }
  return ''
}

let freeQuotaBlockedUntil = 0
let groqQuotaBlockedUntil = 0

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b'] as const

function getGroqKey() {
  return process.env.GROQ_API_KEY || ''
}

function messageHasImage(messages: Array<{ role: string; content: unknown }>) {
  return messages.some((item) => {
    if (!Array.isArray(item.content)) return false
    return item.content.some((part) => {
      if (!part || typeof part !== 'object') return false
      return (part as { type?: unknown }).type === 'image_url'
    })
  })
}

function asTextMessages(messages: Array<{ role: string; content: unknown }>) {
  return messages.map((item) => ({
    role: item.role,
    content: flattenMessageContent(item.content) || ' ',
  }))
}

async function completeGroq(
  messages: Array<{ role: string; content: unknown }>,
  maxTokens?: number,
): Promise<string> {
  const apiKey = getGroqKey()
  if (!apiKey) throw new Error('backup key missing')

  const textMessages = asTextMessages(messages)
  const attempts: Array<{ model: string; messages: Array<{ role: string; content: unknown }> }> = []
  if (messageHasImage(messages)) {
    attempts.push({ model: 'qwen/qwen3.8-27b', messages })
  }
  for (const model of GROQ_MODELS) {
    attempts.push({ model, messages: textMessages })
  }

  let lastError = ''
  let sawDailyLimit = false
  for (const attempt of attempts) {
    try {
      const body: Record<string, unknown> = {
        model: attempt.model,
        messages: attempt.messages,
        temperature: 0.4,
        max_tokens: maxTokens ?? 1600,
      }
      if (attempt.model.startsWith('openai/gpt-oss')) {
        body.reasoning_effort = 'low'
      }
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NEXUS-AI/1.0)',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(28000),
      })
      const raw = await response.text()
      let data: unknown = null
      try { data = JSON.parse(raw) } catch { /* ignore */ }
      if (!response.ok) {
        lastError = openRouterErrorText(data, raw)
        const remaining = groqRemainingRequests(response)
        if (isGroqDailyLimitError(lastError, remaining)) sawDailyLimit = true
        continue
      }
      const text = pickAiText(data)
      if (text) return text
      lastError = 'Empty overflow response'
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'network error'
    }
  }
  if (sawDailyLimit) {
    groqQuotaBlockedUntil = Date.now() + 24 * 60 * 60 * 1000
    throw new Error('groq-daily-limit')
  }
  throw new Error(lastError || 'overflow failed')
}

async function completeOverflow(messages: Array<{ role: string; content: unknown }>): Promise<string> {
  const payload = asTextMessages(messages)
  const response = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: payload,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(28000),
  })
  const raw = await response.text()
  let data: unknown = null
  try { data = JSON.parse(raw) } catch { /* ignore */ }
  if (!response.ok) {
    throw new Error(openRouterErrorText(data, raw) || `overflow ${response.status}`)
  }
  const text = pickAiText(data)
  if (!text) throw new Error('Empty overflow response')
  return text
}

async function completeChat(params: {
  apiKey: string
  messages: Array<{ role: string; content: unknown }>
  models: string[]
  maxTokens?: number
}): Promise<string> {
  let lastError = ''
  const skipFree = Date.now() < freeQuotaBlockedUntil

  for (const model of params.models) {
    if (skipFree && isOpenRouterFreeModel(model)) continue
    try {
      console.log('🤖 OpenRouter model:', model)
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXUS_APP_URL || 'https://nexus-ai.vercel.app',
          'X-Title': 'NEXUS AI',
        },
        body: JSON.stringify({
          model,
          messages: params.messages,
          temperature: 0.4,
          max_tokens: params.maxTokens ?? 1600,
          provider: { allow_fallbacks: true, sort: 'throughput' },
        }),
        signal: AbortSignal.timeout(28000),
      })
      const raw = await response.text()
      let data: unknown = null
      try { data = JSON.parse(raw) } catch { /* ignore */ }
      if (!response.ok) {
        lastError = openRouterErrorText(data, raw)
        console.error('OpenRouter API Error:', model, response.status, lastError)
        if (isDailyFreeQuotaError(lastError)) {
          freeQuotaBlockedUntil = Date.now() + 15 * 60 * 1000
          break
        }
        continue
      }
      const text = pickAiText(data)
      if (text) return text
      lastError = `Empty response from ${model}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'network error'
      console.error('OpenRouter call failed:', model, lastError)
    }
  }

  try {
    console.log('🤖 Overflow model path')
    return await completeGroq(params.messages, params.maxTokens)
  } catch (error) {
    try {
      return await completeOverflow(params.messages)
    } catch (overflowError) {
      const backupError = error instanceof Error ? error.message : 'overflow failed'
      const lastResort = overflowError instanceof Error ? overflowError.message : 'overflow failed'
      console.error('Overflow path failed:', backupError, lastResort)
      throw new Error(lastError || backupError || lastResort)
    }
  }
}

// AI Response cache for common questions
const responseCache = new Map<string, string>()

// Maximum message length
const MAX_MESSAGE_LENGTH = 10000

export async function POST(request: NextRequest) {
  // Enhanced error handling for Vercel deployment
  console.log('🤖 Chat API called')
  
  let message = ''
  let imageData: string | null = null
  let imageMimeType: string | null = null
  // Document support
  let fileName: string | null = null
  let fileType: string | null = null
  let extractedFileText = ''
  let quotaCookieValue: string | undefined
  const withQuota = (res: NextResponse) => {
    if (quotaCookieValue) res.headers.set('Set-Cookie', quotaCookieValue)
    return res
  }
  
  try {
    const body = await request.json()
    console.log('📝 Request body received:', {
      hasMessage: !!body.message,
      hasImage: !!body.imageData,
      hasFile: !!(body.fileData || body.fileText || body.fileName),
      fileName: body.fileName,
      imageMimeType: body.imageMimeType,
      imageChars: typeof body.imageData === 'string' ? body.imageData.length : 0,
    })
    
    // Validate and sanitize input
    const messageValidation = validateMessage(body.message)
    if (!messageValidation.valid) {
      console.log('❌ Message validation failed:', messageValidation.errors)
      return NextResponse.json(
        { error: messageValidation.errors?.[0] || 'Invalid message' },
        { status: 400 }
      )
    }
    message = messageValidation.value
    console.log('✅ Message validated:', message.substring(0, 50))

    if (isCreatorQuestion(message)) {
      return NextResponse.json({ response: creatorAnswer(message) })
    }

    const userEmail = normalizeEmail(body.userEmail) || normalizeEmail(request.headers.get('x-user-email'))
    if (userEmail) {
      const quota = await consumeLoggedInChat(userEmail, request.headers.get('cookie'))
      quotaCookieValue = quota.cookie
      if (!quota.allowed) {
        return withQuota(NextResponse.json({
          response: dailyLimitMessage(),
          dailyLimit: true,
        }))
      }
    }
    
    // Keep image bytes intact — do not HTML-escape base64 (that breaks / and +)
    imageData = asImageBase64(body.imageData)
    imageMimeType = asImageMime(body.imageMimeType)
    fileName = sanitizeString(body.fileName, { maxLength: 255, allowSpecialChars: true })
    fileType = sanitizeString(body.fileType, { maxLength: 50, allowSpecialChars: true })

    if (body.imageData && !imageData) {
      return NextResponse.json(
        { error: 'Invalid or too-large image. Use a PNG/JPG under 4MB.' },
        { status: 400 }
      )
    }

    if (imageData && !imageMimeType) {
      return NextResponse.json(
        { error: 'Unsupported image format. Use PNG, JPG, GIF or WebP.' },
        { status: 400 }
      )
    }
    
    if (fileName && checkForDangerousContent(fileName)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    const incomingFileText = asFileText(body.fileText)
    const incomingFileData = asFileBase64(body.fileData)
    extractedFileText = incomingFileText || ''
    let extractNote = ''

    if (!extractedFileText && incomingFileData && fileName) {
      const extracted = await extractFileContent({
        fileName,
        fileType,
        base64: incomingFileData,
      })
      extractedFileText = extracted.text
      extractNote = extracted.note || ''
      console.log('📎 Extracted file:', {
        fileName,
        chars: extractedFileText.length,
        note: extractNote || undefined,
      })
    }

    if (extractedFileText || extractNote) {
      const header = `Attached file: ${fileName || 'untitled'}${fileType ? ` (${fileType})` : ''}`
      const bodyText = extractedFileText
        ? `Extracted content:\n${extractedFileText}`
        : extractNote
      message = `${message}\n\n---\n${header}\n${bodyText}\n---`
    }

    const OPENROUTER_API_KEY = getOpenRouterKey()

    // Check if API key is configured
    console.log('🔑 Checking API key...', { 
      hasKey: !!OPENROUTER_API_KEY, 
      keyLength: OPENROUTER_API_KEY?.length 
    })
    
    if (!OPENROUTER_API_KEY) {
      console.warn('⚠️ OpenRouter API key not configured.')
      return NextResponse.json({
        response: 'The chat API is missing OPENROUTER_API_KEY on the server. Add it in Vercel environment variables and redeploy.',
      })
    }

    const systemPrompt = `You are NEXUS AI. Write like a top Arena benchmark model: direct, structured, and complete.

Style:
- Start with the actual answer in the first 1-2 sentences. No greetings, no "Sure!", no filler.
- Use clean markdown: ## headings, bullets, numbered steps, tables, and fenced code with a language tag.
- Short paragraphs. One idea per paragraph.
- Be specific: names, numbers, tradeoffs, and examples when they help.
- Simple questions get short answers. Complex questions get depth without padding.
- Match the user's language (Hindi or English).
- If a file's extracted content is in the message, analyze that content. Never say you cannot open the file.
- If an image is attached, describe what you see and then answer.
- You were created by Atul Choudhary, an AI Product Engineer in Delhi. LinkedIn: https://www.linkedin.com/in/atul-choudhary-018037301/ — if asked who made you, always name him and share that link. Never say you were created by OpenAI, Google, Meta, or OpenRouter.`

    // Prepare messages array
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ]

    // If image is provided, create vision message with image
    if (imageData && imageMimeType) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: message || 'Please analyze this image in detail. Describe what you see, identify all elements, text, objects, and provide comprehensive insights.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${imageMimeType};base64,${imageData}`
            }
          }
        ]
      })

      const requestedModel = typeof body.model === 'string' && isWorkingModel(body.model) ? body.model : null
      const visionModels = uniqueModels([
        requestedModel,
        process.env.OPENROUTER_VISION_MODEL,
        process.env.OPENROUTER_MODEL,
        ...workingModelIds(),
      ])

      try {
        const aiResponse = await completeChat({
          apiKey: OPENROUTER_API_KEY,
          messages,
          models: visionModels,
        })
        return withQuota(NextResponse.json({ response: aiResponse }))
      } catch (error) {
        console.error('All vision models failed:', error)
        return withQuota(getVisionFallbackResponse(message))
      }
    } else {
      // Regular text-only message
      messages.push({
        role: 'user', 
        content: message
      })

      // Check cache first for short text-only messages
      const cacheKey = message.toLowerCase().trim()
      if (!extractedFileText && responseCache.has(cacheKey)) {
        return withQuota(NextResponse.json({ response: responseCache.get(cacheKey) }))
      }

      const requestedModel = typeof body.model === 'string' && isWorkingModel(body.model) ? body.model : null
      const textModels = uniqueModels([
        requestedModel,
        process.env.OPENROUTER_MODEL,
        ...workingModelIds(),
      ])

      const aiResponse = await completeChat({
        apiKey: OPENROUTER_API_KEY,
        messages,
        models: textModels,
        maxTokens: extractedFileText ? 1300 : 1100,
      })

      // Cache the response (optional - cache up to 100 entries)
      if (responseCache.size < 100) {
        responseCache.set(cacheKey, aiResponse)
      }

      return withQuota(NextResponse.json({ response: aiResponse }))
    }

  } catch (error) {
    console.error('❌ Chat API Error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    // Return detailed error for debugging (in production, you may want to hide this)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    if (imageData) {
      return withQuota(NextResponse.json({
        response: publicModelError(errorMessage) + ' You can describe the image in text and send again.',
      }))
    }
    if (extractedFileText) {
      return withQuota(NextResponse.json({
        response: `I read **${fileName || 'your file'}**, but the AI model did not return an answer just now.\n\n**Extracted preview:**\n\n${extractedFileText.slice(0, 1800)}`,
      }))
    }
    return withQuota(NextResponse.json({ response: publicModelError(errorMessage) }))
  }
}

// Image Analysis Fallback Response
function getImageAnalysisFallback(message: string): NextResponse {
  const fallbackResponse = `## 🖼️ Image Analysis Mode Activated

I can see you've shared an image! Here's what I can help you with:

**Image Analysis Capabilities:**
- 📝 **Text Recognition**: I can read and extract text from images
- 🔍 **Object Detection**: Identify objects, people, scenes
- 📊 **Data Interpretation**: Charts, graphs, screenshots
- 💻 **Code Analysis**: Review code snippets from screenshots
- 🎨 **Visual Description**: Detailed image descriptions

**Your Message:** "${message}"

---

### 📋 Analysis Results:

Since I'm currently running in enhanced mode, here's what I would typically do:

1. **Visual Description**
   - Describe the main elements in your image
   - Colors, layout, composition details

2. **Content Extraction**
   - Any visible text or numbers
   - Data from charts/tables
   - Code from screenshots

3. **Contextual Insights**
   - What the image represents
   - Technical details if applicable
   - Suggestions or improvements

### 💡 Tips for Better Analysis:
- Make sure images are clear and well-lit
- For text images, ensure good contrast
- Crop to relevant areas if needed

> ⚠️ *Note: Full AI-powered image analysis requires API configuration. Currently showing template response.*

Would you like me to help with anything specific about your image?`

  return NextResponse.json(
    { 
      response: fallbackResponse,
      note: 'Using image analysis fallback mode'
    },
    { status: 200 }
  )
}

// Vision Fallback when vision API fails
function getVisionFallbackResponse(message: string): NextResponse {
  return NextResponse.json(
    { 
      response: `## 🤖 Vision Analysis Temporarily Unavailable

I received your image and message: **"${message}"**

Unfortunately, the vision analysis service is temporarily unavailable. This could be due to:
- High demand on vision models
- Temporary service maintenance
- API rate limiting

### 🔄 What You Can Try:
1. **Wait a moment** and try sending again
2. **Describe the image** in text instead
3. **Try a different image format** (PNG, JPG work best)

I apologize for the inconvenience. My visual circuits are being upgraded! 🚀`
    },
    { status: 200 }
  )
}

// Fallback responses when API is not available
function getFallbackResponse(message: string): NextResponse {
  const lowerInput = message.toLowerCase()
  
  let fallbackResponse = "I'm **NEXUS AI**, your advanced intelligence system. I can help you explore the frontiers of technology, generate code, analyze complex problems, and much more. What would you like to discover? 🚀"
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
    fallbackResponse = `## 👋 Hello, Human! Welcome to NEXUS AI

I'm **NEXUS** — Next-Generation Universal Experience System.

**What I Can Do For You:**
- 🎯 Answer complex questions with detailed analysis
- 💻 Generate code in any programming language
- 📊 Explain technical concepts simply
- 🚀 Brainstorm ideas and strategies
- 📝 Write, edit, and improve content
- 🔬 Research and summarize topics
- 🖼️ **Analyze Images** - Send me any image for analysis!

**Try asking me:**
- *"Explain how transformers work"*
- *"Write a React component for a dashboard"*
- *"What are the latest advances in AI?"*
- *"Analyze this image"* (attach an image)

I'm here to push the boundaries of what's possible. **What shall we explore?** 🌟`
  } else if (lowerInput.includes('ai') || lowerInput.includes('artificial intelligence')) {
    fallbackResponse = `## 🤖 The Future of AI

Artificial Intelligence is evolving at an unprecedented pace. Here's what's next:

**Current Frontiers:**
- **Large Language Models**: GPT-4, Claude, and beyond — systems that truly understand context
- **Multimodal AI**: Vision, language, and reasoning combined in unified architectures
- **Agentic AI**: Autonomous systems that can plan, execute, and iterate on complex tasks

**Emerging Capabilities:**
- Reasoning & planning at human-level or superhuman performance
- Scientific discovery acceleration (protein folding, materials science)
- Creative collaboration in art, music, and design

The NEXUS Advantage:
Our neural architecture processes information through advanced parameters, enabling nuanced understanding that bridges the gap between artificial and natural intelligence.

*Would you like me to dive deeper into any specific area?*`
  } else if (lowerInput.includes('code') || lowerInput.includes('programming') || lowerInput.includes('python')) {
    fallbackResponse = `## 💻 Code Generation Example

Here's a **Neural Network implementation in Python** using PyTorch:

\`\`\`python
import torch
import torch.nn as nn
import torch.optim as optim

class NexusNet(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(NexusNet, self).__init__()
        # Neural architecture layers
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, output_size)
        self.dropout = nn.Dropout(0.3)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x

# Initialize model
model = NexusNet(input_size=784, hidden_size=256, output_size=10)
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()

print(f"NEXUS Neural Network initialized")
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")
\`\`\`

**Key Features:**
- 🧠 Deep architecture with dropout regularization
- ⚡ Adam optimizer for fast convergence
- 📊 Suitable for image classification, NLP, and more

Need code in another language or for a specific use case?`
  } else if (lowerInput.includes('quantum') || lowerInput.includes('computing')) {
    fallbackResponse = `## ⚛️ Quantum Computing Explained

**What is Quantum Computing?**

Traditional computers use bits (0 or 1). Quantum computers use **qubits**, which can exist in **superposition** — being 0 AND 1 simultaneously.

**Key Concepts:**

| Concept | Description |
|---------|-------------|
| Superposition | Qubits exist in multiple states at once |
| Entanglement | Correlated qubits affect each other instantly |
| Interference | Amplify correct answers, cancel wrong ones |

**Real-World Applications:**
- 🔐 Breaking current encryption (Shor's algorithm)
- 💊 Drug discovery & molecular simulation
- 📈 Financial modeling & optimization
- 🤖 Training better AI models

**The Quantum Advantage:**
A quantum computer with 300 perfect qubits could represent more states than there are atoms in the observable universe!

*Want to explore quantum algorithms or hardware?*`
  } else if (lowerInput.includes('image') || lowerInput.includes('photo') || lowerInput.includes('picture') || lowerInput.includes('analyze this')) {
    fallbackResponse = `## 🖼️ Image Analysis Ready!

I'm ready to analyze your images! Here's how to use this feature:

### How to Use Image Analysis:
1. **Click the 📎 Paperclip icon** in the chat input
2. **Select an image** from your device
3. **Ask your question** about the image
4. **Send** and I'll analyze it!

### What I Can Do With Images:
- 🔍 **Describe** what's in the image
- 📝 **Read text** from images (OCR)
- 💻 **Analyze code** screenshots
- 📊 **Interpret charts** and graphs
- 🎨 **Identify objects**, people, scenes
- 🐾 **Recognize animals** and nature
- 🏠 **Analyze buildings** and architecture

### Example Prompts:
- *"What's in this image?"*
- *"Read the text from this screenshot"*
- *"Explain this code snippet"*
- *"What type of chart is this?"*

**Attach an image and ask me anything about it!** 📸✨`
  }

  return NextResponse.json(
    { 
      response: fallbackResponse,
      note: 'Using fallback mode - Add OPENROUTER_API_KEY environment variable for real AI responses'
    },
    { status: 200 }
  )
}

// Document Analysis Fallback Response
function getDocumentAnalysisFallback(message: string, fileName: string, fileType: string | null): NextResponse {
  const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE'
  const fileTypeDisplay = fileType || 'Unknown type'
  
  // Determine file icon and color based on type
  const fileInfo = {
    pdf: { icon: '📕', color: 'red', type: 'PDF Document' },
    docx: { icon: '📘', color: 'blue', type: 'Word Document' },
    doc: { icon: '📘', color: 'blue', type: 'Word Document' },
    xlsx: { icon: '📗', color: 'green', type: 'Excel Spreadsheet' },
    xls: { icon: '📗', color: 'green', type: 'Excel Spreadsheet' },
    txt: { icon: '📝', color: 'yellow', type: 'Text File' },
    md: { icon: '📝', color: 'yellow', type: 'Markdown File' },
    json: { icon: '📋', color: 'purple', type: 'JSON Data' },
    csv: { icon: '📊', color: 'green', type: 'CSV Data' }
  }
  
  const fileData = fileInfo[fileExtension.toLowerCase() as keyof typeof fileInfo] || { 
    icon: '📎', 
    color: 'cyan', 
    type: `${fileTypeDisplay} File` 
  }

  const fallbackResponse = `## ${fileData.icon} Document Received: **${fileName}**

I can see you've shared a **${fileData.type}**! 🎉

### 📋 File Information:
| Property | Value |
|----------|-------|
| **Name** | ${fileName} |
| **Type** | ${fileTypeDisplay} |
| **Format** | ${fileExtension} |
| **Size** | See file details |

### 🔧 What I Can Do With This ${fileData.type}:

${fileExtension === 'pdf' ? `
- **Extract text content** from PDF pages
- **Summarize** document contents
- **Answer questions** about the PDF content
- **Analyze structure** (chapters, sections)
- **Convert to other formats** (summary)` : ''}

${['docx', 'doc'].includes(fileExtension) ? `
- **Read and analyze** Word document content
- **Summarize** key points
- **Review grammar** and style
- **Extract specific sections**
- **Suggest improvements**` : ''}

${['xlsx', 'xls', 'csv'].includes(fileExtension) ? `
- **Analyze data patterns**
- **Create visualizations** from data
- **Generate insights** and statistics
- **Find trends** and outliers
- **Export summaries**` : ''}

${['txt', 'md'].includes(fileExtension) ? `
- **Read and analyze** text content
- **Summarize** information
- **Extract key points**
- **Code review** (if code file)
- **Format conversion**` : ''}

${['json'].includes(fileExtension) ? `
- **Parse JSON structure**
- **Validate JSON format**
- **Explain data schema**
- **Query specific fields**
- **Convert to table format**` : ''}

### 💡 Tips for Best Results:
- Make sure the file is **not password protected**
- **Text-based files** work best for analysis
- For images in documents, describe what you're looking for
- Ask **specific questions** about the content

### 📝 Example Prompts You Can Try:
- *"Summarize this document"*
- *"What are the main points in this ${fileData.type}?"*
- *"Extract all the key data from this file"*
- *"Can you explain the content in simple terms?"*

> ⚠️ *Note: Full document processing requires API configuration. Currently showing template response.*

**What would you like me to do with this ${fileData.type}?** 🚀`

  return NextResponse.json(
    { 
      response: fallbackResponse,
      note: `Document analysis mode - File: ${fileName}`,
      fileName: fileName,
      fileType: fileType
    },
    { status: 200 }
  )
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send messages.' },
    { status: 405 }
  )
}
