'use client'

import React, { useEffect, useRef, useState } from 'react'
import { 
  ArrowRight, Sparkles, Zap, Brain, Shield, 
  Globe, Rocket, Star, Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Floating particles component
function Particles({ count = 30 }: { count?: number }) {
  const [particles, setParticles] = useState<Array<{
    id: number
    left: string
    delay: string
    duration: string
    size: string
  }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${15 + Math.random() * 20}s`,
      size: `${2 + Math.random() * 3}px`,
    }))
    setParticles(newParticles)
  }, [count])

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  )
}

// Stats counter animation
function AnimatedCounter({ 
  target, 
  suffix = '', 
  duration = 2000 
}: { 
  target: number
  suffix?: string
  duration?: number 
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

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

  return <span ref={ref}>{count}{suffix}</span>
}

// Feature highlights
const features = [
  { icon: Brain, label: 'Neural Processing', color: 'text-neon-orange' },
  { icon: Zap, label: 'Lightning Fast', color: 'text-neon-amber' },
  { icon: Shield, label: 'Secure by Design', color: 'text-orange-400' },
]

export function Hero() {
  return (
    <section className="hero-background relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <Particles count={35} />
      
      {/* Radial glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neon-orange/10 rounded-full blur-[150px] animate-pulse-ring" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-amber/10 rounded-full blur-[120px] animate-pulse-ring" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Badge variant="neonOrange" className="animate-pulse">
            <Sparkles className="w-3 h-3" />
            Next Generation AI
          </Badge>
        </div>

        {/* Main heading */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-display tracking-tight mb-6 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <span className="block text-foreground">The Future of</span>
          <span className="gradient-text-nexus text-glow-orange">
            Artificial Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          Experience the next evolution of AI interaction. NEXUS AI combines cutting-edge neural networks 
          with intuitive design to deliver superhuman intelligence at your fingertips.
        </p>

        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
          style={{ animationDelay: '0.6s' }}
        >
          <Button variant="neon" size="xl" className="group">
            <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
            Start Exploring
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="glass" size="xl" className="group">
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </Button>
        </div>

        {/* Feature pills */}
        <div 
          className="flex flex-wrap items-center justify-center gap-4 md:gap-8 animate-slide-up"
          style={{ animationDelay: '0.8s' }}
        >
          {features.map((feature) => (
            <div
              key={feature.label}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                "glass-subtle hover:border-neon-orange/40 transition-all duration-300",
                "hover:-translate-y-1 cursor-default"
              )}
            >
              <feature.icon className={`w-4 h-4 ${feature.color}`} />
              <span className="text-sm font-medium text-foreground/80">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-white/10 animate-slide-up"
          style={{ animationDelay: '1s' }}
        >
          {[
            { value: 99.9, suffix: '%', label: 'Accuracy Rate', icon: Zap },
            { value: 50, suffix: 'ms', label: 'Response Time', icon: Rocket },
            { value: 100, suffix: 'M+', label: 'API Calls Daily', icon: Globe },
            { value: 4.9, suffix: '/5', label: 'User Rating', icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className="w-5 h-5 text-neon-orange group-hover:scale-110 transition-transform" />
                <span className="text-3xl md:text-4xl font-bold font-display gradient-text-orange">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2 mx-auto">
            <div className="w-1.5 h-3 bg-neon-orange rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export default Hero
