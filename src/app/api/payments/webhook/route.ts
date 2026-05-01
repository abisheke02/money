import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
        // A payment was successfully captured.
        // We handle immediate upgrades in the /verify route, but you can add retry logic here.
        console.log('Webhook: Payment Captured ->', event.payload.payment.entity.id)
        break
      case 'subscription.activated':
        // Wait for recurring subscription activations
        console.log('Webhook: Subscription Activated ->', event.payload.subscription.entity.id)
        // Extract userId from notes
        const accUserId = event.payload.subscription.entity.notes?.userId
        if (accUserId) {
           await prisma.subscription.updateMany({
             where: { userId: parseInt(accUserId), status: 'pending' },
             data: { status: 'active' }
           })
        }
        break
      case 'subscription.cancelled':
      case 'payment.failed':
         console.warn('Webhook: Payment/Subscription Failed or Cancelled')
         // Demote the user if subscription fails
         const failUserId = event.payload.subscription?.entity?.notes?.userId || event.payload.payment?.entity?.notes?.userId
         if (failUserId) {
            await prisma.subscription.updateMany({
               where: { userId: parseInt(failUserId) },
               data: { status: 'cancelled' }
            })
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
  } finally {
    await prisma.$disconnect()
  }
}
