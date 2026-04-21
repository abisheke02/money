import { NextRequest, NextResponse } from 'next/server'
import dbQuery from '@/lib/db'
import crypto from 'crypto'
import { loginSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const { username, password } = validation.data

    // Find user by username or email
    const user = dbQuery.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, username]
    )

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check password (base64 match for demo)
    const hash = Buffer.from(password).toString('base64')

    const userWithPass = dbQuery.get(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND password = ?',
      [username, username, hash]
    )

    if (!userWithPass) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Set session (client-side localStorage)
    const sessionToken = crypto.randomUUID()

    // Store session (simple table for demo)
    dbQuery.transaction((tx) => {
      tx.prepare('INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(token) DO NOTHING').run(
        userWithPass.id, sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString()
      )
    })

    return NextResponse.json({ 
      message: 'Login successful',
      userId: userWithPass.id,
      sessionToken
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
