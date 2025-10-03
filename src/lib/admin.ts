import { supabase } from './supabase'
import { getSession } from './session'

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session) return false

    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', session.userId)
      .single()

    if (error || !data) return false

    return data.is_admin || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const adminStatus = await isAdmin()
  if (!adminStatus) {
    throw new Error('Admin access required')
  }
  return true
}