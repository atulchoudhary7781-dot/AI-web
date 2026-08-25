import { NextRequest, NextResponse } from 'next/server'

// OpenRouter API Configuration - Using Environment Variables (SECURE!)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// AI Response cache for common questions
const responseCache = new Map<string, string>()

export async function POST(request: NextRequest) {
  let message = ''
  
  try {
    const body = await request.json()
    message = body.message || ''

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

    // Check if API key is configured
    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not configured. Using fallback responses.')
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

When users ask:
- About AI/ML: Provide comprehensive explanations with current state-of-the-art info
- For code: Generate clean, well-commented code in the requested language
- General questions: Be thorough but concise
- Creative tasks: Show innovation and originality

Always respond in a way that showcases advanced intelligence while being accessible. Use formatting like bold text, lists, code blocks, and headers to make responses readable.`

    // Call OpenRouter API
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

  } catch (error) {
    console.error('Chat API Error:', error)
    
    // Return fallback response on error
    return getFallbackResponse(message)
  }
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

**Try asking me:**
- *"Explain how transformers work"*
- *"Write a React component for a dashboard"*
- *"What are the latest advances in AI?"*

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
  }

  return NextResponse.json(
    { 
      response: fallbackResponse,
      note: 'Using fallback mode - Add OPENROUTER_API_KEY environment variable for real AI responses'
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
