import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { businessSchema } from '@/lib/schemas'

export async function GET() {
  try {
    const businesses = db.all('SELECT * FROM businesses ORDER BY created_at ASC')
    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Failed to fetch businesses:', error)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = businessSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }
    
    const { name } = validation.data
    const now = new Date().toISOString()
    const newBusiness = db.transaction((tx) => {
      const result = tx.prepare('INSERT INTO businesses (name, created_at) VALUES (?, ?)').run(name, now)
      return tx.prepare('SELECT * FROM businesses WHERE id = ?').get(result.lastInsertRowid)
    })
    return NextResponse.json(newBusiness, { status: 201 })
  } catch (error) {
    console.error('Failed to create business:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}
