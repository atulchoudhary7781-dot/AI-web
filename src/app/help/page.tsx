'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronDown, HelpCircle, Mail, MessageCircle, Search, Send } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'

const FAQS = [
  { cat: 'Getting Started', q: 'How do I create an account?', a: 'Open Sign Up, enter your name, email and password. You can also chat as a guest without an account.' },
  { cat: 'Getting Started', q: 'Is NEXUS AI free to use?', a: 'Yes. Guests get 6 chats. After login, each account gets 30 chats per day. Your limit is only yours — it does not block other users.' },
  { cat: 'Getting Started', q: 'What AI models are available?', a: 'The chat box lists only live models: NEXUS Auto, Ling 3.2 Flash, Gemma 4 31B, Gemma 4 26B, Nemotron Lightning, Flint, and LFM 1.7B.' },
  { cat: 'Account & Billing', q: 'How do I upgrade to PRO?', a: 'Visit the Pricing page and choose Pro. Subscription checkout will go live shortly — the plan is marked Coming Soon until then.' },
  { cat: 'Account & Billing', q: 'Can I cancel my subscription anytime?', a: 'Yes. Cancel anytime from Settings. Access continues until the end of the billing period.' },
  { cat: 'Account & Billing', q: 'Do you offer refunds?', a: 'Monthly plans can be refunded within 7 days if you have not exceeded fair-use limits. Yearly plans are prorated for unused months.' },
  { cat: 'Features & Usage', q: 'How many chats can I have?', a: 'Guests get 6 chats. After you log in or create an account, you get 30 chats per day. Limits reset in 1 day and are counted separately for each user.' },
  { cat: 'Features & Usage', q: 'Is my chat history saved?', a: 'Yes, after you sign in. Guest chats stay only in this browser session.' },
  { cat: 'Features & Usage', q: 'Can I use NEXUS AI on mobile?', a: 'Yes. The layout is responsive — use the menu button to open the sidebar on phones.' },
]

const CATS = ['All', 'Getting Started', 'Account & Billing', 'Features & Usage']

export default function HelpPage() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState<number | null>(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const items = useMemo(() => {
    return FAQS.filter((f) => {
      const inCat = cat === 'All' || f.cat === cat
      const q = query.trim().toLowerCase()
      const inQ = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      return inCat && inQ
    })
  }, [query, cat])

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-3 py-8 sm:px-4 sm:py-14">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-600 shadow-glow-cyan">
            <HelpCircle className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-4xl">
            Welcome to <span className="gradient-text-nexus">NEXUS AI Support</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Find answers to common questions, browse documentation, or reach the support team.
          </p>
          <div className="relative mx-auto mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for answers…"
              className="w-full rounded-xl border border-amber-300/50 bg-black/40 py-3 pl-14 pr-4 text-base text-white outline-none placeholder:text-slate-400 focus:border-amber-300 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.12)]"
            />
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <span>⭐</span> Contact Options
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-amber-300/20 bg-[#0f172a]/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-amber-200">
                <MessageCircle className="h-5 w-5" />
                <h3 className="font-semibold">Live Chat</h3>
              </div>
              <p className="text-sm text-slate-400">Chat with our support team in real-time.</p>
              <p className="mt-2 text-xs text-emerald-400">● Available · ~5 min response</p>
              <Link href="/chat" className="mt-3 inline-flex text-sm font-medium text-amber-300 hover:underline">
                Start Chat ↗
              </Link>
            </article>
            <article className="rounded-2xl border border-amber-300/20 bg-[#0f172a]/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-amber-200">
                <Mail className="h-5 w-5" />
                <h3 className="font-semibold">Email Support</h3>
              </div>
              <p className="text-sm text-slate-400">Send us an email anytime.</p>
              <p className="mt-2 text-xs text-emerald-400">● Available · ~24 hour response</p>
              <a href="mailto:support@nexusai.app" className="mt-3 inline-flex text-sm font-medium text-amber-300 hover:underline">
                support@nexusai.app ↗
              </a>
            </article>
            <article className="rounded-2xl border border-emerald-400/20 bg-[#0f172a]/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <BookOpen className="h-5 w-5" />
                <h3 className="font-semibold">Documentation</h3>
              </div>
              <p className="text-sm text-slate-400">Browse our help articles.</p>
              <p className="mt-2 text-xs text-emerald-400">● Available · Instant access</p>
              <a href="#faq" className="mt-3 inline-flex text-sm font-medium text-emerald-400 hover:underline">
                View Docs ↗
              </a>
            </article>
          </div>
        </section>

        <section id="faq" className="mb-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    cat === c
                      ? 'bg-cyan-400/15 text-amber-200 ring-1 ring-cyan-400/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/70">
            {items.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={item.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-white">{item.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-slate-400">{item.a}</p>}
                </div>
              )
            })}
            {items.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No matching articles. Try another search.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0b1020]/70 p-6">
          <h2 className="text-lg font-semibold text-white">Submit a Request</h2>
          <p className="mt-1 text-sm text-slate-400">Can’t find what you’re looking for? Let us know.</p>
          {sent ? (
            <p className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Request sent. We’ll reply to {email || 'your inbox'} soon.
            </p>
          ) : (
            <form
              className="mt-5 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <input className="input-dark" placeholder="e.g. Atul Choudhary" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="input-dark" type="email" placeholder="e.g. atul@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <textarea
                className="input-dark min-h-28 sm:col-span-2"
                placeholder="How can we help?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-orange-500 px-5 py-2.5 text-sm font-semibold text-slate-950 sm:col-span-2"
              >
                <Send className="h-4 w-4" />
                Send request
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
