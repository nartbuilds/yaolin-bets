'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserPaidControls from '@/components/admin/UserPaidControls'
import CNYStageControl from '@/components/admin/CNYStageControl'
import Link from 'next/link'

interface User {
  id: string
  username: string
  paid_entry: boolean
  created_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')

      if (response.status === 403) {
        router.push('/')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleUsersUpdate = () => {
    fetchUsers()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading admin panel...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🏮</span>
                <h1 className="text-2xl font-bold text-gray-800">Yaolin Bets</h1>
              </Link>
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                🛡️ Admin Panel
              </div>
            </div>

            <nav className="flex items-center space-x-6">
              <Link href="/leaderboard" className="text-gray-600 hover:text-gray-800 font-medium">
                Leaderboard
              </Link>
              <Link href="/analysis" className="text-gray-600 hover:text-gray-800 font-medium">
                Analysis
              </Link>
              <Link href="/team" className="text-gray-600 hover:text-gray-800 font-medium">
                My Team
              </Link>
              <form action="/api/auth/logout" method="post" className="inline">
                <button type="submit" className="text-red-600 hover:text-red-800 font-medium">
                  Logout
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">
            Manage CNY stage and user settings
          </p>
        </div>

        <div className="space-y-8">
          <CNYStageControl />
          <UserPaidControls users={users} onUsersUpdate={handleUsersUpdate} />
        </div>
      </main>
    </div>
  )
}