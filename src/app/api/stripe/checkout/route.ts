import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with your secret key
// In production, this should come from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

// Plan configuration
const PLANS: Record<string, { priceId: string; name: string }> = {
  pro_monthly: {
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    name: 'Pro (Monthly)',
  },
  pro_yearly: {
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
    name: 'Pro (Yearly)',
  },
  enterprise_monthly: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    name: 'Enterprise',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, billingPeriod, userId, userEmail } = body

    // Validate required fields
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Determine plan key
    const planKey = `${planId}${billingPeriod === 'yearly' ? '_yearly' : '_monthly'}`
    
    // For free plan, redirect to dashboard
    if (planId === 'free') {
      return NextResponse.json({
        url: '/dashboard',
        message: 'Free plan activated',
      })
    }

    // Get plan config
    const planConfig = PLANS[planKey]
    
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // In test mode without real Stripe keys, return a mock URL
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return NextResponse.json({
        url: `/dashboard?plan=${planId}&success=true`,
        message: 'Test mode - Stripe not configured',
        testMode: true,
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: billingPeriod === 'yearly' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-ai.vercel.app'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-ai.vercel.app'}/pricing?canceled=true`,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId || 'anonymous',
        planId: planId,
        billingPeriod: billingPeriod || 'monthly',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Handle GET request to check session status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
    })
  } catch (error) {
    console.error('Error retrieving session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}
