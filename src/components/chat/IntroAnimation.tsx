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
    // Phase timeline
    const timers = [
      setTimeout(() => setPhase(1), 300),      // Start particle explosion
      setTimeout(() => setPhase(2), 800),      // Show logo glow
      setTimeout(() => setPhase(3), 1400),     // Show NEXUS text
      setTimeout(() => setPhase(4), 2000),     // Show AI text with gradient
      setTimeout(() => setPhase(5), 2600),     // Show tagline
      setTimeout(() => setPhase(6), 3200),     // Full reveal
      setTimeout(() => setFadeOut(true), 4000), // Start fade out
      setTimeout(() => onComplete(), 4500),     // Complete & show main content
    ]

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Particle Animation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationFrameId: number
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      color: string
      life: number
      maxLife: number
    }> = []

    // Colors for particles
    const colors = [
      '#8B5CF6', // Violet
      '#06B6D4', // Cyan
      '#EC4899', // Pink
      '#3B82F6', // Blue
      '#10B981', // Emerald
    ]

    // Create burst of particles from center
    const createParticleBurst = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      for (let i = 0; i < 150; i++) {
        const angle = (Math.PI * 2 * i) / 150 + Math.random() * 0.5
        const speed = 2 + Math.random() * 8
        const maxLife = 60 + Math.random() * 120
        
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1 + Math.random() * 3,
          opacity: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife,
        })
      }
    }

    // Create orbital ring particles
    const createOrbitalRings = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      // Multiple rings
      ;[100, 180, 260].forEach((radius, ringIndex) => {
        const particleCount = 20 + ringIndex * 10
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount
          particles.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: Math.cos(angle + Math.PI / 2) * 0.5,
            vy: Math.sin(angle + Math.PI / 2) * 0.5,
            radius: 1 + Math.random() * 2,
            opacity: 0.6,
            color: colors[ringIndex % colors.length],
            life: 0,
            maxLife: 200,
          })
        }
      })
    }

    if (phase >= 1) {
      createParticleBurst()
      setTimeout(createOrbitalRings, 500)
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(3, 5, 15, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        // Update life
        particle.life++
        
        // Calculate opacity based on life
        const lifeRatio = particle.life / particle.maxLife
        if (lifeRatio > 0.7) {
          particle.opacity = 1 - ((lifeRatio - 0.7) / 0.3)
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Slight deceleration
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Draw particle with glow
        if (particle.opacity > 0) {
          ctx.save()
          ctx.globalAlpha = particle.opacity
          
          // Glow effect
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 4
          )
          gradient.addColorStop(0, particle.color)
          gradient.addColorStop(0.4, particle.color + '80')
          gradient.addColorStop(1, 'transparent')
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2)
          ctx.fill()
          
          // Core
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.restore()
        }

        // Remove dead particles
        if (particle.life >= particle.maxLife || particle.opacity <= 0) {
          particles.splice(index, 1)
        }
      })

      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 0.5
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            ctx.globalAlpha = (100 - distance) / 100 * 0.3
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      if (particles.length > 0 || phase < 6) {
        animationFrameId = requestAnimationFrame(animate)
      }
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
      className={`fixed inset-0 z-[9999] bg-[#03050F] flex items-center justify-center transition-opacity duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Canvas for particle effects */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo Container */}
        <div 
          className={`transition-all duration-1000 ${
            phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          {/* Glowing Logo Background */}
          <div className="relative">
            {/* Outer Glow Rings */}
            <div 
              className={`absolute inset-0 -m-8 rounded-full transition-all duration-1500 delay-500 ${
                phase >= 3 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(6, 182, 212, 0.2) 40%, transparent 70%)',
                filter: 'blur(30px)',
                transform: phase >= 4 ? 'scale(1.5)' : 'scale(1)',
                transition: 'all 2s ease-out',
              }}
            />
            
            {/* Spinning Ring */}
            <div 
              className={`absolute inset-0 -m-4 transition-all duration-1000 ${
                phase >= 2 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="w-32 h-32 rounded-full border-2 border-transparent"
                style={{
                  borderColor: 'rgba(139, 92, 246, 0.5)',
                  borderTopColor: '#06B6D4',
                  borderRightColor: '#EC4899',
                  animation: 'spin 2s linear infinite',
                }}
              />
            </div>
            
            {/* Logo Icon */}
            <div 
              className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-2xl relative overflow-hidden"
              style={{
                boxShadow: phase >= 3 
                  ? '0 0 60px rgba(139, 92, 246, 0.6), 0 0 100px rgba(6, 182, 212, 0.4)' 
                  : '0 25px 50px rgba(0, 0, 0, 0.5)',
                transition: 'box-shadow 1s ease-out',
              }}
            >
              {/* Inner shimmer */}
              <div 
                className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
                style={{
                  animation: 'shimmer 2s ease-in-out infinite',
                }}
              />
              
              {/* Sparkle Icon */}
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-14 h-14 text-white drop-shadow-lg"
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* NEXUS Text */}
        <div 
          className={`mt-8 transition-all duration-700 delay-300 ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="text-white">NEXUS</span>
          </h1>
        </div>

        {/* AI Text with Gradient */}
        <div 
          className={`transition-all duration-700 delay-500 ${
            phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400"
            style={{
              backgroundSize: '200% auto',
              animation: phase >= 5 ? 'gradientShift 3s ease infinite' : 'none',
            }}
          >
            AI
          </h2>
        </div>

        {/* Tagline */}
        <div 
          className={`mt-6 transition-all duration-700 delay-700 ${
            phase >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-400 text-lg md:text-xl tracking-wide text-center max-w-md px-4">
            Your Advanced AI Assistant
          </p>
          
          {/* Decorative line */}
          <div 
            className={`mt-4 h-0.5 mx-auto transition-all duration-1000 delay-1000 ${
              phase >= 6 ? 'w-32 opacity-100' : 'w-0 opacity-0'
            }`}
            style={{
              background: 'linear-gradient(to right, transparent, #8B5CF6, #06B6D4, transparent)',
            }}
          />
        </div>

        {/* Loading dots during final phase */}
        <div 
          className={`flex gap-2 mt-8 transition-opacity duration-500 ${
            phase >= 6 && !fadeOut ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-violet-500"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Corner Decorations */}
      <div 
        className={`absolute top-8 left-8 transition-opacity duration-1000 delay-1000 ${
          phase >= 4 ? 'opacity-30' : 'opacity-0'
        }`}
      >
        <div className="w-16 h-16 border-l-2 border-t-2 border-violet-500/50" />
      </div>
      <div 
        className={`absolute top-8 right-8 transition-opacity duration-1000 delay-1000 ${
          phase >= 4 ? 'opacity-30' : 'opacity-0'
        }`}
      >
        <div className="w-16 h-16 border-r-2 border-t-2 border-cyan-500/50" />
      </div>
      <div 
        className={`absolute bottom-8 left-8 transition-opacity duration-1000 delay-1000 ${
          phase >= 4 ? 'opacity-30' : 'opacity-0'
        }`}
      >
        <div className="w-16 h-16 border-l-2 border-b-2 border-pink-500/50" />
      </div>
      <div 
        className={`absolute bottom-8 right-8 transition-opacity duration-1000 delay-1000 ${
          phase >= 4 ? 'opacity-30' : 'opacity-0'
        }`}
      >
        <div className="w-16 h-16 border-r-2 border-b-2 border-emerald-500/50" />
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%) rotate(45deg); }
          50% { transform: translateX(100%) rotate(45deg); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
        
        @keyframes pulse {
          0%, 80%, 100% { 
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
