import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('Checkout completed:', session.id)
        
        // Update user's subscription in database
        // await updateUserSubscription(session.metadata.userId, {
        //   planId: session.metadata.planId,
        //   stripeCustomerId: session.customer as string,
        //   stripeSubscriptionId: session.subscription as string,
        //   status: 'active',
        // })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription updated:', subscription.id)
        
        // Update subscription status in database
        // await updateSubscriptionStatus(subscription.id, subscription.status)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription canceled:', subscription.id)
        
        // Handle subscription cancellation
        // await handleSubscriptionCancellation(subscription.id)

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('Invoice paid:', invoice.id)
        
        // Extend subscription period or handle payment success

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('Payment failed:', invoice.id)
        
        // Notify user of payment failure
        // await sendPaymentFailedEmail(invoice.customer_email)

        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// For Stripe CLI testing - verify endpoint is working
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
