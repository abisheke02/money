import { NextRequest, NextResponse } from 'next/server'
import dbQuery from '@/lib/db'
import crypto from 'crypto'
import { registerSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const { username, email, password } = validation.data

    // Check if user exists
    const existingUser = dbQuery.get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Simple base64 hash (demo only - use bcrypt in production)
    const hash = Buffer.from(password).toString('base64')

    const userId = dbQuery.transaction((tx) => {
      const result = tx.prepare('INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)').run(
        username, email, hash, new Date().toISOString()
      )
      return result.lastInsertRowid
    })

    return NextResponse.json({ 
      message: 'User created successfully',
      userId 
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
