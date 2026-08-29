import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/auth/verify-email?token=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?error=missing_token`
      )
    }

    // Find verification token
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verification) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?error=invalid_token`
      )
    }

    // Check if token has expired
    if (new Date() > verification.expiresAt) {
      // Delete expired token
      await prisma.emailVerification.delete({
        where: { id: verification.id }
      })

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?error=expired_token`
      )
    }

    // Check if already verified
    if (verification.user.emailVerified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?verified=true&already=true`
      )
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    })

    // Mark verification token as used
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() }
    })

    // Redirect to profile page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?verified=true`
    )

  } catch (error) {
    console.error('Verify Email Error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?error=verification_failed`
    )
  }
}

// POST /api/auth/verify-email - For programmatic verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find verification token
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 404 }
      )
    }

    // Check if token has expired
    if (new Date() > verification.expiresAt) {
      await prisma.emailVerification.delete({
        where: { id: verification.id }
      })

      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 410 }
      )
    }

    // Check if already verified
    if (verification.user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        alreadyVerified: true
      })
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    })

    // Mark verification token as used
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Verify Email POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
