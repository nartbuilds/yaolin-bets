import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

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

    return NextResponse.json({ performers })
  } catch (error) {
    console.error('Performers fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}