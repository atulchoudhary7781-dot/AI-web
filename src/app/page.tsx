'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Sparkles, Zap, Brain, Code2, MessageSquare, Terminal, 
  Cpu, Globe, Rocket, Star, Layers, Command, Shield,
  TrendingUp, Users, Eye, Heart, ArrowRight, Send,
  Copy, Check, RefreshCw, Maximize2, Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

// Types
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

interface Stat {
  label: string
  value: number
  suffix: string
  icon: React.ReactNode
}

// Neural Network Background Component
function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let mouseX = 0
    let mouseY = 0

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Nodes for neural network
    interface Node {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
    }

    const nodes: Node[] = []
    const nodeCount = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000))

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      })
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 10, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Mouse attraction
        const dx = mouseX - node.x
        const dy = mouseY - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < 200) {
          node.vx += dx * 0.00005
          node.vy += dy * 0.00005
        }

        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        // Draw connections
        nodes.slice(i + 1).forEach(otherNode => {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          )
          
          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.3
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 245, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.stroke()
          }
        })

        // Draw node
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 2
        )
        gradient.addColorStop(0, `rgba(0, 245, 255, ${node.opacity})`)
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0)')
        ctx.fillStyle = gradient
        ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#00000a' }}
    />
  )
}

// Glitch Text Component
function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [glitchActive, setGlitchActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={`relative inline-block ${className}`}>
      <span className={`relative z-10 ${glitchActive ? 'animate-pulse' : ''}`}>
        {text}
      </span>
      {glitchActive && (
        <>
          <span className="absolute top-0 left-0.5 text-[#ff00aa] opacity-80 clip-text-glitch-1" aria-hidden="true">
            {text}
          </span>
          <span className="absolute top-0 -left-0.5 text-[#00f5ff] opacity-80 clip-text-glitch-2" aria-hidden="true">
            {text}
          </span>
        </>
      )}
    </span>
  )
}

// Animated Counter Component
function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return
    
    let start = 0
    const increment = target / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isVisible, target, duration])

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>
}

// Feature Card Component
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card 
      className="group relative bg-black/40 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-500 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-10px) rotateX(5deg)' : 'translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,245,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative z-10">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 transform transition-transform duration-500 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          {feature.icon}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
          {feature.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {feature.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span>Explore</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  )
}

// Main App Component
export default function Home() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Welcome to **NEXUS AI** — The Future of Intelligence!\n\nI\'m your advanced AI assistant. Ask me anything about:\n• 🤖 Artificial Intelligence & Machine Learning\n• 💻 Programming & Code\n• 🔬 Science & Technology\n• 🚀 Innovation & Future Trends\n\n*How can I help you today?*',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  // Features data
  const features: Feature[] = [
    {
      icon: <Brain className="w-7 h-7 text-white" />,
      title: 'Neural Processing',
      description: 'Advanced deep learning algorithms that understand context, nuance, and intent like never before.',
      gradient: 'from-violet-600 to-purple-600'
    },
    {
      icon: <Code2 className="w-7 h-7 text-white" />,
      title: 'Code Generation',
      description: 'Generate production-ready code in 50+ languages with intelligent auto-completion and optimization.',
      gradient: 'from-cyan-600 to-blue-600'
    },
    {
      icon: <MessageSquare className="w-7 h-7 text-white" />,
      title: 'Natural Conversations',
      description: 'Human-like dialogue capabilities with emotional intelligence and contextual awareness.',
      gradient: 'from-pink-600 to-rose-600'
    },
    {
      icon: <Terminal className="w-7 h-7 text-white" />,
      title: 'Command Center',
      description: 'Powerful terminal interface for developers with real-time execution and debugging tools.',
      gradient: 'from-amber-600 to-orange-600'
    },
    {
      icon: <Shield className="w-7 h-7 text-white" />,
      title: 'Quantum Security',
      description: 'Military-grade encryption with quantum-resistant protocols protecting your data.',
      gradient: 'from-emerald-600 to-green-600'
    },
    {
      icon: <Globe className="w-7 h-7 text-white" />,
      title: 'Global Network',
      description: 'Distributed computing across 200+ edge locations for lightning-fast responses worldwide.',
      gradient: 'from-indigo-600 to-violet-600'
    }
  ]

  // Stats data
  const stats: Stat[] = [
    { label: 'API Calls/Day', value: 50, suffix: 'M+', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Active Users', value: 10, suffix: 'M+', icon: <Users className="w-5 h-5" /> },
    { label: 'Uptime', value: 99.9, suffix: '%', icon: <Shield className="w-5 h-5" /> },
    { label: 'Response Time', value: 50, suffix: 'ms', icon: <Zap className="w-5 h-5" /> }
  ]

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Handle chat submission
  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      
      // Fallback responses based on keywords
      let fallbackResponse = "I'm NEXUS AI, your advanced intelligence system. I can help you explore the frontiers of technology, generate code, analyze complex problems, and much more. What would you like to discover?"
      
      const lowerInput = inputValue.toLowerCase()
      if (lowerInput.includes('ai') || lowerInput.includes('artificial intelligence')) {
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

**The NEXUS Advantage:**
Our neural architecture processes information through 175B+ parameters, enabling nuanced understanding that bridges the gap between artificial and natural intelligence.

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
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
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
      }

      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading])

  // Handle key press - FIXED: Enter now sends message instead of scrolling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If user presses Enter WITHOUT Shift, send the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // Prevent new line / scroll
      e.stopPropagation() // Stop event bubbling
      handleSubmit()
    }
    // If Shift+Enter, allow new line (default behavior)
  }

  // Copy code handler
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Render markdown-like content
  const renderMessageContent = (content: string) => {
    // Simple line-by-line parsing approach
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let currentParagraph = ''
    let inCodeBlock = false
    let codeContent = ''
    let codeLanguage = ''

    const flushParagraph = () => {
      if (currentParagraph.trim()) {
        elements.push(
          <p key={`p-${elements.length}`} className="text-gray-300 my-2 whitespace-pre-wrap">
            {formatInlineMarkdown(currentParagraph.trim())}
          </p>
        )
        currentParagraph = ''
      }
    }

    lines.forEach((line, lineIndex) => {
      // Check for code block start/end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          flushParagraph()
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
          codeContent = ''
        } else {
          // End of code block
          elements.push(
            <div key={`code-${elements.length}`} className="my-3 relative group">
              <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono">{codeLanguage || 'code'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(codeContent)}
                  className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                >
                  {copiedCode ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-gray-900 p-4 rounded-b-lg overflow-x-auto">
                <code className="text-sm font-mono text-green-400 whitespace-pre">{codeContent}</code>
              </pre>
            </div>
          )
          inCodeBlock = false
          codeContent = ''
          codeLanguage = ''
        }
        return
      }

      // If inside code block, accumulate code
      if (inCodeBlock) {
        codeContent += (codeContent ? '\n' : '') + line
        return
      }

      // Handle headings
      if (line.startsWith('## ')) {
        flushParagraph()
        elements.push(
          <h3 key={`h3-${lineIndex}`} className="text-lg font-bold text-white mt-4 mb-2">
            {formatInlineMarkdown(line.slice(3))}
          </h3>
        )
        return
      }

      if (line.startsWith('### ')) {
        flushParagraph()
        elements.push(
          <h4 key={`h4-${lineIndex}`} className="text-base font-semibold text-cyan-300 mt-3 mb-1">
            {formatInlineMarkdown(line.slice(4))}
          </h4>
        )
        return
      }

      // Handle list items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        flushParagraph()
        elements.push(
          <li key={`li-${lineIndex}`} className="ml-4 text-gray-300 list-disc">
            {formatInlineMarkdown(line.slice(2))}
          </li>
        )
        return
      }

      // Handle table rows
      if (line.startsWith('|')) {
        flushParagraph()
        elements.push(
          <div key={`table-${lineIndex}`} className="text-gray-300 font-mono text-sm py-1">
            {line}
          </div>
        )
        return
      }

      // Regular paragraph content
      if (line.trim()) {
        currentParagraph += (currentParagraph ? '\n' : '') + line
      } else {
        flushParagraph()
      }
    })

    // Flush any remaining paragraph
    flushParagraph()

    return elements.length > 0 ? elements : <p className="text-gray-300">{content}</p>
  }

  // Format inline markdown (bold, italic)
  const formatInlineMarkdown = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-cyan-400 font-semibold">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div className="min-h-screen bg-[#00000a] text-white overflow-x-hidden relative">
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@300;400;700&display=swap');
        
        :root {
          --cyan: #00f5ff;
          --pink: #ff00aa;
          --gold: #ffd700;
          --violet: #7c3aed;
        }
        
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Scanline effect */
        .scanlines::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          z-index: 9999;
          opacity: 0.3;
        }
        
        /* Glow effects */
        .glow-cyan {
          box-shadow: 0 0 20px rgba(0, 245, 255, 0.5),
                      0 0 40px rgba(0, 245, 255, 0.3),
                      0 0 60px rgba(0, 245, 255, 0.1);
        }
        
        .glow-text {
          text-shadow: 0 0 10px rgba(0, 245, 255, 0.8),
                       0 0 20px rgba(0, 245, 255, 0.5),
                       0 0 30px rgba(0, 245, 255, 0.3);
        }
        
        /* Glitch effect */
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        .clip-text-glitch-1 {
          animation: glitch 0.3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }
        
        .clip-text-glitch-2 {
          animation: glitch 0.3s infinite reverse;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
        }
        
        /* Marquee animation */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        /* Pulse ring animation */
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        
        /* Float animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: var(--cyan); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--pink); }
      `}</style>

      {/* Neural Network Background */}
      <NeuralNetworkBackground />
      
      {/* Scanline Overlay */}
      <div className="scanlines fixed inset-0 pointer-events-none z-50" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-[family-name:var(--font-orbitron)] glow-text">NEXUS AI</span>
              <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                v4.0
              </Badge>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['Home', 'Features', 'Chat', 'Stats'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item.toLowerCase())}
                  className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                    activeSection === item.toLowerCase() ? 'text-cyan-400' : 'text-gray-400'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <Button 
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white border-0 glow-cyan"
              onClick={() => {
                setActiveSection('chat');
                setTimeout(() => {
                  document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Launch App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-violet-500/20 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-40 right-20 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }} />



          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-8">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">Next-Generation AI Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 font-[family-name:var(--font-orbitron)] leading-tight">
            <GlitchText text="NEXUS" className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 glow-text" />
            <br />
            <span className="text-white">AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-400 mb-4 font-light max-w-3xl mx-auto">
            The Future Thinks.
            <span className="text-cyan-400 font-semibold"> Now.</span>
          </p>
          <p className="text-base text-gray-500 mb-12 max-w-2xl mx-auto">
            Experience intelligence redefined. Neural networks meet intuitive design in the most advanced AI platform ever created.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg"
              onClick={() => setActiveSection('chat')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-6 text-lg glow-cyan h-auto"
            >
              <Zap className="w-5 h-5 mr-2" />
              Try NEXUS AI Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg h-auto"
              onClick={() => {
                setActiveSection('features');
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <Command className="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </div>

          {/* Tech Stack Marquee */}
          <div className="relative overflow-hidden py-4 border-y border-cyan-500/20 bg-black/30 backdrop-blur-sm">
            <div className="flex animate-marquee">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-8 px-4 shrink-0">
                  {['PyTorch', 'TensorFlow', 'GPT-4', 'Transformers', 'Neural Networks', 'NLP', 'Computer Vision', 'Reinforcement Learning', 'Diffusion Models', 'Multi-modal AI'].map((tech) => (
                    <span key={tech} className="text-sm text-gray-500 whitespace-nowrap flex items-center gap-2">
                      <Star className="w-3 h-3 text-cyan-500" />
                      {tech}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-cyan-500/50 flex justify-center pt-2">
            <div className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-4">
              <Layers className="w-3 h-3 mr-1" />
              Core Capabilities
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-orbitron)] mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                Powered by Innovation
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Six pillars of next-generation artificial intelligence, working in harmony to deliver unprecedented capabilities.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Section */}
      <section id="chat" className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 mb-4">
              <MessageSquare className="w-3 h-3 mr-1" />
              Interactive AI
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-orbitron)] mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                Experience NEXUS AI
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Interact with our advanced AI. Ask questions, generate code, explore ideas — no limits.
            </p>
          </div>

          {/* Chat Interface */}
          <Card className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-violet-500/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="w-6 h-6 text-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">NEXUS AI Assistant</h3>
                  <p className="text-xs text-gray-400">Online • Ready to assist</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  GPT-4 Turbo
                </Badge>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-[450px] overflow-y-auto p-6 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                        : 'bg-gray-900/80 border border-gray-800 text-gray-200'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="space-y-1">
                        {renderMessageContent(message.content)}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-cyan-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
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

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-cyan-500/20 bg-black/40">
              <div className="flex gap-3">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask NEXUS AI anything..."
                  className="flex-1 min-h-[50px] max-h-[120px] resize-none bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-6 self-end glow-cyan"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-pink-500/50 text-pink-400 mb-4">
              <TrendingUp className="w-3 h-3 mr-1" />
              By The Numbers
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-orbitron)]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-gold-400">
                Impact at Scale
              </span>
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-black/40 backdrop-blur-xl border border-gray-800 hover:border-cyan-500/30 transition-all group">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 mb-4 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-[family-name:var(--font-orbitron)]">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-auto border-t border-cyan-500/20 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl font-bold font-[family-name:var(--font-orbitron)]">NEXUS AI</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                Pioneering the future of artificial intelligence. Building systems that understand, reason, and create at superhuman levels.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveSection('features');
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >Documentation</button></li>
                <li><button 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  onClick={() => {
                    alert('📚 API Reference\n\nNEXUS AI API Documentation:\n\nEndpoint: /api/chat\nMethod: POST\nHeaders: Content-Type: application/json\nBody: { "message": "your question" }\n\nResponse: { "response": "AI answer" }');
                  }}
                >API Reference</button></li>
                <li><button 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  onClick={() => {
                    alert('💰 Pricing Plans\n\n✨ FREE - $0/month\n  • 100 messages/day\n  • Basic features\n  • Community support\n\n⚡ PRO - $9/month\n  • Unlimited messages\n  • Advanced AI models\n  • Priority support\n  • Custom integrations\n\n🚀 ENTERPRISE - Custom\n  • Everything in Pro\n  • Dedicated infrastructure\n  • SLA guarantee\n  • 24/7 support');
                  }}
                >Pricing</button></li>
                <li><button 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  onClick={() => window.open('https://status.vercel.com', '_blank')}
                >Status</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  onClick={() => {
                    alert('🚀 About NEXUS AI\n\nNEXUS AI is a next-generation artificial intelligence platform built with cutting-edge technology.\n\n• Advanced Neural Networks\n• Real-time AI Processing\n• Cyberpunk Design\n• Enterprise Security\n\nVersion: 4.0\nBuilt with: Next.js 16, React 19, TypeScript');
                  }}
                >About</button></li>
                <li><button 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  onClick={() => {
                    alert('📝 Blog - Coming Soon!\n\nStay tuned for:\n• AI/ML Tutorials\n• Tech Insights\n• Product Updates\n• Case Studies\n\nSubscribe to our newsletter for updates!');
                  }}
                >Blog</button></li>
                <li><button 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  onClick={() => {
                    alert('💼 Careers at NEXUS AI\n\nWe\'re always looking for talented people!\n\nOpen Positions:\n• Frontend Developer (React/Next.js)\n• AI/ML Engineer\n• UI/UX Designer\n• DevOps Engineer\n\nSend your resume to: careers@nexusai.com');
                  }}
                >Careers</button></li>
                <li><button 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  onClick={() => {
                    alert('📧 Contact Us\n\nEmail: hello@nexusai.com\nTwitter: @nexus_ai\nGitHub: github.com/nexus-ai\nDiscord: discord.gg/nexusai\n\nWe typically respond within 24 hours! 🎉');
                  }}
                >Contact</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 NEXUS AI. Built for the future.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                SOC 2 Compliant
              </Badge>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Made with Intelligence
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
