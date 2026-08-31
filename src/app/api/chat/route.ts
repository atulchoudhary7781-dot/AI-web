import { NextRequest, NextResponse } from 'next/server'
import { validateMessage, sanitizeString, checkForDangerousContent } from '@/lib/security'

// OpenRouter API Configuration - Using Environment Variables (SECURE!)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

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
  
  try {
    const body = await request.json()
    console.log('📝 Request body received:', { hasMessage: !!body.message })
    
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
    
    // Sanitize optional fields
    imageData = sanitizeString(body.imageData, { maxLength: 5000000 }) // 5MB base64 limit
    imageMimeType = sanitizeString(body.imageMimeType, { maxLength: 100 })
    fileName = sanitizeString(body.fileName, { maxLength: 255 })
    fileType = sanitizeString(body.fileType, { maxLength: 50 })

    // Additional security checks
    if (imageData && !['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(imageMimeType || '')) {
      return NextResponse.json(
        { error: 'Unsupported image format' },
        { status: 400 }
      )
    }
    
    if (fileName && checkForDangerousContent(fileName)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

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

**IMAGE ANALYSIS CAPABILITY:**
When an user provides an image, you MUST analyze it thoroughly:
- Describe what you see in detail
- Identify objects, text, people, scenes, colors, patterns
- Read and transcribe any text visible in the image
- Provide insights about the image content
- Answer specific questions about the image
- If it's a screenshot, code, document, or diagram - analyze its contents

When users ask:
- About AI/ML: Provide comprehensive explanations with current state-of-the-art info
- For code: Generate clean, well-commented code in the requested language
- General questions: Be thorough but concise
- Creative tasks: Show innovation and originality
- About images: Analyze and describe them in detail

Always respond in a way that showcases advanced intelligence while being accessible. Use formatting like bold text, lists, code blocks, and headers to make responses readable.`

    // Prepare messages array
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ]

    // If image is provided, create vision message with image
    if (imageData && imageMimeType) {
      // Use vision-capable model for image analysis
      const visionModel = process.env.OPENROUTER_VISION_MODEL || 'openai/gpt-4o-mini'
      
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

      // Call OpenRouter API with vision model
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXUS_APP_URL || 'https://nexus-ai.vercel.app',
          'X-Title': 'NEXUS AI'
        },
        body: JSON.stringify({
          model: visionModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.6
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenRouter Vision API Error:', errorData)
        // Fallback to regular response if vision fails
        return getVisionFallbackResponse(message)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || 
        "I apologize, but I'm having trouble analyzing the image right now. Please try again."

      return NextResponse.json({ response: aiResponse })
    } else {
      // Regular text-only message
      messages.push({
        role: 'user', 
        content: message
      })

      // Check cache first for text-only messages
      const cacheKey = message.toLowerCase().trim()
      if (responseCache.has(cacheKey)) {
        return NextResponse.json({ response: responseCache.get(cacheKey) })
      }

      // Call OpenRouter API with regular model
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXUS_APP_URL || 'https://nexus-ai.vercel.app',
          'X-Title': 'NEXUS AI'
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.6
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenRouter API Error:', errorData)
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || 
        "I apologize, but I'm having trouble processing your request right now. Please try again."

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
