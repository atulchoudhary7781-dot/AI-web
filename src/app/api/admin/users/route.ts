import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to verify admin access
async function verifyAdmin(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email) return null
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'admin') return null
  return user
}

// GET /api/admin/users - List all users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''
    const verified = searchParams.get('verified')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    }

    if (plan && ['free', 'normal', 'pro'].includes(plan)) {
      where.subscriptionPlan = plan
    }

    if (verified === 'true') {
      where.emailVerified = true
    } else if (verified === 'false') {
      where.emailVerified = false
    }

    // Validate sort field
    const allowedSortFields = ['name', 'email', 'subscriptionPlan', 'emailVerified', 'createdAt', 'updatedAt']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const order = sortOrder === 'asc' ? 'asc' : 'desc'

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortField]: order },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          emailVerified: true,
          emailVerifiedAt: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          stripeCustomerId: true,
          chatsToday: true,
          lastChatResetDate: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { chats: true, subscriptions: true }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('Admin Users Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users - Update user (change role, plan, etc.)
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, action, ...updateData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let updatedUser

    switch (action) {
      case 'update_role':
        if (!['user', 'admin'].includes(updateData.role)) {
          return NextResponse.json(
            { error: 'Invalid role. Must be "user" or "admin"' },
            { status: 400 }
          )
        }
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: updateData.role }
        })

        // Log admin action
        await prisma.adminLog.create({
          data: {
            adminId: adminUser.id,
            action: 'role_change',
            targetId: userId,
            details: JSON.stringify({ oldRole: targetUser.role, newRole: updateData.role })
          }
        })
        break

      case 'update_plan':
        if (!['free', 'normal', 'pro'].includes(updateData.plan)) {
          return NextResponse.json(
            { error: 'Invalid plan' },
            { status: 400 }
          )
        }
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { 
            subscriptionPlan: updateData.plan,
            subscriptionStatus: updateData.status || 'active'
          }
        })

        // Log admin action
        await prisma.adminLog.create({
          data: {
            adminId: adminUser.id,
            action: 'plan_change',
            targetId: userId,
            details: JSON.stringify({ 
              oldPlan: targetUser.subscriptionPlan, 
              newPlan: updateData.plan 
            })
          }
        })
        break

      case 'verify_email':
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        })

        await prisma.adminLog.create({
          data: {
            adminId: adminUser.id,
            action: 'manual_email_verify',
            targetId: userId
          }
        })
        break

      case 'reset_chats':
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            chatsToday: 0,
            lastChatResetDate: new Date()
          }
        })

        await prisma.adminLog.create({
          data: {
            adminId: adminUser.id,
            action: 'chat_reset',
            targetId: userId
          }
        })
        break

      default:
        // Generic update
        const allowedUpdates = ['name', 'bio', 'phone', 'location', 'website']
        const filteredData: any = {}
        
        Object.keys(updateData).forEach(key => {
          if (allowedUpdates.includes(key)) {
            filteredData[key] = updateData[key]
          }
        })

        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: filteredData
        })
    }

    return NextResponse.json({
      success: true,
      message: `User ${action} successfully`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Admin Update User Error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users?userId=xxx - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent self-deletion
    if (userId === adminUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'user_delete',
        targetId: userId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Admin Delete User Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
