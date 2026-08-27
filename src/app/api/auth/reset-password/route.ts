import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Find reset token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 404 }
      )
    }

    // Check if token has expired
    if (new Date() > resetRecord.expiresAt) {
      // Delete expired token
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id }
      })

      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    // Check if token was already used
    if (resetRecord.usedAt) {
      return NextResponse.json(
        { error: 'This reset token has already been used' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user's password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword }
    })

    // Mark reset token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() }
    })

    // Delete all other reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: resetRecord.userId,
        id: { not: resetRecord.id }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    })

  } catch (error) {
    console.error('Reset Password Error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

// GET /api/auth/reset-password?token=xxx - Validate token before showing reset form
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token }
    })

    if (!resetRecord) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 404 }
      )
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'Token expired' },
        { status: 410 }
      )
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { valid: false, error: 'Token already used' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      message: 'Token is valid'
    })

  } catch (error) {
    console.error('Validate Reset Token Error:', error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}
