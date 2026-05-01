import { NextRequest, NextResponse } from 'next/server'
import razorpay from '@/lib/razorpay'

// Map plans to their INR amounts (in paise)
const PLAN_PRICING = {
  pro: 199 * 100,
  premium: 499 * 100,
}

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = await request.json()

    if (!plan || (plan !== 'pro' && plan !== 'premium')) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING]

    // Create an order via Razorpay API
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_user_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        plan,
      }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Razorpay Create Order Error:', error)
    return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 })
  }
}
