import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select(`
        id,
        locked,
        updated_at,
        users!teams_user_id_fkey (
          username
        ),
        head:performers!teams_head_id_fkey (
          name,
          score_head
        ),
        tail:performers!teams_tail_id_fkey (
          name,
          score_tail
        ),
        drum:performers!teams_drum_id_fkey (
          name,
          score_drum
        ),
        gong:performers!teams_gong_id_fkey (
          name,
          score_gong
        ),
        cymbal:performers!teams_cymbal_id_fkey (
          name,
          score_cymbal
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    // Calculate total scores dynamically
    const teamsWithScores = teams.map((team: any) => {
      const totalScore =
        (team.head?.score_head || 0) +
        (team.tail?.score_tail || 0) +
        (team.drum?.score_drum || 0) +
        (team.gong?.score_gong || 0) +
        (team.cymbal?.score_cymbal || 0)

      return {
        id: team.id,
        total_score: totalScore,
        locked: team.locked,
        updated_at: team.updated_at,
        users: team.users,
        head: team.head,
        tail: team.tail,
        drum: team.drum,
        gong: team.gong,
        cymbal: team.cymbal
      }
    })

    // Sort by total score (descending), then by updated_at (descending)
    const sortedTeams = teamsWithScores.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    return NextResponse.json({ teams: sortedTeams })
  } catch (error) {
    console.error('Admin teams fetch error:', error)
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
}