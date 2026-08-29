import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { sendPasswordResetEmail } from '@/lib/email'
import { validateEmail, sanitizeString, checkForDangerousContent } from '@/lib/security'

const prisma = new PrismaClient()

// Rate limiting for password reset (prevent email enumeration attacks)
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 3
const ATTEMPT_WINDOW = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and sanitize email
    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }
    
    const email = emailValidation.value
    
    // Check for suspicious content (basic bot detection)
    const userAgent = request.headers.get('user-agent') || ''
    if (checkForDangerousContent(email) || checkForDangerousContent(userAgent)) {
      console.warn('Suspicious activity detected in forgot-password:', { email, userAgent })
      // Still return success to prevent enumeration, but log it
    }
    
    // Rate limiting per IP to prevent abuse
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const attempts = resetAttempts.get(ip)
    
    if (attempts && now - attempts.lastAttempt < ATTEMPT_WINDOW) {
      if (attempts.count >= MAX_ATTEMPTS) {
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
          note: 'Rate limited' // Hidden from user in production
        })
      }
      attempts.count++
      attempts.lastAttempt = now
    } else {
      resetAttempts.set(ip, { count: 1, lastAttempt: now })
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
    
    // Additional validation: Check if user is locked out
    if (user.isLocked) {
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

    // Send password reset email using Resend
    const emailResult = await sendPasswordResetEmail(email, token)

    // Log for development/debugging
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
    
    console.log('=== PASSWORD RESET REQUEST ===')
    console.log(`User: ${email}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log(`Email Service Result:`, emailResult)
    console.log('================================')

    return NextResponse.json({
      success: true,
      message: emailResult.success 
        ? 'If an account exists with this email, a password reset link has been sent.'
        : 'Reset link prepared (check logs for dev mode)',
      emailSent: emailResult.success,
      // Include dev info in development mode
      ...(process.env.NODE_ENV === 'development' && !emailResult.success && { 
        resetUrl,
        token,
        devNote: 'Resend not configured - see .env.example'
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
