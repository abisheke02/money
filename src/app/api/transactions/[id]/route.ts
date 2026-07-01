import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { transactionSchema } from '@/lib/schemas'
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = db.get('SELECT * FROM transactions WHERE id = ?', [params.id])

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const categories = db.all('SELECT * FROM categories') as any[]
    const cat = categories.find(c => c.id === transaction.category_id)

    return NextResponse.json({
      ...transaction,
      currency: transaction.currency || 'USD',
      category: cat ? {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        created_at: cat.created_at
      } : undefined
    })
  } catch (error) {
    console.error('Transaction fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validation = transactionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }
    
    const { type, amount, category_id, business_id, currency, date, due_date, reminder_days, note, method, tags, status, client_name } = validation.data

    const { transaction, cat } = db.transaction((tx) => {
      tx.prepare(`
        UPDATE transactions
        SET type = ?, amount = ?, category_id = ?, business_id = ?, currency = ?, date = ?, due_date = ?, reminder_days = ?, note = ?, method = ?, tags = ?, status = ?, client_name = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(type, amount, category_id, business_id || null, currency, date, due_date || null, reminder_days || 3, note || null, method || null, tags || null, status || 'completed', client_name || null, params.id)

      const tr = tx.prepare('SELECT * FROM transactions WHERE id = ?').get(params.id) as any
      const categories = tx.prepare('SELECT * FROM categories').all() as any[]
      const category = categories.find(c => c.id === tr?.category_id)
      return { transaction: tr, cat: category }
    })

    return NextResponse.json({
      ...transaction,
      currency: transaction?.currency || 'USD',
      category: cat ? {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        created_at: cat.created_at
      } : undefined
    })
  } catch (error) {
    console.error('Transaction update error:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    db.transaction((tx) => {
      tx.prepare('DELETE FROM transactions WHERE id = ?').run(params.id)
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Transaction delete error:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}


