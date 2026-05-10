import { NextRequest, NextResponse } from 'next/server'
import dbQuery from '@/lib/db'
import { requireAdmin } from '../_auth'

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await request.json()
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both fields are required' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
  }

  const user = dbQuery.get<{ password: string }>('SELECT password FROM users WHERE id = ?', [admin.id])
  const currentHash = Buffer.from(currentPassword).toString('base64')
  if (user?.password !== currentHash) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  const newHash = Buffer.from(newPassword).toString('base64')
  dbQuery.run('UPDATE users SET password = ? WHERE id = ?', [newHash, admin.id])

  return NextResponse.json({ success: true })
}
