'use client'

import Link from 'next/link'
import { Crown, Heart, Linkedin, MapPin, MessageSquare, Rocket, Shield, Sparkles, Zap } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'

export default function HomePage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <section className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-glow-cyan">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            NEXUS <span className="gradient-text-nexus">AI</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-lg">
            Your advanced AI assistant for writing, code, research, and file analysis — built for every device.
          </p>

          <div className="mx-auto mt-10 w-full max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-black shadow-[0_0_80px_rgba(0,229,255,0.18)] sm:rounded-3xl">
              <video
                className="aspect-video w-full bg-black object-cover"
                src="/NEXUS-AI-Promo.mp4"
                poster="/nexus-promo-poster.jpg"
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
              NEXUS AI intro · 60 fps · unmute to hear the voice
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/chat"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 text-sm font-semibold text-slate-950 shadow-glow-cyan"
            >
              <MessageSquare className="h-4 w-4" />
              Open Chat
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Crown className="h-4 w-4 text-yellow-300" />
              View Plans
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500 sm:text-sm">
            <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-400" /> Private chats</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-400" /> Fast replies</span>
            <span className="inline-flex items-center gap-1.5"><Rocket className="h-4 w-4 text-cyan-400" /> Files, voice, images</span>
          </div>
        </section>

        <section className="relative mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl border border-cyan-400/25 bg-[#08081c] shadow-[0_0_80px_rgba(0,229,255,0.12)]">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />

          <div className="relative grid gap-8 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-10">
            <div className="mx-auto sm:mx-0">
              <div className="relative h-36 w-36 sm:h-40 sm:w-40">
                <div className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_90deg,transparent_0%,#00e5ff_35%,#a855f7_70%,transparent_100%)] [animation-duration:8s]" />
                <div className="absolute inset-[3px] rounded-full bg-[#08081c]" />
                <img
                  src="/creator-photo.jpg"
                  alt="Atul Choudhary, creator of NEXUS AI"
                  className="absolute inset-[7px] h-[calc(100%-14px)] w-[calc(100%-14px)] rounded-full object-cover object-[center_18%] ring-2 ring-white/10"
                />
              </div>
            </div>

            <div className="text-center sm:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-yellow-300">
                <Heart className="h-3.5 w-3.5 text-red-400" />
                BUILT BY
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Atul Choudhary
              </h2>
              <p className="mt-1.5 flex items-center justify-center gap-2 text-sm text-cyan-300 sm:justify-start">
                <Sparkles className="h-4 w-4" />
                AI Product Engineer
                <span className="text-slate-500">·</span>
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Delhi, India
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-[15px]">
                He builds production AI systems — agentic workflows, low-latency RAG, and cinematic
                multimodal apps. NEXUS AI is his platform. Jarvis AI is another.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {['Agentic AI', 'RAG', 'Next.js', 'Python', 'LangChain'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href="https://www.linkedin.com/in/atul-choudhary-018037301/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#0A66C2] px-5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(10,102,194,0.35)] transition hover:brightness-110"
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
