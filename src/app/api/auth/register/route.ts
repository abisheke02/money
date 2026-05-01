import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import dbQuery from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { registerSchema } from '@/lib/schemas'
import { sendVerificationEmail } from '@/lib/email/resend'

const hasRealResend = () =>
  !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy_123'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? 'Validation error' }, { status: 400 })
    }

    const { username, email, password } = validation.data

    const existing = dbQuery.get<{ id: number }>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )
    if (existing) {
      return NextResponse.json({ error: 'Username or email already in use' }, { status: 409 })
    }

    const hash = await hashPassword(password)

    // Auto-verify when no real email service is configured (dev/demo)
    const autoVerify = !hasRealResend() ? 1 : 0

    const result = dbQuery.run(
      "INSERT INTO users (username, email, password, role, email_verified) VALUES (?, ?, ?, 'user', ?)",
      [username, email, hash, autoVerify]
    )
    const userId = result.lastInsertRowid as number

    if (hasRealResend()) {
      const token = crypto.randomBytes(3).toString('hex').toUpperCase()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      dbQuery.run(
        'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      )

      try {
        await sendVerificationEmail(email, token, username)
      } catch (err) {
        console.error('[register] Email send failed:', err)
        // Don't block registration if email fails — user can resend
      }

      return NextResponse.json(
        { message: 'Account created. Check your email to verify.', userId },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { message: 'Account created successfully.', userId },
      { status: 201 }
    )
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
