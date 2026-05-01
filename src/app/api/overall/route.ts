import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    // 1. Get Grand Totals across ALL businesses
    const grandTotals = db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as totalExpense,
        COALESCE(SUM(CASE WHEN status = 'pending' AND type = 'credit' THEN amount WHEN status = 'pending' AND type = 'debit' THEN -amount ELSE 0 END), 0) as totalPending
      FROM transactions
    `)

    const totalIncome = grandTotals?.totalIncome || 0
    const totalExpense = grandTotals?.totalExpense || 0
    const totalPending = grandTotals?.totalPending || 0
    const netProfit = totalIncome - totalExpense

    // 2. Get breakdown per business
    const businessBreakdown = db.all(`
      SELECT 
        b.id,
        b.name,
        COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as expense,
        COALESCE(SUM(CASE WHEN t.status = 'pending' AND t.type = 'credit' THEN t.amount WHEN t.status = 'pending' AND t.type = 'debit' THEN -t.amount ELSE 0 END), 0) as pending
      FROM businesses b
      LEFT JOIN transactions t ON b.id = t.business_id
      GROUP BY b.id, b.name
      ORDER BY b.name ASC
    `)

    const formattedBreakdown = businessBreakdown.map((b: any) => ({
      id: b.id,
      name: b.name,
      income: b.income,
      expense: b.expense,
      pending: b.pending,
      netProfit: b.income - b.expense
    }))

    return NextResponse.json({
      grandTotal: {
        income: totalIncome,
        expense: totalExpense,
        pending: totalPending,
        netProfit: netProfit
      },
      breakdown: formattedBreakdown
    })
  } catch (error) {
    console.error('Overall summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch overall data' }, { status: 500 })
  }
}
