import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { parseQuery, TransactionFiltersSchema, parseBody, CreateTransactionSchema } from '@/lib/schemas'
import type { PaginatedTransactions } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = parseQuery(TransactionFiltersSchema, searchParams)
    if (parsed.error) return parsed.error

    const { businessId, startDate, endDate, type, categoryId, method, search, sortBy, sortOrder, page, limit } = parsed.data

    const conditions: string[] = []
    const params: unknown[] = []

    if (businessId) { conditions.push('t.business_id = ?'); params.push(businessId) }
    if (startDate)  { conditions.push('t.date >= ?');       params.push(startDate) }
    if (endDate)    { conditions.push('t.date <= ?');       params.push(endDate) }
    if (type === 'pending') {
      conditions.push("t.status = 'pending'")
    } else if (type) {
      conditions.push('t.type = ?'); params.push(type)
    }
    if (categoryId) { conditions.push('t.category_id = ?'); params.push(categoryId) }
    if (method)     { conditions.push('t.method = ?');      params.push(method) }
    if (search) {
      conditions.push('(t.note LIKE ? OR t.tags LIKE ? OR t.client_name LIKE ?)')
      const like = `%${search}%`
      params.push(like, like, like)
    }

    const where    = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderCol = sortBy === 'amount' ? 't.amount' : 't.date'
    const orderDir = sortOrder === 'asc' ? 'ASC' : 'DESC'
    const offset   = (page - 1) * limit

    const countRow = db.get<{ total: number }>(`SELECT COUNT(*) as total FROM transactions t ${where}`, params)
    const total    = countRow?.total ?? 0

    const rows = db.all<Record<string, unknown>>(
      `SELECT t.*, c.id as cat_id, c.name as cat_name, c.icon as cat_icon, c.color as cat_color, c.type as cat_type
       FROM transactions t LEFT JOIN categories c ON c.id = t.category_id
       ${where} ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transactions = rows.map((t: any) => ({
      id: t.id as number, type: t.type as 'credit'|'debit', amount: t.amount as number,
      category_id: t.category_id as number, business_id: t.business_id as number | undefined,
      currency: (t.currency as string) || 'INR',
      date: t.date as string, due_date: (t.due_date as string | null) ?? undefined,
      reminder_days: t.reminder_days as number, note: t.note as string | null,
      method: t.method as string | null, tags: t.tags as string | null,
      status: t.status as string, client_name: t.client_name as string | null,
      created_at: t.created_at as string, updated_at: t.updated_at as string,
      category: t.cat_id ? { id: t.cat_id as number, name: t.cat_name as string, icon: t.cat_icon as string, color: t.cat_color as string, type: t.cat_type as 'credit'|'debit'|'both', created_at: '' } : undefined,
    }))

    const result: PaginatedTransactions = { transactions, total, page, totalPages: Math.ceil(total / limit) }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const parsed = parseBody(CreateTransactionSchema, await request.json())
    if (parsed.error) return parsed.error

    const d = parsed.data
    const row = db.transaction(tx => {
      const res = tx.prepare(`
        INSERT INTO transactions (type, amount, category_id, business_id, currency, date, due_date, reminder_days, note, method, tags, status, client_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(d.type, d.amount, d.category_id, d.business_id ?? null, d.currency, d.date, d.due_date ?? null, d.reminder_days, d.note ?? null, d.method ?? null, d.tags ?? null, d.status, d.client_name ?? null)

      return tx.prepare(`
        SELECT t.*, c.id as cat_id, c.name as cat_name, c.icon as cat_icon, c.color as cat_color, c.type as cat_type
        FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.id = ?
      `).get(res.lastInsertRowid) as Record<string, unknown>
    })

    return NextResponse.json({
      ...row, currency: row.currency || 'INR',
      category: row.cat_id ? { id: row.cat_id, name: row.cat_name, icon: row.cat_icon, color: row.cat_color, type: row.cat_type } : undefined,
    }, { status: 201 })
  } catch (error) {
    console.error('Transaction create error:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
