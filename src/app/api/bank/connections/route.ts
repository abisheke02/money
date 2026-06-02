import { NextRequest, NextResponse } from 'next/server'
import dbQuery from '@/lib/db'
import { revokeConsent } from '@/lib/setu/client'

/**
 * GET /api/bank/connections
 * Returns the user's bank connections and their status.
 * 
 * DELETE /api/bank/connections
 * Revokes the user's active bank consent and deletes the connection.
 * Body: { connectionId: number }
 */

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = dbQuery.get<{ user_id: number }>(
      "SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime('now')",
      [token]
    )
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const connections = dbQuery.all<{
      id: number
      status: string
      bank_name: string | null
      masked_account_number: string | null
      account_type: string | null
      consent_expiry: string | null
      last_synced_at: string | null
      last_sync_error: string | null
      created_at: string
    }>(
      `SELECT id, status, bank_name, masked_account_number, account_type,
              consent_expiry, last_synced_at, last_sync_error, created_at
       FROM bank_connections
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [session.user_id]
    )

    // Also get transaction count per connection
    const connectionsWithCounts = connections.map(conn => {
      const count = dbQuery.get<{ total: number }>(
        'SELECT COUNT(*) as total FROM bank_transactions WHERE bank_connection_id = ?',
        [conn.id]
      )
      return {
        ...conn,
        transactionCount: count?.total || 0,
      }
    })

    return NextResponse.json({ connections: connectionsWithCounts })
  } catch (err) {
    console.error('[bank/connections] GET Error:', err)
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = dbQuery.get<{ user_id: number }>(
      "SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime('now')",
      [token]
    )
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { connectionId } = body

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId is required' }, { status: 400 })
    }

    // Verify the connection belongs to this user
    const connection = dbQuery.get<{ id: number; consent_id: string | null; status: string }>(
      'SELECT id, consent_id, status FROM bank_connections WHERE id = ? AND user_id = ?',
      [connectionId, session.user_id]
    )

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Revoke consent with Setu if it's active
    if (connection.consent_id && connection.status === 'active') {
      try {
        await revokeConsent(connection.consent_id)
      } catch (err) {
        console.warn('[bank/connections] Failed to revoke on Setu (may already be revoked):', err)
        // Continue with local deletion regardless
      }
    }

    // Delete associated bank transactions first, then the connection
    dbQuery.transaction((db) => {
      db.prepare('DELETE FROM bank_transactions WHERE bank_connection_id = ?').run(connectionId)
      db.prepare('DELETE FROM bank_connections WHERE id = ?').run(connectionId)
    })

    return NextResponse.json({
      success: true,
      message: 'Bank connection revoked and data deleted.',
    })
  } catch (err) {
    console.error('[bank/connections] DELETE Error:', err)
    return NextResponse.json({ error: 'Failed to revoke connection' }, { status: 500 })
  }
}
