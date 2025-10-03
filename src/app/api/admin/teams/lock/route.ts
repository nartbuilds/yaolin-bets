import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { teamId, locked } = await request.json()

    if (!teamId || typeof locked !== 'boolean') {
      return NextResponse.json(
        { error: 'Team ID and locked status are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('teams')
      .update({ locked })
      .eq('id', teamId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update team lock status' }, { status: 500 })
    }

    return NextResponse.json({ team: data })
  } catch (error) {
    console.error('Admin lock team error:', error)
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()

    const { lockAll, unlockAll } = await request.json()

    let updateData = {}
    if (lockAll) {
      updateData = { locked: true }
    } else if (unlockAll) {
      updateData = { locked: false }
    } else {
      return NextResponse.json(
        { error: 'Specify lockAll or unlockAll' },
        { status: 400 }
      )
    }

    // Use admin client for bulk operations and add a WHERE clause
    const { data, error } = await supabaseAdmin
      .from('teams')
      .update(updateData)
      .neq('id', '00000000-0000-0000-0000-000000000000') // Matches all records
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update teams' }, { status: 500 })
    }

    return NextResponse.json({
      message: `${lockAll ? 'Locked' : 'Unlocked'} ${data.length} teams`,
      teams: data
    })
  } catch (error) {
    console.error('Admin bulk lock error:', error)
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
}