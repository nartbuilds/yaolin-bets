import { supabase } from './supabase'
import bcrypt from 'bcryptjs'
import { User } from './types'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(username: string, password: string): Promise<User | null> {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      throw new Error('Username already exists')
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password_hash: passwordHash
        }
      ])
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      username: data.username,
      paid_entry: data.paid_entry || false,
      created_at: data.created_at
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !data) {
      return null
    }

    const isValidPassword = await verifyPassword(password, data.password_hash)

    if (!isValidPassword) {
      return null
    }

    return {
      id: data.id,
      username: data.username,
      paid_entry: data.paid_entry || false,
      created_at: data.created_at
    }
  } catch (error) {
    console.error('Error logging in user:', error)
    return null
  }
}