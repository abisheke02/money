import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { sendPlanUpgradeEmail } from '@/lib/email/resend'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !plan) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || ''

    // Verify HMAC Signature according to Razorpay security docs
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment logic signature mismatch' }, { status: 400 })
    }

    // Payment genuine! Update user Subscription in DB
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 1) // Add 1 month

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } })

    if (user) {
      // Create or Update Subscription Model
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: plan, // 'pro' | 'premium'
          status: 'active',
          expiresAt: expiryDate,
          amountPaid: plan === 'premium' ? 499 : 199,
          paymentMethod: 'razorpay',
          notes: `Order ID: ${razorpay_order_id} | Payment ID: ${razorpay_payment_id}`
        }
      })

      // Send the email receipt
      await sendPlanUpgradeEmail(user.email, plan, expiryDate)
    }

    return NextResponse.json({ success: true, message: 'Payment verified and plan upgraded.' })
  } catch (error) {
    console.error('Razorpay Verify Error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
