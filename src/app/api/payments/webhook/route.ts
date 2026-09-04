import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

// Initialize Stripe only if API key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-08-26.dahlia',
  })
}

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    const stripe = getStripe()
    if (!stripe) {
      console.error('Stripe not configured')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature || !endpointSecret) {
      console.error('Missing stripe signature or webhook secret')
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    let event: Stripe.Event

    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan
  
  if (!userId || !plan) return

  console.log(`Checkout completed for user ${userId}, plan: ${plan}`)
  
  // Update user's subscription info temporarily until subscription.created fires
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: plan,
      subscriptionStatus: 'active',
    }
  })
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const plan = subscription.metadata?.plan
  
  if (!userId || !plan) return

  const priceId = subscription.items.data[0]?.price?.id
  const amount = subscription.items.data[0]?.price?.unit_amount || 0

  // Create subscription record in database
  await prisma.subscription.create({
    data: {
      userId,
      plan,
      status: 'active',
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      amount,
    }
  })

  // Update user record
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: plan,
      subscriptionStatus: 'active',
      stripeSubscriptionId: subscription.id,
      subscriptionStartDate: new Date((subscription as any).current_period_start * 1000),
      subscriptionEndDate: new Date((subscription as any).current_period_end * 1000),
    }
  })

  console.log(`Subscription created: ${subscription.id} for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id
  
  // Find subscription in database
  const subRecord = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId }
  })

  if (!subRecord) return

  // Update subscription record
  await prisma.subscription.update({
    where: { id: subRecord.id },
    data: {
      status: subscription.status as string,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    }
  })

  // Update user record
  await prisma.user.update({
    where: { id: subRecord.userId },
    data: {
      subscriptionStatus: subscription.status as string,
      subscriptionEndDate: new Date((subscription as any).current_period_end * 1000),
    }
  })

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id
  
  // Find and update subscription
  const subRecord = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId }
  })

  if (subRecord) {
    await prisma.subscription.update({
      where: { id: subRecord.id },
      data: { status: 'cancelled' }
    })

    // Downgrade user to free plan
    await prisma.user.update({
      where: { id: subRecord.userId },
      data: {
        subscriptionPlan: 'free',
        subscriptionStatus: 'cancelled',
        stripeSubscriptionId: null,
      }
    })
  }

  console.log(`Subscription deleted: ${subscription.id}`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string
  
  if (!subscriptionId) return

  // Find subscription
  const subRecord = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId }
  })

  if (subRecord) {
    // Create payment record
    await prisma.payment.create({
      data: {
        userId: subRecord.userId,
        stripePaymentIntentId: (invoice as any).payment_intent as string,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        description: `Payment for ${subRecord.plan} plan`,
      }
    })

    // Ensure subscription is active
    await prisma.user.update({
      where: { id: subRecord.userId },
      data: { subscriptionStatus: 'active' }
    })
  }

  console.log(`Invoice paid: ${invoice.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string
  
  if (!subscriptionId) return

  const subRecord = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId }
  })

  if (subRecord) {
    // Create failed payment record
    await prisma.payment.create({
      data: {
        userId: subRecord.userId,
        stripePaymentIntentId: (invoice as any).payment_intent as string,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        description: `Failed payment for ${subRecord.plan} plan`,
      }
    })

    // Mark subscription as past due
    await prisma.user.update({
      where: { id: subRecord.userId },
      data: { subscriptionStatus: 'past_due' }
    })
  }

  console.log(`Invoice payment failed: ${invoice.id}`)
}
