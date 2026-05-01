import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { parseQuery, TransactionFiltersSchema, parseBody, CreateTransactionSchema } from '@/lib/schemas'
import type { PaginatedTransactions } from '@/types'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = parseQuery(TransactionFiltersSchema, searchParams)
    if (parsed.error) return parsed.error

    const { businessId, startDate, endDate, type, categoryId, method, search, sortBy, sortOrder, page, limit } = parsed.data

    const whereClause: Prisma.TransactionWhereInput = {}

    if (businessId) whereClause.businessId = businessId
    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) whereClause.date.gte = startDate
      if (endDate) whereClause.date.lte = endDate
    }
    
    if (type === 'pending') {
      whereClause.status = 'pending'
    } else if (type) {
      whereClause.type = type
    }
    
    if (categoryId) whereClause.categoryId = categoryId
    if (method) whereClause.method = method
    
    if (search) {
      whereClause.OR = [
        { note: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const orderCol = sortBy === 'amount' ? 'amount' : 'date'
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc'
    const offset = (page - 1) * limit

    const [transactionsData, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: {
          [orderCol]: orderDir
        },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({
        where: whereClause
      })
    ])

    const transactions = transactionsData.map((t) => ({
      id: t.id,
      type: t.type as 'credit' | 'debit',
      amount: t.amount,
      category_id: t.categoryId ?? 0,
      business_id: t.businessId ?? undefined,
      currency: t.currency,
      date: t.date,
      due_date: t.dueDate ?? undefined,
      reminder_days: t.reminderDays,
      note: t.note,
      method: t.method ?? undefined,
      tags: t.tags ?? undefined,
      status: t.status,
      client_name: t.clientName ?? undefined,
      created_at: t.createdAt.toISOString(),
      updated_at: t.updatedAt.toISOString(),
      category: t.category ? {
        id: t.category.id,
        name: t.category.name,
        icon: t.category.icon ?? '',
        color: t.category.color,
        type: t.category.type as 'credit' | 'debit' | 'both',
        created_at: t.category.createdAt.toISOString()
      } : undefined,
    }))

    const result: PaginatedTransactions = { transactions, total, page, totalPages: Math.ceil(total / limit) }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const parsed = parseBody(CreateTransactionSchema, await request.json())
    if (parsed.error) return parsed.error

    const d = parsed.data
    
    const newTransaction = await prisma.transaction.create({
      data: {
        type: d.type,
        amount: d.amount,
        categoryId: d.category_id,
        businessId: d.business_id,
        currency: d.currency,
        date: d.date,
        dueDate: d.due_date,
        reminderDays: d.reminder_days || 3,
        note: d.note,
        method: d.method,
        tags: d.tags,
        status: d.status,
        clientName: d.client_name
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      id: newTransaction.id,
      type: newTransaction.type,
      amount: newTransaction.amount,
      category_id: newTransaction.categoryId,
      business_id: newTransaction.businessId,
      currency: newTransaction.currency,
      date: newTransaction.date,
      due_date: newTransaction.dueDate,
      reminder_days: newTransaction.reminderDays,
      note: newTransaction.note,
      method: newTransaction.method,
      tags: newTransaction.tags,
      status: newTransaction.status,
      client_name: newTransaction.clientName,
      created_at: newTransaction.createdAt.toISOString(),
      updated_at: newTransaction.updatedAt.toISOString(),
      category: newTransaction.category ? {
        id: newTransaction.category.id,
        name: newTransaction.category.name,
        icon: newTransaction.category.icon,
        color: newTransaction.category.color,
        type: newTransaction.category.type
      } : undefined
    }, { status: 201 })
  } catch (error) {
    console.error('Transaction create error:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
