import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const bookingId = session.metadata?.bookingId
      const userId = session.metadata?.userId

      if (!bookingId || !userId) {
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Create payment record
      await prisma.payment.create({
        data: {
          userId,
          bookingId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
          stripeId: session.id,
          status: 'completed',
          description: `Payment for booking ${bookingId}`,
        },
      })

      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'completed' },
      })
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

