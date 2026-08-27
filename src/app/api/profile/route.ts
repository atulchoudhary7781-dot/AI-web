import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 401 }
      )
    }

    // Try to find user in database
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        chats: {
          orderBy: { updatedAt: 'desc' },
          take: 10
        },
        _count: {
          select: { chats: true }
        }
      }
    })

    // If user not found in DB, check localStorage data (for demo/compatibility)
    if (!user) {
      return NextResponse.json({
        user: null,
        message: 'User not found in database'
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt,
        chatCount: user._count.chats,
        recentChats: user.chats
      }
    })

  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, avatar, bio, phone, location, website } = body

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          avatar: avatar || null,
          bio: bio || null,
          phone: phone || null,
          location: location || null,
          website: website || null
        }
      })
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { email },
        data: {
          ...(name && { name }),
          ...(avatar !== undefined && { avatar }),
          ...(bio !== undefined && { bio }),
          ...(phone !== undefined && { phone }),
          ...(location !== undefined && { location }),
          ...(website !== undefined && { website })
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website
      },
      message: 'Profile updated successfully!'
    })

  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// POST /api/profile/avatar - Upload profile photo (base64)
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 401 }
      )
    }

    const { avatar } = await request.json()

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar data required' },
        { status: 400 }
      )
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Create user with avatar
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          avatar
        }
      })
    } else {
      // Update avatar
      user = await prisma.user.update({
        where: { email },
        data: { avatar }
      })
    }

    return NextResponse.json({
      success: true,
      avatar: user.avatar,
      message: 'Avatar uploaded successfully!'
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}
