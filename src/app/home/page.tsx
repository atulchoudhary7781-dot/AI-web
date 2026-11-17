'use client'

import Link from 'next/link'
import { Crown, Heart, MessageSquare, Rocket, Shield, Sparkles, Zap } from 'lucide-react'
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

        <section className="mx-auto mt-14 max-w-2xl rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-red-500/5 to-violet-500/10 p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-yellow-400">
            <Heart className="h-3.5 w-3.5 text-red-400" />
            BUILT BY
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">Atul Choudhary</h2>
          <p className="mt-1 text-sm text-cyan-400">AI Product Engineer · Delhi</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            NEXUS AI is his production chat platform — agentic workflows, RAG, and a cinematic web client.
          </p>
          <a
            href="https://www.linkedin.com/in/atul-choudhary-018037301/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-medium text-cyan-400 hover:underline"
          >
            LinkedIn ↗
          </a>
        </section>
      </main>
    </div>
  )
}
