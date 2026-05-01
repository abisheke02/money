import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { CreateTransactionSchema, TransactionFiltersSchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = TransactionFiltersSchema.safeParse(Object.fromEntries(searchParams.entries()))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query params' }, { status: 400 })
    }
    const { businessId, startDate, endDate, type, categoryId, method, search, sortBy, sortOrder, page, limit } = parsed.data

    const conditions: string[] = []
    const params: unknown[] = []

    if (businessId)  { conditions.push('t.business_id = ?');  params.push(businessId) }
    if (startDate)   { conditions.push('t.date >= ?');         params.push(startDate) }
    if (endDate)     { conditions.push('t.date <= ?');         params.push(endDate) }
    if (categoryId)  { conditions.push('t.category_id = ?');   params.push(categoryId) }
    if (method)      { conditions.push('t.method = ?');        params.push(method) }
    if (type === 'pending') {
      conditions.push("t.status = 'pending'")
    } else if (type) {
      conditions.push('t.type = ?'); params.push(type)
    }
    if (search) {
      conditions.push('(t.note LIKE ? OR t.tags LIKE ? OR t.client_name LIKE ?)')
      const like = `%${search}%`
      params.push(like, like, like)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const order = `ORDER BY t.${sortBy === 'amount' ? 'amount' : 'date'} ${sortOrder.toUpperCase()}, t.id DESC`
    const offset = (page - 1) * limit

    const countRow = db.get<{ total: number }>(
      `SELECT COUNT(*) as total FROM transactions t ${where}`,
      params
    )
    const total = countRow?.total ?? 0

    const rows = db.all(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.type as category_type
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       ${where} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return NextResponse.json({ transactions: rows, total, page, limit })
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = CreateTransactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { type, amount, category_id, business_id, currency, date, due_date, reminder_days, note, method, tags, status, client_name } = parsed.data
    const result = db.run(
      `INSERT INTO transactions (type, amount, category_id, business_id, currency, date, due_date, reminder_days, note, method, tags, status, client_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, amount, category_id, business_id ?? null, currency, date, due_date ?? null, reminder_days, note ?? null, method ?? null, tags ?? null, status, client_name ?? null]
    )
    const created = db.get('SELECT * FROM transactions WHERE id = ?', [result.lastInsertRowid])
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Failed to create transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
