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

// GET /api/admin/logs - Get admin activity logs
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
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Filters
    const action = searchParams.get('action') || ''

    // Build where clause
    const where: any = {}
    if (action) {
      where.action = action
    }

    // Get logs with pagination
    const [logs, totalCount] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminLog.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('Admin Logs Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
