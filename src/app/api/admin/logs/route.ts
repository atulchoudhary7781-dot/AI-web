import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'

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
      db.adminLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.adminLog.count({ where })
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
