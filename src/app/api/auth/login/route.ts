import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import dbQuery from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { loginSchema } from '@/lib/schemas'

const hasRealResend = () =>
  !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy_123'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }

    const { username, password } = validation.data

    const user = dbQuery.get<{
      id: number; username: string; email: string
      password: string; email_verified: number
    }>(
      'SELECT id, username, email, password, email_verified FROM users WHERE username = ? OR email = ?',
      [username, username]
    )

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Support both bcrypt (new accounts) and base64 (legacy demo/admin)
    let passwordOk = false
    if (user.password.startsWith('$2')) {
      passwordOk = await verifyPassword(password, user.password)
    } else {
      passwordOk = user.password === Buffer.from(password).toString('base64')
    }

    if (!passwordOk) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Block login if real email service is active and user hasn't verified
    if (hasRealResend() && user.email_verified === 0) {
      return NextResponse.json(
        {
          error: 'Please verify your email before logging in.',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
        },
        { status: 403 }
      )
    }

    const sessionToken = crypto.randomUUID()
    dbQuery.run(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()]
    )

    return NextResponse.json({ message: 'Login successful', userId: user.id, sessionToken })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
