'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { 
  Github, Linkedin, Mail, ExternalLink, ArrowRight, 
  Sparkles, Code2, Brain, Zap, Rocket, Star,
  Menu, X, Download, ChevronUp, Terminal
} from 'lucide-react'
import Link from 'next/link'

// ============ ANIMATED BACKGROUND COMPONENT ============
function ParticleField() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0 
          }}
          animate={{
            y: [null, -20, 20, -20],
            opacity: [0, 1, 0.5, 1, 0],
            scale: [0, 1, 1.5, 1, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}
    </div>
  )
}

// ============ MAGNETIC BUTTON COMPONENT ============
function MagneticButton({ children, href, className = "", variant = "primary" }: {
  children: React.ReactNode
  href?: string
  className?: string
  variant?: "primary" | "secondary" | "ghost"
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPosition({ x: x * 0.3, y: y * 0.3 })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  const baseClasses = variant === "primary" 
    ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
    : variant === "secondary"
    ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
    : "text-cyan-400 hover:text-cyan-300"

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer ${baseClasses} ${className}`}
    >
      {children}
    </motion.div>
  )

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>
  }
  return content
}

// ============ FLOATING ICON COMPONENT ============
function FloatingIcon({ Icon, delay = 0, x = 0, y = 0 }: {
  Icon: React.ElementType
  delay?: number
  x?: number
  y?: number
}) {
  return (
    <motion.div
      className="absolute text-cyan-500/10"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -30, 0],
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      <Icon size={60} />
    </motion.div>
  )
}

// ============ GLITCH TEXT EFFECT ============
function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      whileHover={{
        textShadow: [
          "2px 0 #ff00ff, -2px 0 #00ffff",
          "-2px 0 #ff00ff, 2px 0 #00ffff",
          "2px 0 #ff00ff, -2px 0 #00ffff",
          "0 0 transparent"
        ]
      }}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.span>
  )
}

// ============ TYPING EFFECT ============
function TypingEffect({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }
    }, 80)
    return () => clearTimeout(timeout)
  }, [currentIndex, text, delay])

  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-cyan-400"
      >
        |
      </motion.span>
    </span>
  )
}

// ============ SKILL BAR COMPONENT ============
function SkillBar({ skill, level, delay = 0 }: { skill: string; level: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="mb-4"
    >
      <div className="flex justify-between mb-2">
        <span className="text-gray-300 font-medium">{skill}</span>
        <span className="text-cyan-400">{level}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full"
        />
      </div>
    </motion.div>
  )
}

// ============ PROJECT CARD COMPONENT ============
function ProjectCard({ title, description, tech, github, live, index }: {
  title: string
  description: string
  tech: string[]
  github: string
  live?: string
  index: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <motion.div
        animate={{ 
          scale: isHovered ? 1.02 : 1,
          rotateY: isHovered ? 5 : 0
        }}
        transition={{ duration: 0.3 }}
        className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 overflow-hidden"
      >
        {/* Glow effect */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 blur-xl"
        />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
              <GlitchText text={title} />
            </h3>
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <ExternalLink className="w-5 h-5 text-cyan-400" />
            </motion.div>
          </div>
          
          <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
          
          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tech.map((t) => (
              <motion.span
                key={t}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm font-medium border border-cyan-500/20"
              >
                {t}
              </motion.span>
            ))}
          </div>
          
          {/* Links */}
          <div className="flex gap-4">
            <MagneticButton href={github} variant="ghost" className="text-sm !px-4 !py-2">
              <Github size={16} /> Code
            </MagneticButton>
            {live && (
              <MagneticButton href={live} variant="ghost" className="text-sm !px-4 !py-2">
                <ExternalLink size={16} /> Live
              </MagneticButton>
            )}
          </div>
        </div>
        
        {/* Animated border */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-violet-600"
          animate={{ width: isHovered ? "100%" : "0%" }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  )
}

// ============ TIMELINE ITEM COMPONENT ============
function TimelineItem({ title, subtitle, description, date, index }: {
  title: string
  subtitle: string
  description: string
  date: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 pb-12 last:pb-0"
    >
      {/* Timeline line */}
      <motion.div
        initial={{ height: 0 }}
        whileInView={{ height: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute left-[11px] top-3 w-0.5 bg-gradient-to-b from-cyan-500 to-violet-600"
      />
      
      {/* Dot */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center"
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </motion.div>
      
      {/* Content */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <span className="text-sm text-cyan-400">{date}</span>
        </div>
        <p className="text-cyan-300 font-medium mb-2">{subtitle}</p>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// ============ MAIN PORTFOLIO COMPONENT ============
export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -400])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  // Navigation items
  const navItems = [
    { id: "hero", label: "Home" },
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact" }
  ]

  // Projects data
  const projects = [
    {
      title: "NEXUS AI Chat",
      description: "Advanced AI chat interface with file attachment, vision capabilities, and real-time streaming responses. Features include multi-modal AI interactions, document analysis, and secure authentication.",
      tech: ["Next.js", "TypeScript", "OpenRouter API", "Tailwind CSS", "Framer Motion"],
      github: "https://github.com/atulchoudhary7781-dot/AI-web",
      live: "#"
    },
    {
      title: "Jarvis AI Agent",
      description: "Multimodal autonomous AI agent optimized for near-zero latency using Groq SDK. Features advanced RAG pipelines, multi-agent orchestration, and complex reasoning capabilities.",
      tech: ["Python", "LangChain", "Groq SDK", "RAG", "Multi-Agent Systems"],
      github: "https://github.com/atulchoudhary7781-dot/Jarvis-AI"
    },
    {
      title: "Portfolio Website",
      description: "World-class interactive portfolio with heavy animations, 3D effects, and modern design. Built with cutting-edge web technologies for optimal performance.",
      tech: ["Next.js", "React", "Three.js", "Framer Motion", "Tailwind CSS"],
      github: "https://github.com/atulchoudhary7781-dot/my-portfolio"
    }
  ]

  // Skills data
  const skills = [
    { name: "TypeScript / JavaScript", level: 95 },
    { name: "Next.js / React", level: 92 },
    { name: "Python & AI/ML", level: 88 },
    { name: "LangChain & RAG", level: 85 },
    { name: "Vertex AI & LLMs", level: 82 },
    { name: "Full-Stack Development", level: 90 }
  ]

  // Experience data
  const experiences = [
    {
      title: "AI Product Engineer",
      subtitle: "Jarvis AI (Independent Project)",
      description: "Developing Jarvis, a multimodal autonomous AI agent optimized for near-zero latency using Groq SDK. Implementing high-performance RAG pipelines and multi-agent orchestration for complex reasoning tasks.",
      date: "Feb 2026 - Present"
    },
    {
      title: "AI Operations Advanced Specialist",
      subtitle: "Invisible Technologies",
      description: "Collaborating with global teams on production-grade Generative AI solutions. Optimizing LLM deployment, engineering prompt datasets (Few-shot, Chain-of-Thought), and implementing semantic search with embeddings.",
      date: "Remote / Global"
    },
    {
      title: "AI & Machine Learning Intern",
      subtitle: "Venura Tech",
      description: "Refined and optimized large language models using PyTorch. Developed agentic workflows, multi-agent orchestration, and advanced RAG pipelines. Implemented REST APIs using FastAPI for enterprise clients.",
      date: "May 2026 - Jun 2026"
    }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#00000a] text-white overflow-x-hidden relative">
      {/* Animated Background */}
      <ParticleField />
      <FloatingIcon Icon={Code2} delay={0} x={10} y={20} />
      <FloatingIcon Icon={Brain} delay={1} x={85} y={15} />
      <FloatingIcon Icon={Zap} delay={2} x={75} y={70} />
      <FloatingIcon Icon={Rocket} delay={1.5} x={15} y={75} />

      {/* Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 z-50 origin-left"
      />

      {/* Navigation */}
      <motion.nav
        style={{ opacity }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-black/50 border-b border-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => scrollToSection("hero")}
            >
              {"<AC />"}
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.id ? "text-cyan-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              <MagneticButton href="/upload/Profile.pdf" variant="primary" className="!px-4 !py-2 text-sm">
                <Download size={16} /> Resume
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-4 border-t border-gray-800"
              >
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left py-3 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <a
                  href="/upload/Profile.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 pt-3 text-cyan-400"
                >
                  <Download size={16} /> Download Resume
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ============ HERO SECTION ============ */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative px-6">
        <motion.div
          style={{ y: y1 }}
          className="max-w-5xl mx-auto text-center z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Available for opportunities</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Hi, I&apos;m{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              <GlitchText text="Atul Choudhary" />
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-8 min-h-[2rem]"
          >
            <TypingEffect text="AI Product & Generative AI Engineer | Building the Future of Autonomous Intelligence" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Architecting low-latency RAG pipelines, autonomous multi-agent workflows, 
            and scalable AI solutions that bridge the gap between cutting-edge research 
            and real-world impact.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton href="#projects" variant="primary">
              View My Work <ArrowRight size={18} />
            </MagneticButton>
            <MagneticButton href="#contact" variant="secondary">
              Get In Touch <Mail size={18} />
            </MagneticButton>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex items-center justify-center gap-6 mt-16"
          >
            <MagneticButton href="https://github.com/atulchoudhary7781-dot" variant="ghost">
              <Github size={24} />
            </MagneticButton>
            <MagneticButton href="https://www.linkedin.com/in/atul-choudhary-018037301/" variant="ghost">
              <Linkedin size={24} />
            </MagneticButton>
            <MagneticButton href="mailto:atulchoudhary7781@gmail.com" variant="ghost">
              <Mail size={24} />
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-700 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ============ ABOUT SECTION ============ */}
      <section id="about" className="py-32 px-6 relative">
        <motion.div
          style={{ y: y2 }}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className="text-cyan-400">Me</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-violet-600 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <p className="text-gray-300 text-lg leading-relaxed">
                I&apos;m an <span className="text-cyan-400 font-semibold">AI Product & Generative AI Engineer</span> passionate about pushing the boundaries of artificial intelligence and creating scalable, production-ready solutions.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Currently working at <span className="text-white font-medium">Invisible Technologies</span> as an AI Operations Advanced Specialist, where I collaborate with global teams to deliver cutting-edge generative AI solutions.
              </p>
              <p className="text-gray-400 leading-relaxed">
                My expertise lies in architecting <span className="text-violet-400">low-latency RAG pipelines</span>, <span className="text-pink-400">multi-agent orchestration</span>, and building <span className="text-cyan-400">autonomous AI systems</span> like Jarvis that solve real-world operational challenges.
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                {["AI/ML", "RAG Pipelines", "LLMs", "Full-Stack", "Agentic AI"].map((tag) => (
                  <motion.span
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700 hover:border-cyan-500/50 transition-colors"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" /> Quick Facts
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: "Location", value: "Greater Delhi Area, India" },
                    { label: "Education", value: "Diploma in Software Engineering, IICS" },
                    { label: "Specialization", value: "Generative AI & Multi-Agent Systems" },
                    { label: "Certifications", value: "Vertex AI, Gen AI, Deloitte Analytics" }
                  ].map((fact, i) => (
                    <motion.div
                      key={fact.label}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex justify-between py-2 border-b border-gray-800 last:border-0"
                    >
                      <span className="text-gray-500">{fact.label}</span>
                      <span className="text-white font-medium text-right max-w-[60%]">{fact.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-2xl blur-xl -z-10" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============ PROJECTS SECTION ============ */}
      <section id="projects" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Featured <span className="text-cyan-400">Projects</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Here are some of my notable projects showcasing my expertise in AI, full-stack development, and innovative solutions.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-violet-600 mx-auto rounded-full mt-4" />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <ProjectCard key={project.title} {...project} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <MagneticButton href="https://github.com/atulchoudhary7781-dot?tab=repositories" variant="secondary">
              <Github size={18} /> View All Projects
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* ============ SKILLS SECTION ============ */}
      <section id="skills" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Technical <span className="text-cyan-400">Skills</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive toolkit built through hands-on experience in AI development, full-stack engineering, and system design.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-violet-600 mx-auto rounded-full mt-4" />
          </motion.div>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 md:p-12">
            {skills.map((skill, i) => (
              <SkillBar key={skill.name} {...skill} delay={i * 0.1} />
            ))}

            {/* Tech Stack Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 pt-8 border-t border-gray-800"
            >
              <h3 className="text-xl font-bold text-white mb-6 text-center">Tech Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "Python", "TypeScript", "Next.js", "React",
                  "LangChain", "Vertex AI", "FastAPI", "PostgreSQL",
                  "Docker", "Git", "Tailwind CSS", "Prisma"
                ].map((tech) => (
                  <motion.div
                    key={tech}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="flex items-center justify-center gap-2 p-3 bg-gray-800/50 rounded-xl text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/30"
                  >
                    <Terminal size={14} />
                    <span className="text-sm font-medium">{tech}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ EXPERIENCE SECTION ============ */}
      <section id="experience" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Experience & <span className="text-cyan-400">Journey</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              My professional journey building AI systems and contributing to impactful projects.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-violet-600 mx-auto rounded-full mt-4" />
          </motion.div>

          <div className="relative">
            {experiences.map((exp, i) => (
              <TimelineItem key={exp.title} {...exp} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTACT SECTION ============ */}
      <section id="contact" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Let&apos;s <span className="text-cyan-400">Connect</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              I&apos;m always open to discussing new opportunities, interesting projects, or just having a chat about AI and technology.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-violet-600 mx-auto rounded-full mt-4" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 md:p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center">
              <Mail className="w-12 h-12 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Build Something Amazing?
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Whether you have a project in mind, a job opportunity, or just want to connect, feel free to reach out!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <MagneticButton href="mailto:atulchoudhary7781@gmail.com" variant="primary">
                <Mail size={18} /> Send Email
              </MagneticButton>
              <MagneticButton href="https://www.linkedin.com/in/atul-choudhary-018037301/" variant="secondary">
                <Linkedin size={18} /> LinkedIn
              </MagneticButton>
              <MagneticButton href="/upload/Profile.pdf" variant="secondary">
                <Download size={18} /> Resume
              </MagneticButton>
            </div>

            <div className="pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm mb-4">Or reach out directly at:</p>
              <a
                href="mailto:atulchoudhary7781@gmail.com"
                className="text-cyan-400 hover:text-cyan-300 font-mono text-lg transition-colors"
              >
                atulchoudhary7781@gmail.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-8 px-6 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">
              © 2026 Atul Choudhary. Crafted with passion and lots of ☕
            </div>
            
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/atulchoudhary7781-dot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/atul-choudhary-018037301/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:atulchoudhary7781@gmail.com"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={() => scrollToSection("hero")}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        className="fixed bottom-8 right-8 z-40 p-4 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronUp size={20} />
      </motion.button>
    </div>
  )
}
