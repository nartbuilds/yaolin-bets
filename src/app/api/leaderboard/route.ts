import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    // Get current user session
    const session = await getSession()
    const currentUserId = session?.userId || null

    // Check CNY stage setting
    const { data: stageData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'cny_stage')
      .single()

    const cnyStage = stageData?.value || 'before_cny'

    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        user_id,
        updated_at,
        users!teams_user_id_fkey (
          username,
          paid_entry
        ),
        head:performers!teams_head_id_fkey (
          id, name, avatar_url, score_head, score_tail, score_drum, score_gong, score_cymbal
        ),
        tail:performers!teams_tail_id_fkey (
          id, name, avatar_url, score_head, score_tail, score_drum, score_gong, score_cymbal
        ),
        drum:performers!teams_drum_id_fkey (
          id, name, avatar_url, score_head, score_tail, score_drum, score_gong, score_cymbal
        ),
        gong:performers!teams_gong_id_fkey (
          id, name, avatar_url, score_head, score_tail, score_drum, score_gong, score_cymbal
        ),
        cymbal:performers!teams_cymbal_id_fkey (
          id, name, avatar_url, score_head, score_tail, score_drum, score_gong, score_cymbal
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Transform the data and calculate scores
    const leaderboardWithScores = teams.map((team: Record<string, any>) => {
      // Determine if we should reveal this team's performers
      const shouldReveal = cnyStage === 'during_cny' || team.user_id === currentUserId

      // Calculate total score from performers
      const totalScore = shouldReveal && team.head && team.tail && team.drum && team.gong && team.cymbal
        ? team.head.score_head +
          team.tail.score_tail +
          team.drum.score_drum +
          team.gong.score_gong +
          team.cymbal.score_cymbal
        : 0

      return {
        id: team.id,
        user_id: team.user_id,
        username: team.users?.username || 'Unknown',
        paid_entry: team.users?.paid_entry || false,
        total_score: totalScore,
        updated_at: team.updated_at,
        revealed: shouldReveal,
        performers: shouldReveal ? {
          head: team.head,
          tail: team.tail,
          drum: team.drum,
          gong: team.gong,
          cymbal: team.cymbal,
        } : null
      }
    })

    // Sort by total score (descending), then by updated_at (descending)
    const sortedLeaderboard = leaderboardWithScores
      .sort((a, b) => {
        if (b.total_score !== a.total_score) {
          return b.total_score - a.total_score
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1
      }))

    return NextResponse.json({ leaderboard: sortedLeaderboard, cnyStage })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}