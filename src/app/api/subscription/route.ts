import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        plan: 'free',
        maxChatsPerDay: 10,
        features: ['basic_ai', 'limited_chats', '7_day_history']
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
    if (!['free', 'normal', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0]
        }
      })
    }

    // Calculate subscription details
    const planPrices = { free: 0, normal: 10, pro: 20 }
    const price = planPrices[plan as keyof typeof planPrices]
    
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // 1 month from now

    // In production, you would:
    // 1. Create payment intent with Stripe/Payment provider
    // 2. Process payment
    // 3. Store subscription in database
    // 4. Webhook to handle payment confirmations

    // For demo, return success
    return NextResponse.json({
      success: true,
      subscription: {
        plan,
        price,
        startDate: startDate.toISOString(),
        endDate: plan === 'free' ? null : endDate.toISOString(),
        status: 'active',
        features: getPlanFeatures(plan)
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

// Helper function to get plan features
function getPlanFeatures(plan: string): string[] {
  switch (plan) {
    case 'pro':
      return [
        'unlimited_chats',
        'gpt4_claude_access',
        'image_generation',
        'voice_conversations',
        'api_access',
        'custom_ai_training',
        'priority_queue',
        'dedicated_support',
        'infinite_history'
      ]
    case 'normal':
      return [
        'unlimited_chats',
        'advanced_ai_models',
        'file_attachments',
        '30_day_history',
        'data_export',
        'priority_support'
      ]
    case 'free':
    default:
      return [
        '10_chats_per_day',
        'basic_ai_responses',
        'community_support',
        '7_day_history'
      ]
  }
}
