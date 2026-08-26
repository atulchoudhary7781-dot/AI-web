'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Sparkles, Zap, Brain, Code2, MessageSquare, Terminal, 
  Cpu, Globe, Rocket, Star, Layers, Command, Shield,
  TrendingUp, Users, Eye, Heart, ArrowRight, Send,
  Menu, X, ChevronLeft, Plus, LogIn, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Import chat components
import Sidebar from '@/components/chat/Sidebar'
import FullScreenChat from '@/components/chat/FullScreenChat'
import SettingsView from '@/components/chat/SettingsView'
import LoginView from '@/components/chat/LoginView'
import AuthModal from '@/components/chat/AuthModal'

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

interface ChatSession {
  id: string
  title: string
  date: Date
  messages: ChatMessage[]
}

interface User {
  name: string
  email: string
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
export default function NexusAI() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<string>('chat') // Start with chat (free mode)
  
  // Chat Limit State
  const [chatCount, setChatCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const MAX_FREE_CHATS = 6 // Max chats without login
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [fileBase64, setFileBase64] = useState<string | null>(null)
  
  // AbortController for stopping responses
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setIsLoggedIn(true)
        setUser(parsedUser)
        
        // Load sessions only if logged in
        const savedSessions = localStorage.getItem('nexus_sessions')
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions))
        }
      } catch (e) {
        console.error('Error parsing saved user:', e)
      }
    }
    
    // Load chat count for guests
    const savedChatCount = localStorage.getItem('nexus_chat_count')
    if (savedChatCount) {
      setChatCount(parseInt(savedChatCount, 10))
    }
  }, [])

  // Save sessions to localStorage when they change (only if logged in)
  useEffect(() => {
    if (isLoggedIn && sessions.length > 0) {
      localStorage.setItem('nexus_sessions', JSON.stringify(sessions))
    }
  }, [sessions, isLoggedIn])

  // Login Handler
  const handleLogin = (userData: User) => {
    setIsLoggedIn(true)
    setUser(userData)
    setCurrentView('chat') // Redirect to chat after login
    setShowAuthModal(false) // Close modal if open
    setChatCount(0) // Reset chat count for logged in users
    localStorage.removeItem('nexus_chat_count')
  }

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setSessions([])
    setActiveSessionId(null)
    setChatCount(0) // Reset chat count on logout
    localStorage.removeItem('nexus_user')
    localStorage.removeItem('nexus_sessions')
    localStorage.removeItem('nexus_chat_count')
  }

  // Get current session messages
  const getCurrentMessages = (): ChatMessage[] => {
    if (activeSessionId) {
      const session = sessions.find(s => s.id === activeSessionId)
      return session?.messages || getDefaultMessages()
    }
    return getDefaultMessages()
  }

  const getDefaultMessages = (): ChatMessage[] => [
    {
      id: '1',
      role: 'assistant',
      content: '👋 Welcome to **NEXUS AI** — The Future of Intelligence!\n\nI\'m your advanced AI assistant powered by Llama 3.1. Ask me anything about:\n• 🤖 Artificial Intelligence & Machine Learning\n• 💻 Programming & Code\n• 🔬 Science & Technology\n• 🚀 Innovation & Future Trends\n\n*How can I help you today?*',
      timestamp: new Date()
    }
  ]

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

  // Create new chat session
  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      date: new Date(),
      messages: getDefaultMessages()
    }
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setCurrentView('chat')
    setInputValue('')
  }, [])

  // Select session
  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id)
    setCurrentView('chat')
  }, [])

  // Delete session
  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
    }
  }, [activeSessionId])

  // Update session title based on first message
  const updateSessionTitle = useCallback((sessionId: string, firstMessage: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '') }
        : s
    ))
  }, [])

  // Handle stop generating response
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  // Handle chat submission
  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return

    // Check if guest has reached chat limit
    if (!isLoggedIn && chatCount >= MAX_FREE_CHATS) {
      setShowAuthModal(true)
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    // If no active session, create one
    let sessionId = activeSessionId
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: inputValue.slice(0, 30),
        date: new Date(),
        messages: [...getDefaultMessages(), userMessage]
      }
      setSessions(prev => [newSession, ...prev])
      sessionId = newSession.id
      setActiveSessionId(sessionId)
    } else {
      // Update existing session
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: [...s.messages, userMessage] }
          : s
      ))
      // Update title if it's "New Chat"
      const session = sessions.find(s => s.id === sessionId)
      if (session?.title === 'New Chat') {
        updateSessionTitle(sessionId, inputValue)
      }
    }

    setInputValue('')
    setIsLoading(true)

    // Create new AbortController for this request
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // Prepare request body with optional image data
      const requestBody: any = { message: inputValue }
      
      // Add image data if attached
      if (attachedFile && fileBase64 && attachedFile.type.startsWith('image/')) {
        requestBody.imageData = fileBase64
        requestBody.imageMimeType = attachedFile.type
      }
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date()
      }

      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: [...s.messages, assistantMessage] }
          : s
      ))
      
      // Clear attached file after sending
      setAttachedFile(null)
      setFileBase64(null)
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

      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: [...s.messages, fallbackMessage] }
          : s
      ))
    } finally {
      setIsLoading(false)
      
      // Increment chat count for guests
      if (!isLoggedIn) {
        const newCount = chatCount + 1
        setChatCount(newCount)
        localStorage.setItem('nexus_chat_count', newCount.toString())
        
        // Show modal if limit reached after this message
        if (newCount >= MAX_FREE_CHATS) {
          setTimeout(() => setShowAuthModal(true), 500)
        }
      }
    }
  }, [inputValue, isLoading, activeSessionId, sessions, updateSessionTitle, isLoggedIn, chatCount, MAX_FREE_CHATS, attachedFile, fileBase64])

  // Copy code handler
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // File attachment handler
  const handleFileAttach = (file: File) => {
    setAttachedFile(file)
    setInputValue('')
    
    // Convert image to base64 for API
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        // Get base64 string (remove data:image/xxx;base64, prefix)
        const base64 = (reader.result as string).split(',')[1]
        setFileBase64(base64)
      }
      reader.readAsDataURL(file)
    } else {
      setFileBase64(null)
    }
    
    console.log('File attached:', file)
  }

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <FullScreenChat
            messages={getCurrentMessages()}
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onStop={handleStop}
            copiedCode={copiedCode}
            onCopy={copyToClipboard}
            onFileAttach={handleFileAttach}
          />
        )
      
      case 'settings':
        return <SettingsView isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

      case 'login':
        return (
          <LoginView 
            onLogin={handleLogin}
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            user={user}
          />
        )

      case 'home':
        return (
          <>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4">
              <div className="max-w-5xl mx-auto text-center">
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 mb-6">
                  <Rocket className="w-3 h-3 mr-1" />
                  Next Generation AI Platform
                </Badge>
                
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 font-[family-name:var(--font-orbitron)]">
                  <GlitchText text="NEXUS" className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400" />
                  <br />
                  <span className="text-3xl sm:text-4xl md:text-5xl text-white mt-4 block">AI</span>
                </h1>
                
                <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Experience the future of artificial intelligence. NEXUS AI combines cutting-edge neural networks 
                  with intuitive design to deliver superhuman capabilities at your fingertips.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button 
                    size="lg"
                    onClick={() => setCurrentView('chat')}
                    className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-8 py-6 text-lg glow-cyan"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Try AI Chat Now
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => setCurrentView('features')}
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Explore Features
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    Enterprise Ready
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Lightning Fast
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Free to Use
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-24 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-4">
                    <Layers className="w-3 h-3 mr-1" />
                    Capabilities
                  </Badge>
                  <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-orbitron)]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                      Powerful Features
                    </span>
                  </h2>
                  <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                    Built with cutting-edge technology to deliver unparalleled performance and intelligence.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <FeatureCard key={index} feature={feature} index={index} />
                  ))}
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="relative py-24 px-4">
              <div className="max-w-6xl mx-auto">
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

            {/* CTA Section */}
            <section className="relative py-24 px-4">
              <div className="max-w-4xl mx-auto text-center">
                <Card className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 backdrop-blur-xl">
                  <CardContent className="p-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">
                      Ready to Experience the Future?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                      Join millions of users already leveraging NEXUS AI to transform their workflow and unlock new possibilities.
                    </p>
                    <Button 
                      size="lg"
                      onClick={() => setCurrentView('chat')}
                      className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-8 glow-cyan"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Start Chatting Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )

      case 'features':
        return (
          <div className="h-full overflow-y-auto overflow-x-hidden px-4 py-12 custom-scrollbar">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-4">
                  <Layers className="w-3 h-3 mr-1" />
                  Capabilities
                </Badge>
                <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-orbitron)]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                    Powerful Features
                  </span>
                </h2>
                <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                  Built with cutting-edge technology to deliver unparalleled performance and intelligence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>

              <div className="mt-12 text-center">
                <Button 
                  onClick={() => setCurrentView('chat')}
                  className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white glow-cyan"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Try AI Chat
                </Button>
              </div>
            </div>
          </div>
        )

      case 'stats':
        return (
          <div className="min-h-screen px-4 py-12">
            <div className="max-w-6xl mx-auto">
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
          </div>
        )

      default:
        return (
          <FullScreenChat
            messages={getCurrentMessages()}
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onStop={handleStop}
            copiedCode={copiedCode}
            onCopy={copyToClipboard}
            onFileAttach={handleFileAttach}
          />
        )
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#00000a]' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Background Animation - Only on home view */}
      {currentView === 'home' && <NeuralNetworkBackground />}

      {/* Menu Toggle Button - Always visible */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 left-4 z-30 p-3 backdrop-blur-xl border rounded-xl transition-all duration-300 hover:scale-105 ${
          sidebarOpen 
            ? 'bg-red-500/20 border-red-500/50 rotate-90' 
            : 'bg-gray-900/80 border-gray-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10'
        }`}
        title={sidebarOpen ? 'Close sidebar (ESC)' : 'Open sidebar'}
      >
        {sidebarOpen ? (
          <X className="w-5 h-5 text-red-400" />
        ) : (
          <Menu className="w-5 h-5 text-cyan-400" />
        )}
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onViewChange={setCurrentView}
        currentView={currentView}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => setCurrentView('login')}
        onSignupClick={() => setCurrentView('login')}
        onLogoutClick={handleLogout}
        chatCount={chatCount}
        maxChats={MAX_FREE_CHATS}
      />

      {/* Main Content - FULL SCREEN */}
      <main className="min-h-screen w-full">
        {/* Top Bar - Only show when not on home */}
        {currentView !== 'home' && (
          <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3 pl-16">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-white hidden sm:block">
                  {currentView === 'chat' ? 'AI Chat' : 
                   currentView === 'settings' ? 'Settings' :
                   currentView === 'features' ? 'Features' :
                   currentView === 'stats' ? 'Statistics' : 'NEXUS AI'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNewChat}
                      className="text-gray-400 hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">New Chat</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Chat Count Badge for Guests */}
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      chatCount >= MAX_FREE_CHATS 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {chatCount}/{MAX_FREE_CHATS} chats
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentView('login')}
                      className="text-gray-400 hover:text-white"
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Login
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setCurrentView('login')}
                      className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white shadow-lg shadow-violet-500/25"
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Content Area - Full height, no scroll */}
        <div className="h-[calc(100vh-57px)] overflow-hidden">
          {renderCurrentView()}
        </div>
      </main>

      {/* Auth Modal - Shows when free chat limit reached */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onSignup={handleLogin}
        chatCount={chatCount}
        maxChats={MAX_FREE_CHATS}
      />
    </div>
  )
}
