import { NextRequest, NextResponse } from 'next/server'
import dbQuery from '@/lib/db'
import { settingsSchema } from '@/lib/schemas'

export async function GET() {
  try {
    const setting = dbQuery.get('SELECT value FROM settings WHERE key = ?', ['defaultCurrency'])
    
    return NextResponse.json({
      defaultCurrency: setting?.value || 'USD',
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = settingsSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { defaultCurrency } = validation.data
    
    // Update or insert the setting
    const setting = dbQuery.transaction((tx) => {
      tx.prepare('UPDATE settings SET value = ? WHERE key = ?').run(defaultCurrency, 'defaultCurrency')
      return tx.prepare('SELECT value FROM settings WHERE key = ?').get('defaultCurrency') as any
    })
    
    return NextResponse.json({
      success: true,
      defaultCurrency: setting?.value || defaultCurrency,
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
