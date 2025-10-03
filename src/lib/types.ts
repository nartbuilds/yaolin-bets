export interface User {
  id: string
  username: string
  paid_entry: boolean
  created_at: string
}

export interface Performer {
  id: string
  name: string
  avatar_url: string | null
  score_head: number
  score_tail: number
  score_drum: number
  score_gong: number
  score_cymbal: number
}

export interface Team {
  id: string
  user_id: string
  head_id: string
  tail_id: string
  drum_id: string
  gong_id: string
  cymbal_id: string
  total_score: number
  created_at: string
  updated_at: string
}

export interface TeamWithDetails extends Team {
  username: string
  paid_entry: boolean
  head: Performer
  tail: Performer
  drum: Performer
  gong: Performer
  cymbal: Performer
}

export type Role = 'head' | 'tail' | 'drum' | 'gong' | 'cymbal'

export interface TeamSelection {
  head_id: string | null
  tail_id: string | null
  drum_id: string | null
  gong_id: string | null
  cymbal_id: string | null
}