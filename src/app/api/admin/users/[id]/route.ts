import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../admin/_auth'
import dbQuery from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = parseInt(params.id)
  const user = dbQuery.get(
    `SELECT u.id, u.username, u.email, u.created_at,
            s.id as sub_id, s.plan, s.status as sub_status,
            s.started_at, s.expires_at, s.amount_paid, s.payment_method, s.notes
     FROM users u
     LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
     WHERE u.id = ? AND u.role = 'user'`,
    [userId]
  )
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const history = dbQuery.all(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  )

  return NextResponse.json({ user, subscriptionHistory: history })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = parseInt(params.id)
  const body = await request.json()
  const { plan, status, expires_at, amount_paid, payment_method, notes } = body

  const existing = dbQuery.get<{ id: number }>(
    "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'",
    [userId]
  )

  if (existing) {
    dbQuery.run(
      `UPDATE subscriptions SET plan = ?, status = ?, expires_at = ?, amount_paid = ?,
       payment_method = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
      [plan, status, expires_at ?? null, amount_paid ?? 0, payment_method ?? null, notes ?? null, existing.id]
    )
  } else {
    dbQuery.run(
      `INSERT INTO subscriptions (user_id, plan, status, expires_at, amount_paid, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, plan ?? 'free', status ?? 'active', expires_at ?? null, amount_paid ?? 0, payment_method ?? null, notes ?? null]
    )
  }

  return NextResponse.json({ success: true })
}
