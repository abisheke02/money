import { NextRequest, NextResponse } from 'next/server'
import dbQuery from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const hash = Buffer.from(password).toString('base64')
    const user = dbQuery.get<{ id: number; username: string; email: string }>(
      "SELECT id, username, email FROM users WHERE (username = ? OR email = ?) AND password = ? AND role = 'admin'",
      [username, username, hash]
    )

    if (!user) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
    }

    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    dbQuery.run(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, sessionToken, expiresAt]
    )

    return NextResponse.json({ sessionToken, userId: user.id, username: user.username })
  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
