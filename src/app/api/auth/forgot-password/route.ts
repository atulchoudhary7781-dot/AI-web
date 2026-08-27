import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success to prevent email enumeration attacks
    // Even if user doesn't exist, we say "reset email sent"
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    })

    // Create new password reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    })

    // In production, you would send an email here
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
    
    console.log('=== PASSWORD RESET REQUEST ===')
    console.log(`User: ${email}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log('================================')

    // TODO: Integrate with email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'NEXUS AI <noreply@nexusai.com>',
    //   to: [email],
    //   subject: 'Reset your password',
    //   html: `
    //     <p>You requested a password reset. Click the link below to reset:</p>
    //     <p><a href="${resetUrl}">Reset Password</a></p>
    //     <p>This link will expire in 1 hour.</p>
    //     <p>If you didn't request this, please ignore this email.</p>
    //   `
    // })

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      // Only include in development
      ...(process.env.NODE_ENV === 'development' && { 
        resetUrl,
        token 
      })
    })

  } catch (error) {
    console.error('Forgot Password Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
