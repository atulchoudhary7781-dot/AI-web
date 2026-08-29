import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    const startTime = Date.now()
    
    // Get basic stats
    const [userCount, chatCount] = await Promise.all([
      prisma.user.count(),
      prisma.chat.count()
    ])
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${responseTime}ms`,
      services: {
        database: 'connected',
        resend: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      },
      stats: {
        users: userCount,
        chats: chatCount,
      },
      endpoints: {
        auth: '/api/auth/* (verification, password reset)',
        payments: '/api/payments/* (stripe checkout, webhooks)',
        admin: '/api/admin/* (dashboard, user management)',
        setup: '/api/setup/* (admin setup)',
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
