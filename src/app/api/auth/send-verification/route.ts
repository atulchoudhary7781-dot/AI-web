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

    // In production, you would send an email here using Resend, SendGrid, Nodemailer, etc.
    // For demo purposes, we'll log the token and return it
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`
    
    console.log('=== EMAIL VERIFICATION ===')
    console.log(`To: ${email}`)
    console.log(`Verification URL: ${verificationUrl}`)
    console.log('=========================')

    // TODO: Integrate with email service (Resend recommended for Vercel deployments)
    // Example with Resend:
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'NEXUS AI <noreply@nexusai.com>',
    //   to: [email],
    //   subject: 'Verify your email address',
    //   html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
    // })

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      // Only include token in development
      ...(process.env.NODE_ENV === 'development' && { 
        verificationUrl,
        token 
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
