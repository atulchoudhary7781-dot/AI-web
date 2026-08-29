import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/setup/admin - Set up first admin user
export async function POST(request: NextRequest) {
  try {
    // Security: Only allow in development or with setup token
    if (process.env.NODE_ENV === 'production') {
      const setupToken = request.headers.get('x-setup-token')
      if (setupToken !== process.env.SETUP_TOKEN) {
        return NextResponse.json(
          { error: 'Invalid setup token. Provide SETUP_TOKEN header.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          role: 'admin',
          emailVerified: true // Auto-verify admin
        }
      })
    } else {
      // Update existing user to admin
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' }
      })
    }

    // Log this action
    await prisma.adminLog.create({
      data: {
        adminId: user.id,
        action: 'admin_setup',
        targetId: user.id,
        details: JSON.stringify({ 
          method: 'api', 
          timestamp: new Date().toISOString() 
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: `Admin user created/updated successfully!`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      instructions: [
        'Add to localStorage for UI access:',
        `localStorage.setItem('nexus_user_role', 'admin')`,
        `localStorage.setItem('nexus_user_email', '${email}')`,
        '',
        'Then refresh the page and go to Settings → Admin Dashboard'
      ]
    })

  } catch (error) {
    console.error('Setup Admin Error:', error)
    return NextResponse.json(
      { error: 'Failed to set up admin user' },
      { status: 500 }
    )
  }
}

// GET /api/setup/admin - Check current status
export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'admin' }
    })

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      take: 10
    })

    return NextResponse.json({
      success: true,
      data: {
        adminCount,
        admins,
        isProduction: process.env.NODE_ENV === 'production'
      }
    })

  } catch (error) {
    console.error('Get Admin Status Error:', error)
    return NextResponse.json(
      { error: 'Failed to get admin status' },
      { status: 500 }
    )
  }
}
