'use client'

import Link from 'next/link'
import { Crown, Heart, Linkedin, MapPin, MessageSquare, Rocket, Shield, Sparkles, Zap } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'

export default function HomePage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14 lg:py-16">
        <section className="text-center">
          <div className="liquid-glass-primary mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl sm:mb-6 sm:h-16 sm:w-16">
            <Sparkles className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </div>
          <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            NEXUS <span className="gradient-text-nexus">AI</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-lg">
            Your advanced AI assistant for writing, code, research, and file analysis — built for every device.
          </p>

          <div className="mx-auto mt-8 w-full max-w-4xl sm:mt-10">
            <div className="liquid-panel relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
              <video
                className="aspect-video w-full bg-black object-cover"
                src="/NEXUS-AI-Promo.mp4?v=visuals"
                poster="/nexus-promo-poster.jpg?v=visuals"
                controls
                playsInline
                muted
                autoPlay
                loop
                preload="metadata"
                aria-label="NEXUS AI cinematic intro"
              />
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500 sm:text-xs">
              1080p · cinematic visuals · unmute for voice
            </p>
          </div>

          <div className="mx-auto mt-7 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center">
            <Link
              href="/chat"
              className="liquid-glass-primary inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white"
            >
              <MessageSquare className="h-4 w-4" />
              Open Chat
            </Link>
            <Link
              href="/pricing"
              className="liquid-glass inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white"
            >
              <Crown className="h-4 w-4 text-yellow-300" />
              View Plans
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:mt-8 sm:text-sm">
            <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-400" /> Private chats</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-400" /> Fast replies</span>
            <span className="inline-flex items-center gap-1.5"><Rocket className="h-4 w-4 text-cyan-400" /> Files, voice, images</span>
          </div>
        </section>

        <section className="liquid-panel relative mx-auto mt-12 w-full max-w-3xl overflow-hidden rounded-2xl sm:mt-16 sm:rounded-3xl">
          <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-amber-500/20 blur-3xl sm:h-64 sm:w-64" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-56 w-56 rounded-full bg-orange-600/25 blur-3xl sm:h-72 sm:w-72" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />

          <div className="relative flex flex-col items-center gap-5 p-5 min-[400px]:p-6 md:flex-row md:items-center md:gap-8 md:p-10">
            <div className="relative h-28 w-28 shrink-0 min-[400px]:h-32 min-[400px]:w-32 sm:h-36 sm:w-36 md:h-40 md:w-40">
              <div className="absolute -inset-[3px] animate-spin rounded-full bg-[conic-gradient(from_90deg,#ffb347_0%,transparent_28%,#ff7a3c_62%,transparent_82%,#ffb347_100%)] [animation-duration:8s] motion-reduce:animate-none" />
              <div className="absolute inset-0 overflow-hidden rounded-full bg-[#08081c] p-[3px] shadow-[0_0_28px_rgba(255,179,71,0.35)]">
                <img
                  src="/creator-avatar.jpg"
                  alt="Atul Choudhary, creator of NEXUS AI"
                  className="h-full w-full max-w-none rounded-full object-cover object-[center_20%]"
                />
              </div>
            </div>

            <div className="min-w-0 w-full text-center md:text-left">
              <p className="liquid-chip inline-flex items-center gap-2 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-amber-200 sm:text-[11px] sm:tracking-[0.22em]">
                <Heart className="h-3.5 w-3.5 text-red-400" />
                BUILT BY
              </p>
              <h2 className="mt-3 break-words font-display text-[1.65rem] font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                Atul Choudhary
              </h2>
              <div className="mt-2 flex flex-col items-center gap-1.5 text-[13px] text-amber-200 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-x-2 sm:text-sm md:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  AI Product Engineer
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Delhi, India
                </span>
              </div>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:mx-0 sm:text-[15px]">
                He builds production AI systems — agentic workflows, low-latency RAG, and cinematic
                multimodal apps. NEXUS AI is his platform. Jarvis AI is another.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {['Agentic AI', 'RAG', 'Next.js', 'Python', 'LangChain'].map((tag) => (
                  <span
                    key={tag}
                    className="liquid-chip px-2.5 py-1 text-[10px] font-medium tracking-wide text-slate-100 sm:px-3 sm:text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href="https://www.linkedin.com/in/atul-choudhary-018037301/"
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white md:w-auto"
              >
                <Linkedin className="h-4 w-4" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
