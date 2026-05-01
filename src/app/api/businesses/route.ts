import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { CreateBusinessSchema } from '@/lib/schemas'

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
    const parsed = CreateBusinessSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { name } = parsed.data
    const result = db.run('INSERT INTO businesses (name) VALUES (?)', [name.trim()])
    const created = db.get('SELECT * FROM businesses WHERE id = ?', [result.lastInsertRowid])
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Failed to create business:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}
