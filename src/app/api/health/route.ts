import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function dbConfigured() {
  const url = process.env.DATABASE_URL || ''
  if (!url) return false
  const lower = url.toLowerCase()
  if (lower.includes('localhost') || lower.includes('127.0.0.1')) return false
  if (lower.includes('user:pass@')) return false
  return true
}

export async function GET() {
  let database = 'not_configured'
  if (dbConfigured()) {
    try {
      const { db } = await import('@/lib/db')
      await Promise.race([
        db.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800)),
      ])
      database = 'connected'
    } catch {
      database = 'disconnected'
    }
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      chat: 'up',
      database,
    },
  })
}
