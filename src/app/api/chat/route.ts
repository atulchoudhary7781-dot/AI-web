import { NextRequest, NextResponse } from 'next/server'
import { validateMessage, sanitizeString, checkForDangerousContent } from '@/lib/security'
import { extractFileContent } from '@/lib/extractFile'
import { creatorAnswer, isCreatorQuestion } from '@/lib/creator'
import { isWorkingModel, workingModelIds } from '@/lib/models'

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
    choices?: Array<{ message?: { content?: unknown; reasoning?: unknown } }>
  }
  const msg = rec?.choices?.[0]?.message
  const fromContent = normalizeAiContent(msg?.content)
  if (fromContent) return fromContent
  const reasoning = typeof msg?.reasoning === 'string' ? msg.reasoning.trim() : ''
  if (reasoning) return reasoning
  return ''
}

async function completeChat(params: {
  apiKey: string
  messages: Array<{ role: string; content: unknown }>
  models: string[]
  maxTokens?: number
}): Promise<string> {
  let lastError = ''
  for (const model of params.models) {
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
          max_tokens: params.maxTokens ?? 900,
        }),
      })
      const raw = await response.text()
      let data: unknown = null
      try { data = JSON.parse(raw) } catch { /* ignore */ }
      if (!response.ok) {
        lastError = raw.slice(0, 400)
        console.error('OpenRouter API Error:', model, response.status, lastError)
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
  throw new Error(lastError || 'All models failed')
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
      console.warn('⚠️ OpenRouter API key not configured. Using fallback responses.')
      
      // If image is attached, provide image analysis fallback
      if (imageData) {
        return getImageAnalysisFallback(message)
      }
      
      // If document is attached, provide document analysis fallback
      if (fileName) {
        return getDocumentAnalysisFallback(message, fileName, fileType)
      }
      
      return getFallbackResponse(message)
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
        return NextResponse.json({ response: aiResponse })
      } catch (error) {
        console.error('All vision models failed:', error)
        return getVisionFallbackResponse(message)
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
        return NextResponse.json({ response: responseCache.get(cacheKey) })
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

      return NextResponse.json({ response: aiResponse })
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
    
    // Try to return fallback, if that fails return error
    try {
      if (imageData) {
        return getImageAnalysisFallback(message)
      }
      if (extractedFileText) {
        return NextResponse.json({
          response: `I read **${fileName || 'your file'}**, but the AI model did not return an answer just now.\n\n**Extracted preview:**\n\n${extractedFileText.slice(0, 1800)}`,
        })
      }
      if (fileName) {
        return getDocumentAnalysisFallback(message, fileName, fileType)
      }
      return getFallbackResponse(message)
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return NextResponse.json(
        { 
          error: 'Error processing your request',
          details: errorMessage,
          debugInfo: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      )
    }
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
