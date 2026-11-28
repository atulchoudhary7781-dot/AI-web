'use client'

import Link from 'next/link'
import { Heart, Linkedin, MapPin, MessageSquare, Sparkles } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'

export default function HomePage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <section className="text-center">
          <p className="text-xs font-medium tracking-normal text-[color:var(--muted-foreground)] sm:text-sm">
            NEXUS AI
          </p>
          <h1 className="font-display mt-3 text-[1.75rem] font-medium leading-tight tracking-tight text-[color:var(--foreground)] sm:text-4xl md:text-5xl">
            Ask anything
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-6 text-[color:var(--muted-foreground)] sm:text-base">
            Writing, code, research, and file analysis — a calm assistant for every device.
          </p>

          <div className="mx-auto mt-10 w-full max-w-3xl">
            <div className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-black">
              <video
                className="aspect-video w-full bg-black object-cover"
                src="/NEXUS-AI-Promo.mp4?v=premium"
                poster="/nexus-promo-poster.jpg?v=premium"
                controls
                playsInline
                muted
                autoPlay
                loop
                preload="metadata"
                aria-label="NEXUS AI cinematic intro"
              />
            </div>
            <p className="mt-3 text-center text-[12px] text-[color:var(--muted-foreground)]">
              1080p · unmute for voice
            </p>
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <Link
              href="/chat"
              className="liquid-glass-primary inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-[15px] font-medium"
            >
              <MessageSquare className="h-4 w-4" />
              Open Chat
            </Link>
            <Link
              href="/pricing"
              className="liquid-glass inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-[15px] font-medium"
            >
              View Plans
            </Link>
          </div>
        </section>

        <section className="liquid-panel relative mx-auto mt-16 w-full overflow-hidden rounded-lg">
          <div className="relative flex flex-col items-center gap-6 p-5 min-[400px]:p-6 md:flex-row md:items-center md:gap-8 md:p-8">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[color:var(--border)] sm:h-28 sm:w-28">
              <img
                src="/creator-avatar.jpg"
                alt="Atul Choudhary, creator of NEXUS AI"
                className="h-full w-full max-w-none object-cover object-[center_20%]"
              />
            </div>

            <div className="min-w-0 w-full text-center md:text-left">
              <p className="inline-flex items-center gap-2 text-[12px] font-medium text-[color:var(--muted-foreground)]">
                <Heart className="h-3.5 w-3.5" />
                Built by
              </p>
              <h2 className="font-display mt-2 break-words text-[1.5rem] font-medium leading-tight tracking-tight sm:text-3xl">
                Atul Choudhary
              </h2>
              <div className="mt-2 flex flex-col items-center gap-1.5 text-[13px] text-[color:var(--muted-foreground)] sm:flex-row sm:flex-wrap sm:justify-start sm:gap-x-3 md:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  AI Product Engineer
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  Delhi, India
                </span>
              </div>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-6 text-[color:var(--muted-foreground)] md:mx-0">
                He builds production AI systems — agentic workflows, low-latency RAG, and
                cinematic multimodal apps. NEXUS AI is his platform.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {['Agentic AI', 'RAG', 'Next.js', 'Python', 'LangChain'].map((tag) => (
                  <span
                    key={tag}
                    className="liquid-chip px-3 py-1 text-[12px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href="https://www.linkedin.com/in/atul-choudhary-018037301/"
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass mt-6 inline-flex h-9 w-full max-w-xs items-center justify-center gap-2 rounded-full px-4 text-[15px] font-medium md:w-auto"
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
