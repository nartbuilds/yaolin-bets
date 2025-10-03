import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { TeamSelectionSchema } from '@/lib/validation'
import { Performer } from '@/lib/types'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = TeamSelectionSchema.parse(body)

    // Check CNY stage - teams are locked during CNY
    const { data: stageData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'cny_stage')
      .single()

    const cnyStage = stageData?.value || 'before_cny'

    if (cnyStage === 'during_cny') {
      return NextResponse.json({ error: 'Teams are locked during CNY and cannot be updated' }, { status: 403 })
    }

    // Fetch all selected performers to calculate total score
    const { data: performers, error: performerError } = await supabase
      .from('performers')
      .select('*')
      .in('id', [
        validatedData.head_id,
        validatedData.tail_id,
        validatedData.drum_id,
        validatedData.gong_id,
        validatedData.cymbal_id,
      ])

    if (performerError || !performers || performers.length !== 5) {
      return NextResponse.json({ error: 'Invalid performer selection' }, { status: 400 })
    }

    // Calculate total score
    const performerMap = performers.reduce((acc, performer) => {
      acc[performer.id] = performer
      return acc
    }, {} as Record<string, Performer>)

    const totalScore =
      performerMap[validatedData.head_id].score_head +
      performerMap[validatedData.tail_id].score_tail +
      performerMap[validatedData.drum_id].score_drum +
      performerMap[validatedData.gong_id].score_gong +
      performerMap[validatedData.cymbal_id].score_cymbal

    // Upsert team (update if exists for this user, insert if not)
    const { data, error } = await supabase
      .from('teams')
      .upsert({
        user_id: session.userId,
        head_id: validatedData.head_id,
        tail_id: validatedData.tail_id,
        drum_id: validatedData.drum_id,
        gong_id: validatedData.gong_id,
        cymbal_id: validatedData.cymbal_id,
        total_score: totalScore,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save team' }, { status: 500 })
    }

    return NextResponse.json({ team: data })
  } catch (error) {
    console.error('Team save error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        head:performers!teams_head_id_fkey(*),
        tail:performers!teams_tail_id_fkey(*),
        drum:performers!teams_drum_id_fkey(*),
        gong:performers!teams_gong_id_fkey(*),
        cymbal:performers!teams_cymbal_id_fkey(*)
      `)
      .eq('user_id', session.userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
    }

    return NextResponse.json({ team: team || null })
  } catch (error) {
    console.error('Team fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}