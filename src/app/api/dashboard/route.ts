import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessIdParam = searchParams.get('businessId')

    if (!businessIdParam) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }
    const businessId = parseInt(businessIdParam, 10)

    const today = new Date().toISOString().split('T')[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthStartStr = monthStart.toISOString().split('T')[0]

    // We can use aggregate or groupBy in Prisma, but for exact summary matching raw queries or separate aggregates 
    // are often easiest. Let's use Prisma's aggregate features.
    
    // 1. Total Balance & Pending
    const allCompleted = await prisma.transaction.groupBy({
      by: ['type'],
      where: { businessId, status: 'completed' },
      _sum: { amount: true }
    })
    
    let completedCredit = 0; let completedDebit = 0;
    allCompleted.forEach(grp => {
      if (grp.type === 'credit') completedCredit = grp._sum.amount ?? 0;
      if (grp.type === 'debit')  completedDebit  = grp._sum.amount ?? 0;
    })
    const totalBalance = completedCredit - completedDebit;

    const allPending = await prisma.transaction.groupBy({
      by: ['type'],
      where: { businessId, status: 'pending' },
      _sum: { amount: true }
    })
    
    let pendingAmount = 0;
    allPending.forEach(grp => {
      if (grp.type === 'credit') pendingAmount += (grp._sum.amount ?? 0);
      if (grp.type === 'debit')  pendingAmount -= (grp._sum.amount ?? 0);
    })
    const totalPending = pendingAmount;

    // 2. Today Stats
    const todayAgg = await prisma.transaction.groupBy({
      by: ['type'],
      where: { businessId, date: today },
      _sum: { amount: true }
    })
    let todayCredit = 0; let todayDebit = 0;
    todayAgg.forEach(grp => {
      if (grp.type === 'credit') todayCredit = grp._sum.amount ?? 0;
      if (grp.type === 'debit')  todayDebit  = grp._sum.amount ?? 0;
    })

    // 3. Weekly Stats
    const weekAgg = await prisma.transaction.groupBy({
      by: ['type'],
      where: { businessId, date: { gte: weekStartStr } },
      _sum: { amount: true }
    })
    let weekCredit = 0; let weekDebit = 0;
    weekAgg.forEach(grp => {
      if (grp.type === 'credit') weekCredit = grp._sum.amount ?? 0;
      if (grp.type === 'debit')  weekDebit  = grp._sum.amount ?? 0;
    })

    // 4. Monthly Stats
    const monthAgg = await prisma.transaction.groupBy({
      by: ['type'],
      where: { businessId, date: { gte: monthStartStr } },
      _sum: { amount: true }
    })
    let monthCredit = 0; let monthDebit = 0;
    monthAgg.forEach(grp => {
      if (grp.type === 'credit') monthCredit = grp._sum.amount ?? 0;
      if (grp.type === 'debit')  monthDebit  = grp._sum.amount ?? 0;
    })

    const summary = {
      totalBalance,
      totalPending,
      todayCredit,
      todayDebit,
      todayNet: todayCredit - todayDebit,
      weekCredit,
      weekDebit,
      weekNet: weekCredit - weekDebit,
      monthCredit,
      monthDebit,
      monthNet: monthCredit - monthDebit,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
