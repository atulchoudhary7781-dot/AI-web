import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PLAN_CONFIG, PlanType } from '@/lib/stripe'
import { findOrCreateUser } from '@/lib/auth'

// GET /api/subscription - Get user subscription status
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 401 }
      )
    }

    // Find user with subscription info
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        plan: 'free',
        maxChatsPerDay: 10,
        features: PLAN_CONFIG.free.features
      })
    }

    // In production, you'd check actual subscription from payment provider
    // For now, we'll use localStorage on client side
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      // This would come from your payment database
      message: 'Subscription managed client-side for demo'
    })

  } catch (error) {
    console.error('Subscription GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// POST /api/subscription - Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan, paymentMethodId } = body

    // Validate plan
    if (!plan || !(plan in PLAN_CONFIG)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be free, normal, or pro' },
        { status: 400 }
      )
    }

    // Find or create user using shared helper
    const user = await findOrCreateUser(email)

    const planType = plan as PlanType
    const price = PLAN_CONFIG[planType].price
    
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // 1 month from now

    // For demo, return success (in production, integrate with Stripe)
    return NextResponse.json({
      success: true,
      subscription: {
        plan,
        price,
        startDate: startDate.toISOString(),
        endDate: plan === 'free' ? null : endDate.toISOString(),
        status: 'active',
        features: PLAN_CONFIG[planType].features
      },
      message: `Successfully ${plan === 'free' ? 'downgraded to' : 'subscribed to'} ${plan.toUpperCase()} plan!`
    })

  } catch (error) {
    console.error('Subscription POST error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 401 }
      )
    }

    // In production, cancel with payment provider
    // For demo, just return success
    
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully'
    })

  } catch (error) {
    console.error('Subscription DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
