import { NextRequest, NextResponse } from 'next/server'
import dbQuery from '@/lib/db.async'
import { createConsent } from '@/lib/setu/client'
import { audit, AUDIT_ACTIONS } from '@/lib/audit'

/**
 * POST /api/bank/create-consent
 * 
 * Initiates a Setu AA consent request for the authenticated user.
 * Returns a redirect URL that the frontend should open (Setu consent approval page).
 * 
 * Body: { mobileNumber: "9XXXXXXXXX" }
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await dbQuery.get<{ user_id: number }>(
      "SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime('now')",
      [token]
    )
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = session.user_id

    // Check if user already has an active connection
    const existing = await dbQuery.get<{ id: number }>(
      "SELECT id FROM bank_connections WHERE user_id = ? AND status = 'active'",
      [userId]
    )
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active bank connection. Revoke it first to connect a new account.' },
        { status: 409 }
      )
    }

    // Parse body
    const body = await request.json()
    const { mobileNumber } = body

    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      )
    }

    // Create consent with Setu
    const { consentHandle, redirectUrl } = await createConsent(userId, mobileNumber)

    // Save to database
    await dbQuery.run(
      `INSERT INTO bank_connections (user_id, consent_handle, status, created_at, updated_at)
       VALUES (?, ?, 'pending', datetime('now'), datetime('now'))`,
      [userId, consentHandle]
    )

    audit({
      userId,
      action: AUDIT_ACTIONS.CONSENT_CREATED,
      category: 'bank_sync',
      resourceType: 'bank_connection',
      description: `Consent initiated for mobile ${mobileNumber.slice(0, 2)}****${mobileNumber.slice(-2)}`,
      request,
    })

    return NextResponse.json({
      success: true,
      consentHandle,
      redirectUrl, // Frontend opens this URL for user to approve consent
    })
  } catch (err) {
    console.error('[bank/create-consent] Error:', err)
    return NextResponse.json(
      { error: 'Failed to initiate bank connection. Please try again.' },
      { status: 500 }
    )
  }
}
