'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Sparkles, Zap, Brain, Code2, MessageSquare, Terminal, 
  Cpu, Globe, Rocket, Star, Layers, Command, Shield,
  TrendingUp, Users, Eye, Heart, ArrowRight, Send,
  Copy, Check, RefreshCw, Maximize2, Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, NeonCard } from '@/components/ui/card'
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
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)'
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
            ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`
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
        gradient.addColorStop(0, `rgba(0, 255, 255, ${node.opacity})`)
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
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
      style={{ background: '#0a0a0f' }}
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
          <span className="absolute top-0 left-0.5 text-neon-purple opacity-80" aria-hidden="true">
            {text}
          </span>
          <span className="absolute top-0 -left-0.5 text-neon-cyan opacity-80" aria-hidden="true">
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

// Feature Card Component with NEXUS AI Theme
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <NeonCard 
      glowColor={index % 3 === 0 ? "cyan" : index % 3 === 1 ? "purple" : "blue"}
      className="group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <CardContent className="p-6 relative z-10">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 transform transition-transform duration-500 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          {feature.icon}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 font-display">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {feature.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-neon-cyan text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span>Explore</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </CardContent>
    </NeonCard>
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

  // Features data with NEXUS AI theme gradients
  const features: Feature[] = [
    {
      icon: <Brain className="w-7 h-7 text-white" />,
      title: 'Neural Processing',
      description: 'Advanced deep learning algorithms that understand context, nuance, and intent like never before.',
      gradient: 'from-neon-purple to-purple-600'
    },
    {
      icon: <Code2 className="w-7 h-7 text-white" />,
      title: 'Code Generation',
      description: 'Generate production-ready code in 50+ languages with intelligent auto-completion and optimization.',
      gradient: 'from-neon-cyan to-electric-blue'
    },
    {
      icon: <MessageSquare className="w-7 h-7 text-white" />,
      title: 'Natural Conversations',
      description: 'Human-like dialogue capabilities with emotional intelligence and contextual awareness.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: <Terminal className="w-7 h-7 text-white" />,
      title: 'Command Center',
      description: 'Powerful terminal interface for developers with real-time execution and debugging tools.',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Shield className="w-7 h-7 text-white" />,
      title: 'Quantum Security',
      description: 'Military-grade encryption with quantum-resistant protocols protecting your data.',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      icon: <Globe className="w-7 h-7 text-white" />,
      title: 'Global Network',
      description: 'Distributed computing across 200+ edge locations for lightning-fast responses worldwide.',
      gradient: 'from-indigo-500 to-violet-500'
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

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      handleSubmit()
    }
  }

  // Copy code handler
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Render markdown-like content
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let currentParagraph = ''
    let inCodeBlock = false
    let codeContent = ''
    let codeLanguage = ''

    const flushParagraph = () => {
      if (currentParagraph.trim()) {
        elements.push(
          <p key={`p-${elements.length}`} className="text-foreground/90 my-2 whitespace-pre-wrap">
            {formatInlineMarkdown(currentParagraph.trim())}
          </p>
        )
        currentParagraph = ''
      }
    }

    lines.forEach((line, lineIndex) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          flushParagraph()
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
          codeContent = ''
        } else {
          elements.push(
            <div key={`code-${elements.length}`} className="my-3 relative group">
              <div className="flex items-center justify-between bg-dark-surface px-4 py-2 rounded-t-lg border-b border-white/10">
                <span className="text-xs text-muted-foreground font-mono">{codeLanguage || 'code'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(codeContent)}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-neon-cyan"
                >
                  {copiedCode ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-deep-black p-4 rounded-b-lg overflow-x-auto border border-white/5">
                <code className="text-sm font-mono text-electric-blue whitespace-pre">{codeContent}</code>
              </pre>
            </div>
          )
          inCodeBlock = false
          codeContent = ''
          codeLanguage = ''
        }
        return
      }

      if (inCodeBlock) {
        codeContent += (codeContent ? '\n' : '') + line
        return
      }

      if (line.startsWith('## ')) {
        flushParagraph()
        elements.push(
          <h3 key={`h3-${lineIndex}`} className="text-lg font-bold text-white mt-4 mb-2 font-display">
            {formatInlineMarkdown(line.slice(3))}
          </h3>
        )
        return
      }

      if (line.startsWith('### ')) {
        flushParagraph()
        elements.push(
          <h4 key={`h4-${lineIndex}`} className="text-base font-semibold text-neon-cyan mt-3 mb-1">
            {formatInlineMarkdown(line.slice(4))}
          </h4>
        )
        return
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        flushParagraph()
        elements.push(
          <li key={`li-${lineIndex}`} className="ml-4 text-foreground/80 list-disc">
            {formatInlineMarkdown(line.slice(2))}
          </li>
        )
        return
      }

      if (line.startsWith('|')) {
        flushParagraph()
        elements.push(
          <div key={`table-${lineIndex}`} className="text-foreground/70 font-mono text-sm py-1">
            {line}
          </div>
        )
        return
      }

      if (line.trim()) {
        currentParagraph += (currentParagraph ? '\n' : '') + line
      } else {
        flushParagraph()
      }
    })

    flushParagraph()

    return elements.length > 0 ? elements : <p className="text-foreground/80">{content}</p>
  }

  // Format inline markdown (bold, italic)
  const formatInlineMarkdown = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-neon-cyan font-semibold">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div className="min-h-screen bg-deep-black text-white overflow-x-hidden relative">
      {/* Neural Network Background */}
      <NeuralNetworkBackground />
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none z-[1]" />

      {/* Navigation - NEXUS AI Styled */}
      <nav className="navbar-glass fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="relative logo-glow">
                <Sparkles className="w-7 h-7 text-neon-cyan" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-display tracking-wider gradient-text-nexus">NEXUS</span>
                <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase -mt-0.5">AI Platform</span>
              </div>
              <Badge variant="neonPurple" className="ml-2">
                v4.0
              </Badge>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {['Home', 'Features', 'Chat', 'Stats'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === item.toLowerCase() 
                      ? 'text-neon-cyan bg-neon-cyan/10 shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]' 
                      : 'text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/5'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <Button 
              variant="neon"
              size="sm"
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

      {/* Hero Section - NEXUS AI Styled */}
      <section id="home" className="hero-background relative min-h-screen flex items-center justify-center pt-20">
        {/* Radial glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[150px] animate-pulse-ring" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse-ring" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-neon-purple/20 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-neon-cyan/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-40 right-20 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }} />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
            <Badge variant="neonCyan">
              <Sparkles className="w-3 h-3" />
              Next-Generation AI Platform
            </Badge>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 font-display leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <GlitchText text="NEXUS" className="gradient-text-nexus text-glow-cyan" />
            <br />
            <span className="text-white">AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-foreground/60 mb-4 font-light max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            The Future Thinks.
            <span className="text-neon-cyan font-semibold"> Now.</span>
          </p>
          <p className="text-base text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.25s' }}>
            Experience intelligence redefined. Neural networks meet intuitive design in the most advanced AI platform ever created.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              variant="neon"
              size="xl"
              onClick={() => setActiveSection('chat')}
            >
              <Zap className="w-5 h-5 mr-2" />
              Try NEXUS AI Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="glass"
              size="xl"
              onClick={() => {
                setActiveSection('features');
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <Layers className="w-5 h-5 mr-2" />
              Explore Features
            </Button>
          </div>

          {/* Tech Stack Marquee */}
          <div className="relative overflow-hidden py-4 border-y border-white/10 glass-subtle animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex animate-marquee">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-8 px-4 shrink-0">
                  {['PyTorch', 'TensorFlow', 'GPT-4', 'Transformers', 'Neural Networks', 'NLP', 'Computer Vision', 'Reinforcement Learning', 'Diffusion Models', 'Multi-modal AI'].map((tech) => (
                    <span key={tech} className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-2">
                      <Star className="w-3 h-3 text-neon-cyan" />
                      {tech}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <div className="w-6 h-10 rounded-full border-2 border-neon-cyan/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-neon-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.6)]" />
          </div>
        </div>
      </section>

      {/* Features Section - NEXUS AI Styled */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="neonPurple" className="mb-4">
              <Layers className="w-3 h-3 mr-1" />
              Core Capabilities
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4">
              <span className="gradient-text-cyan">
                Powered by Innovation
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
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

      {/* AI Chat Section - NEXUS AI Styled */}
      <section id="chat" className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge variant="neonCyan" className="mb-4">
              <MessageSquare className="w-3 h-3 mr-1" />
              Interactive AI
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4">
              <span className="gradient-text-nexus">
                Experience NEXUS AI
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Interact with our advanced AI. Ask questions, generate code, explore ideas — no limits.
            </p>
          </div>

          {/* Chat Interface - NEXUS AI Styled */}
          <Card className="overflow-hidden border-neon-cyan/20 shadow-[0_0_40px_rgba(0,255,255,0.1)]">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 glass-strong">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="w-6 h-6 text-neon-cyan" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-deep-black animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white font-display">NEXUS AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Online • Ready to assist</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="cyberpunk">GPT-4</Badge>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-[450px] overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} chat-message-enter`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-purple-500 text-white flex items-center justify-center shadow-lg">
                      <BotIcon />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                      message.role === 'user'
                        ? 'message-user'
                        : 'message-ai'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="space-y-1">
                        {renderMessageContent(message.content)}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-neon-cyan/60' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-electric-blue text-deep-black flex items-center justify-center shadow-lg">
                      <UserIcon />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start gap-4 chat-message-enter">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-purple-500 text-white flex items-center justify-center shadow-lg">
                    <BotIcon />
                  </div>
                  <div className="message-ai rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-neon-purple rounded-full animate-typing" />
                        <div className="w-2 h-2 bg-neon-purple rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-neon-purple rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <span className="text-sm text-muted-foreground">NEXUS is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-white/10 glass-strong">
              <div className="flex gap-3">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask NEXUS AI anything..."
                  className="flex-1 min-h-[52px] max-h-[120px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  variant="neon"
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isLoading}
                  className="self-end"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section - NEXUS AI Styled */}
      <section id="stats" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-neon-purple/50 text-neon-purple mb-4">
              <TrendingUp className="w-3 h-3 mr-1" />
              By The Numbers
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold font-display">
              <span className="gradient-text-purple">
                Impact at Scale
              </span>
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <NeonCard 
                key={index} 
                glowColor={['cyan', 'purple', 'blue', 'cyan'][index] as "cyan" | "purple" | "blue"}
                className="text-center"
              >
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neon-cyan/10 mb-4 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold gradient-text-cyan font-display">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                </CardContent>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - NEXUS AI Styled */}
      <footer className="relative mt-auto border-t border-white/10 navbar-glass">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-neon-cyan logo-glow" />
                <span className="text-xl font-bold font-display gradient-text-nexus">NEXUS AI</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Pioneering the future of artificial intelligence. Building systems that understand, reason, and create at superhuman levels.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4 font-display">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button 
                  className="hover:text-neon-cyan transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveSection('features');
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >Features</button></li>
                <li><button 
                  className="hover:text-neon-cyan transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveSection('chat');
                    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >Try AI Chat</button></li>
                <li><button 
                  className="hover:text-neon-cyan transition-colors cursor-pointer"
                  onClick={() => window.open('https://github.com/atulchoudhary7781-dot/AI-web', '_blank')}
                >GitHub</button></li>
                <li><button 
                  className="hover:text-neon-cyan transition-colors cursor-pointer"
                  onClick={() => window.open('https://openrouter.ai/models', '_blank')}
                >AI Models</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 font-display">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button 
                  className="hover:text-neon-cyan transition-colors cursor-pointer"
                  onClick={() => window.open('https://openrouter.ai/docs', '_blank')}
                >OpenRouter Docs</button></li>
                <li><button 
                  className="hover:text-neon-cyan transition-colors cursor-pointer"
                  onClick={() => window.open('https://nextjs.org/docs', '_blank')}
                >Next.js Docs</button></li>
                <li><button 
                  className="hover:text-neon-cyan transition-colors cursor-pointer"
                  onClick={() => window.open('https://vercel.com/docs', '_blank')}
                >Vercel Docs</button></li>
                <li><button 
                  className="hover:text-neon-cyan transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveSection('stats');
                    document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >Statistics</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 NEXUS AI. Built for the future.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="neonCyan">
                <Shield className="w-3 h-3 mr-1" />
                SOC 2 Compliant
              </Badge>
              <Badge variant="neonPurple">
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

// Icon components for chat avatars
function BotIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
