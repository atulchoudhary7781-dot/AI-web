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

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get current date for period calculations
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Run all queries in parallel for performance
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      totalChats,
      chatsThisMonth,
      activeUsersToday,
      
      subscriptionStats,
      revenueData,
      recentPayments,
      recentUsers,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // New users this month
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      
      // New users this week
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      
      // Total chats
      prisma.chat.count(),
      
      // Chats this month
      prisma.chat.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      
      // Active users today (users who chatted today)
      prisma.chat.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: todayStart } }
      }).then(groups => groups.length),
      
      // Subscription distribution
      prisma.user.groupBy({
        by: ['subscriptionPlan'],
        _count: { id: true }
      }),
      
      // Revenue data (from payments)
      {
        total: prisma.payment.aggregate({
          where: { status: 'succeeded' },
          _sum: { amount: true },
          _count: { id: true }
        }),
        thisMonth: prisma.payment.aggregate({
          where: {
            status: 'succeeded',
            createdAt: { gte: thirtyDaysAgo }
          },
          _sum: { amount: true },
          _count: { id: true }
        })
      },
      
      // Recent payments (last 10)
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      
      // Recent users (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, createdAt: true,
          subscriptionPlan: true, emailVerified: true
        }
      })
    ])

    // Calculate subscription stats
    const subscriptions = {
      free: 0,
      normal: 0,
      pro: 0
    }
    
    subscriptionStats.forEach(stat => {
      if (stat.subscriptionPlan in subscriptions) {
        subscriptions[stat.subscriptionPlan as keyof typeof subscriptions] = stat._count.id
      }
    })

    // Format revenue data
    const revenue = {
      totalRevenue: revenueData.total._sum.amount || 0,
      totalPayments: revenueData.total._count.id || 0,
      monthlyRevenue: revenueData.thisMonth._sum.amount || 0,
      monthlyPayments: revenueData.thisMonth._count.id || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          newThisWeek: newUsersThisWeek,
          activeToday: activeUsersToday
        },
        chats: {
          total: totalChats,
          thisMonth: chatsThisMonth
        },
        subscriptions,
        revenue,
        recentPayments,
        recentUsers,
        generatedAt: now.toISOString()
      }
    })

  } catch (error) {
    console.error('Admin Stats Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}
