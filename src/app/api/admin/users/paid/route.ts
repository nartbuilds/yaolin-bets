import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { userId, paid } = await request.json()

    if (!userId || typeof paid !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and paid status are required' },
        { status: 400 }
      )
    }

    // Update paid_entry status in database
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ paid_entry: paid })
      .eq('id', userId)
      .select('id, username, paid_entry')
      .single()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
    }

    return NextResponse.json({
      user: data,
      message: 'Payment status updated successfully'
    })
  } catch (error) {
    console.error('Admin update user paid status error:', error)
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
}