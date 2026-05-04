import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing Signature' }, { status: 400 })
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Handle the Razorpay Webhooks
    switch(event.event) {
      case 'payment.captured':
        console.log('Webhook: Payment Captured ->', event.payload.payment.entity.id)
        break
      case 'subscription.activated':
        console.log('Webhook: Subscription Activated ->', event.payload.subscription.entity.id)
        const accUserId = event.payload.subscription.entity.notes?.userId
        if (accUserId) {
           db.run(`UPDATE subscriptions SET status = 'active', updated_at = datetime('now') WHERE user_id = ? AND status = 'pending'`, [parseInt(accUserId)])
        }
        break
      case 'subscription.cancelled':
      case 'payment.failed':
         console.warn('Webhook: Payment/Subscription Failed or Cancelled')
         const failUserId = event.payload.subscription?.entity?.notes?.userId || event.payload.payment?.entity?.notes?.userId
         if (failUserId) {
            db.run(`UPDATE subscriptions SET status = 'cancelled', updated_at = datetime('now') WHERE user_id = ?`, [parseInt(failUserId)])
         }
         break
      default:
        console.log(`Unhandled event type: ${event.event}`)
    }

    // Acknowledge webhook immediately
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 })
  }
}
