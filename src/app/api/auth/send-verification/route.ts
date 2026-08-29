import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { sendVerificationEmail } from '@/lib/email'

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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If already verified, return message
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        verified: true
      })
    }

    // Generate verification token
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Delete any existing verification tokens for this user
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id }
    })

    // Create new verification token
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        email,
        expiresAt
      }
    })

    // Send verification email using Resend
    const emailResult = await sendVerificationEmail(email, token)

    // Log for development/debugging
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`
    
    console.log('=== EMAIL VERIFICATION ===')
    console.log(`To: ${email}`)
    console.log(`Verification URL: ${verificationUrl}`)
    console.log(`Email Service Result:`, emailResult)
    console.log('=========================')

    return NextResponse.json({
      success: true,
      message: emailResult.success 
        ? 'Verification email sent successfully!' 
        : 'Verification prepared (check logs for dev mode)',
      emailSent: emailResult.success,
      // Include dev info in development mode
      ...(process.env.NODE_ENV === 'development' && !emailResult.success && { 
        verificationUrl,
        token,
        devNote: 'Resend not configured - see .env.example'
      })
    })

  } catch (error) {
    console.error('Send Verification Error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}
