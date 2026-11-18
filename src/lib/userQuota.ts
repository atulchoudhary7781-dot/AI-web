import { createHmac, timingSafeEqual } from 'crypto'
import { db } from './db'

/** Logged-in users get their own daily chats. Guests stay on the 6-chat client cap. */
export const LOGGED_IN_CHATS_PER_DAY = 30

const mem = new Map<string, { date: string; count: number }>()

export function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  if (email.length < 5 || email.length > 254) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

function secret() {
  return process.env.QUOTA_SECRET || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || 'nexus-user-quota'
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('hex').slice(0, 32)
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function readCookie(header: string | null, name: string) {
  if (!header) return null
  const parts = header.split(';')
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed.startsWith(`${name}=`)) continue
    return decodeURIComponent(trimmed.slice(name.length + 1))
  }
  return null
}

function parseQuotaCookie(cookieHeader: string | null, email: string) {
  const raw = readCookie(cookieHeader, 'nexus_q')
  if (!raw) return null
  const [date, countRaw, sig] = raw.split('.')
  if (!date || !countRaw || !sig) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const count = Number(countRaw)
  if (!Number.isFinite(count) || count < 0 || count > 100000) return null
  const expected = sign(`${email}|${date}|${count}`)
  if (!safeEqual(sig, expected)) return null
  return { date, count }
}

export function quotaCookie(email: string, date: string, count: number) {
  const sig = sign(`${email}|${date}|${count}`)
  const value = encodeURIComponent(`${date}.${count}.${sig}`)
  const secure = process.env.VERCEL === '1' || (process.env.NEXUS_APP_URL || '').startsWith('https')
  return `nexus_q=${value}; Path=/; Max-Age=172800; SameSite=Lax; HttpOnly${secure ? '; Secure' : ''}`
}

function dbEnabled() {
  const url = process.env.DATABASE_URL || ''
  if (!url) return false
  const lower = url.toLowerCase()
  if (lower.includes('localhost') || lower.includes('127.0.0.1')) return false
  if (lower.includes('user:pass@')) return false
  return true
}

function timedOut<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('quota-db-timeout')), ms)),
  ])
}

async function dbCount(email: string, today: string): Promise<number | null> {
  if (!dbEnabled()) return null
  try {
    const user = await timedOut(
      db.user.findUnique({
        where: { email },
        select: { chatsToday: true, lastChatResetDate: true },
      }),
      700,
    )
    if (!user) return null
    const lastKey = user.lastChatResetDate ? utcDateKey(user.lastChatResetDate) : ''
    return lastKey === today ? (user.chatsToday || 0) : 0
  } catch {
    return null
  }
}

async function dbWrite(email: string, used: number) {
  if (!dbEnabled()) return
  void timedOut(
    db.user.upsert({
      where: { email },
      create: {
        email,
        name: email.split('@')[0],
        chatsToday: used,
        lastChatResetDate: new Date(),
      },
      update: {
        chatsToday: used,
        lastChatResetDate: new Date(),
      },
    }),
    700,
  ).catch(() => {
    /* DB optional — cookie still isolates users worldwide */
  })
}

export async function consumeLoggedInChat(email: string, cookieHeader: string | null) {
  const max = LOGGED_IN_CHATS_PER_DAY
  const today = utcDateKey()
  const cookie = parseQuotaCookie(cookieHeader, email)
  const fromCookie = cookie?.date === today ? cookie.count : 0
  const fromMem = mem.get(email)?.date === today ? mem.get(email)!.count : 0
  const fromDb = await dbCount(email, today)
  const current = Math.max(fromCookie, fromMem, fromDb ?? 0)

  if (current >= max) {
    mem.set(email, { date: today, count: current })
    return {
      allowed: false,
      used: current,
      max,
      cookie: quotaCookie(email, today, current),
    }
  }

  const used = current + 1
  mem.set(email, { date: today, count: used })
  await dbWrite(email, used)
  return {
    allowed: true,
    used,
    max,
    cookie: quotaCookie(email, today, used),
  }
}
