'use client'

import { useState, useEffect, useRef } from 'react'

interface IntroAnimationProps {
  onComplete: () => void
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Phase timeline - Gemini style smooth animation
    const timers = [
      setTimeout(() => setPhase(1), 100),      // Start subtle particles
      setTimeout(() => setPhase(2), 600),      // Star begins to form
      setTimeout(() => setPhase(3), 1200),     // Star fully visible with glow
      setTimeout(() => setPhase(4), 1800),     // NEXUS text fades in elegantly
      setTimeout(() => setPhase(5), 2400),     // AI text with gradient shimmer
      setTimeout(() => setPhase(6), 3000),     // Tagline appears
      setTimeout(() => setPhase(7), 3600),     // Full brightness
      setTimeout(() => setFadeOut(true), 4200), // Gentle fade out
      setTimeout(() => onComplete(), 4800),     // Complete & show main content
    ]

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Gemini-style Particle Animation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationFrameId: number
    let time = 0
    
    // Floating particles - Gemini style (subtle, elegant)
    interface StarParticle {
      x: number
      y: number
      size: number
      opacity: number
      speed: number
      angle: number
      twinkleSpeed: number
      twinkleOffset: number
      color: string
    }

    const particles: StarParticle[] = []
    
    // Gemini-inspired colors (blue, purple, cyan, soft pink)
    const geminiColors = [
      '#4285F4', // Google Blue
      '#9B72CB', // Purple  
      '#00BCD4', // Cyan
      '#F4B400', // Amber/Gold
      '#E91E63', // Soft Pink
    ]

    // Create elegant floating stars/constellations
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        angle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: geminiColors[Math.floor(Math.random() * geminiColors.length)],
      })
    }

    // Constellation lines data
    interface ConstellationLine {
      from: number
      to: number
      opacity: number
    }
    
    const constellationLines: ConstellationLine[] = []

    // Create some constellation connections near center
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    for (let i = 0; i < 20; i++) {
      const fromIdx = Math.floor(Math.random() * 30) // Use first 30 particles
      let toIdx = Math.floor(Math.random() * 30)
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * 30)
      }
      
      constellationLines.push({
        from: fromIdx,
        to: toIdx,
        opacity: Math.random() * 0.15 + 0.05,
      })
    }

    const animate = () => {
      time += 0.016 // ~60fps
      
      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(10, 12, 20, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw constellation lines first (behind particles)
      constellationLines.forEach((line) => {
        const p1 = particles[line.from]
        const p2 = particles[line.to]
        
        if (p1 && p2) {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 250) {
            const lineOpacity = line.opacity * (1 - distance / 250) * 
                              (phase >= 2 ? Math.min(1, (phase - 1) * 0.5) : 0.3)
            
            ctx.save()
            ctx.globalAlpha = lineOpacity
            ctx.strokeStyle = '#6366F1'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            ctx.restore()
          }
        }
      })

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Gentle floating motion
        particle.angle += particle.speed * 0.01
        particle.x += Math.cos(particle.angle) * particle.speed
        particle.y += Math.sin(particle.angle) * particle.speed * 0.5
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        
        // Twinkle effect
        const twinkle = Math.sin(time * 60 * particle.twinkleSpeed + particle.twinkleOffset)
        const currentOpacity = particle.opacity * (0.5 + twinkle * 0.5)
        
        // Phase-based visibility multiplier
        const phaseMultiplier = phase >= 1 ? Math.min(1, phase * 0.3) : 0.1
        
        if (currentOpacity * phaseMultiplier > 0.01) {
          ctx.save()
          ctx.globalAlpha = currentOpacity * phaseMultiplier
          
          // Soft glow for larger particles
          if (particle.size > 1.5) {
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size * 4
            )
            gradient.addColorStop(0, particle.color)
            gradient.addColorStop(0.5, particle.color + '40')
            gradient.addColorStop(1, 'transparent')
            
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2)
            ctx.fill()
          }
          
          // Core star particle
          ctx.fillStyle = '#FFFFFF'
          ctx.shadowBlur = particle.size * 3
          ctx.shadowColor = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.restore()
        }
      })

      // Central glow effect when star is forming (phase 2+)
      if (phase >= 2 && phase <= 5) {
        const glowIntensity = Math.min(1, (phase - 1) * 0.4) * (1 - (phase - 2) * 0.2)
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, 300
        )
        
        gradient.addColorStop(0, `rgba(99, 102, 241, ${0.15 * glowIntensity})`)
        gradient.addColorStop(0.3, `rgba(139, 92, 246, ${0.08 * glowIntensity})`)
        gradient.addColorStop(0.6, `rgba(6, 182, 212, ${0.04 * glowIntensity})`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [phase])

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#0A0C14] flex items-center justify-center transition-opacity duration-1000 ease-out ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Canvas for Gemini-style particle effects */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Central Content - Gemini Style */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        {/* Gemini-style Star Logo */}
        <div 
          className={`transition-all duration-1500 ease-out ${
            phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            transform: phase >= 2 ? 'scale(1)' : 'scale(0.7)',
            opacity: phase >= 2 ? 1 : 0,
          }}
        >
          <div className="relative">
            {/* Outer ambient glow - expands gently */}
            <div 
              className="absolute inset-0 -m-16 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 35%, rgba(6, 182, 212, 0.08) 60%, transparent 80%)',
                filter: 'blur(40px)',
                transform: phase >= 4 ? 'scale(1.8)' : 'scale(1)',
                transition: 'all 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: phase >= 3 ? 1 : 0.5,
              }}
            />
            
            {/* Rotating ring - very subtle */}
            <div 
              className="absolute inset-0 -m-6"
              style={{
                opacity: phase >= 3 ? 0.4 : 0,
                transition: 'opacity 1s ease-out',
              }}
            >
              <svg 
                className="w-40 h-40 animate-spin" 
                style={{ animationDuration: '8s' }}
                viewBox="0 0 160 160"
              >
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4285F4" stopOpacity="0" />
                    <stop offset="25%" stopColor="#9B72CB" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#00BCD4" stopOpacity="0.3" />
                    <stop offset="75%" stopColor="#E91E63" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <circle
                  cx="80"
                  cy="80"
                  r="76"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="200 400"
                />
              </svg>
            </div>

            {/* Main Star Container */}
            <div 
              className="w-28 h-28 rounded-3xl relative overflow-hidden flex items-center justify-center"
              style={{
                background: phase >= 3 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' 
                  : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                boxShadow: phase >= 3 
                  ? '0 25px 60px rgba(99, 102, 241, 0.4), 0 0 120px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 20px 40px rgba(0, 0, 0, 0.4)',
                transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Inner shimmer overlay */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
                style={{
                  background: 'linear-gradient(105deg, rgba(255,255,255,0.2) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)',
                }}
              />
              
              {/* Gemini-style 4-pointed Star */}
              <svg 
                viewBox="0 0 64 64" 
                className="w-16 h-16 relative z-10 drop-shadow-2xl"
                fill="none"
              >
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#E0E7FF" />
                    <stop offset="100%" stopColor="#C7D2FE" />
                  </linearGradient>
                  <filter id="starGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Main star shape - elegant 4-pointed design */}
                <g filter="url(#starGlow)">
                  {/* Top point */}
                  <path
                    d="M32 4 L36 26 L58 32 L36 38 L32 60 L28 38 L6 32 L28 26 Z"
                    fill="url(#starGradient)"
                    style={{
                      transformOrigin: 'center',
                      transform: phase >= 2 ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
                      transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                  
                  {/* Inner diamond accent */}
                  <path
                    d="M32 18 L36 32 L32 46 L28 32 Z"
                    fill="white"
                    fillOpacity="0.6"
                    style={{
                      transformOrigin: 'center',
                      transform: phase >= 3 ? 'scale(1)' : 'scale(0)',
                      transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
                      opacity: phase >= 3 ? 1 : 0,
                    }}
                  />
                  
                  {/* Center bright core */}
                  <circle
                    cx="32"
                    cy="32"
                    r="3"
                    fill="white"
                    style={{
                      opacity: phase >= 3 ? 1 : 0,
                      transition: 'opacity 0.5s ease-out 0.6s',
                    }}
                  />
                </g>
              </svg>

              {/* Pulsing glow effect on star */}
              <div 
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                  opacity: phase >= 4 ? 0.5 : 0,
                  animation: phase >= 4 ? 'pulseGlow 2s ease-in-out infinite' : 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* NEXUS Text - Clean, Elegant Typography */}
        <div 
          className="mt-10 transition-all duration-1000 ease-out"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '200ms',
          }}
        >
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
            <span 
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 50%, #C7D2FE 100%)',
              }}
            >
              NEXUS
            </span>
          </h1>
        </div>

        {/* AI Text - Gradient Shimmer Effect */}
        <div 
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '400ms',
          }}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-400 to-pink-400"
            style={{
              backgroundSize: '300% auto',
              animation: phase >= 6 ? 'geminiShimmer 4s linear infinite' : 'none',
            }}
          >
            AI
          </h2>
        </div>

        {/* Tagline - Subtle and Clean */}
        <div 
          className="mt-8 transition-all duration-800 ease-out"
          style={{
            opacity: phase >= 6 ? 1 : 0,
            transform: phase >= 6 ? 'translateY(0)' : 'translateY(15px)',
            transitionDelay: '600ms',
          }}
        >
          <p className="text-gray-400 text-lg md:text-xl tracking-wide text-center max-w-sm px-4 font-light">
            Think bigger. Build faster.
          </p>
          
          {/* Minimalist divider line */}
          <div 
            className="mt-6 mx-auto h-px transition-all duration-1500 ease-out"
            style={{
              width: phase >= 7 ? '120px' : '0px',
              background: 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.5), rgba(139, 92, 246, 0.3), transparent)',
              transitionDelay: '800ms',
            }}
          />
        </div>

        {/* Loading indicator - minimal dots */}
        <div 
          className="flex gap-1.5 mt-10 transition-opacity duration-500"
          style={{
            opacity: phase >= 7 && !fadeOut ? 1 : 0,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              style={{
                animation: `gentlePulse 1.6s ease-in-out ${i * 0.25}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS Animations - Gemini Style */}
      <style jsx global>{`
        @keyframes geminiShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        
        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.02);
          }
        }
        
        @keyframes gentlePulse {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.4;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
