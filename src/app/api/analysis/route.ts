import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Performer, Role } from '@/lib/types'

interface RoleRanking {
  role: Role
  performers: (Performer & { rank: number })[]
  averageScore: number
  highestScore: number
  lowestScore: number
}

interface AnalysisData {
  roleRankings: RoleRanking[]
  allPerformers: Performer[]
  totalPerformers: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as Role | null
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Fetch all performers
    let query = supabase
      .from('performers')
      .select('*')
      .order('name')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: performers, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch performers' }, { status: 500 })
    }

    const roles: Role[] = ['head', 'tail', 'drum', 'gong', 'cymbal']

    // Calculate rankings for each role
    const roleRankings: RoleRanking[] = roles.map(roleType => {
      const scoreField = `score_${roleType}` as keyof Performer

      // Sort performers by their score in this role
      const sortedPerformers = [...performers]
        .sort((a, b) => (b[scoreField] as number) - (a[scoreField] as number))
        .slice(0, limit)
        .map((performer, index) => ({
          ...performer,
          rank: index + 1
        }))

      // Calculate statistics
      const scores = performers.map(p => p[scoreField] as number)
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      const highestScore = Math.max(...scores)
      const lowestScore = Math.min(...scores)

      return {
        role: roleType,
        performers: sortedPerformers,
        averageScore: Math.round(averageScore * 10) / 10,
        highestScore,
        lowestScore
      }
    })

    // If specific role requested, return only that role's data
    if (role && roles.includes(role)) {
      const roleData = roleRankings.find(r => r.role === role)
      return NextResponse.json({
        roleRanking: roleData,
        allPerformers: performers,
        totalPerformers: performers.length
      })
    }

    // Return all role rankings
    const analysisData: AnalysisData = {
      roleRankings,
      allPerformers: performers,
      totalPerformers: performers.length
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('Analysis fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}