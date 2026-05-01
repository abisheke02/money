import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthStartStr = monthStart.toISOString().split('T')[0]

    const totalBalance = db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as balance
      FROM transactions
      WHERE business_id = ? AND status = 'completed'
    `, [businessId])

    const totalPending = db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'pending' AND type = 'credit' THEN amount WHEN status = 'pending' AND type = 'debit' THEN -amount ELSE 0 END), 0) as pending
      FROM transactions
      WHERE business_id = ?
    `, [businessId])

    const todayStats = db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as credit,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as debit
      FROM transactions
      WHERE date = ? AND business_id = ?
    `, [today, businessId])

    const weekStats = db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as credit,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as debit
      FROM transactions
      WHERE date >= ? AND business_id = ?
    `, [weekStartStr, businessId])

    const monthStats = db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as credit,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as debit
      FROM transactions
      WHERE date >= ? AND business_id = ?
    `, [monthStartStr, businessId])

    const summary = {
      totalBalance: totalBalance?.balance || 0,
      totalPending: totalPending?.pending || 0,
      todayCredit: todayStats?.credit || 0,
      todayDebit: todayStats?.debit || 0,
      todayNet: (todayStats?.credit || 0) - (todayStats?.debit || 0),
      weekCredit: weekStats?.credit || 0,
      weekDebit: weekStats?.debit || 0,
      weekNet: (weekStats?.credit || 0) - (weekStats?.debit || 0),
      monthCredit: monthStats?.credit || 0,
      monthDebit: monthStats?.debit || 0,
      monthNet: (monthStats?.credit || 0) - (monthStats?.debit || 0),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

