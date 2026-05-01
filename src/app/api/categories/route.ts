import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { CreateCategorySchema } from '@/lib/schemas'

export async function GET() {
  try {
    const categories = db.all('SELECT * FROM categories ORDER BY name ASC')
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = CreateCategorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { name, icon, color, type } = parsed.data
    const result = db.run(
      'INSERT INTO categories (name, icon, color, type) VALUES (?, ?, ?, ?)',
      [name, icon, color, type]
    )
    const created = db.get('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid])
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
