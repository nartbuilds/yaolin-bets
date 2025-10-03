'use client'

import { useState } from 'react'

interface User {
  id: string
  username: string
  paid_entry: boolean
  created_at: string
}

interface UserPaidControlsProps {
  users: User[]
  onUsersUpdate: () => void
}

export default function UserPaidControls({ users, onUsersUpdate }: UserPaidControlsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, boolean>>({})

  const togglePaidStatus = async (userId: string, currentPaid: boolean) => {
    setLoading(userId)
    setError('')
    setSuccess('')

    // Optimistic update - show change immediately
    const newPaidStatus = !currentPaid
    setOptimisticUpdates(prev => ({ ...prev, [userId]: newPaidStatus }))

    try {
      const response = await fetch('/api/admin/users/paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          paid: !currentPaid
        }),
      })

      if (response.ok) {
        setSuccess(`User payment status updated successfully!`)
        onUsersUpdate()
        // Clear optimistic update after successful API call
        setOptimisticUpdates(prev => {
          const updated = { ...prev }
          delete updated[userId]
          return updated
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update user payment status')
        // Revert optimistic update on error
        setOptimisticUpdates(prev => {
          const updated = { ...prev }
          delete updated[userId]
          return updated
        })
      }
    } catch (error) {
      setError('Network error. Please try again.')
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const updated = { ...prev }
        delete updated[userId]
        return updated
      })
    } finally {
      setLoading(null)
      setTimeout(() => {
        setSuccess('')
        setError('')
      }, 3000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">User Payment Status</h3>
          <p className="text-gray-600 text-sm mt-1">
            Toggle between free play and paid entry for prize pool eligibility
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-2">
        {users.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No users found.
          </div>
        ) : (
          users.map((user) => {
            // Use optimistic update if available, otherwise use real data
            const effectivePaidStatus = optimisticUpdates.hasOwnProperty(user.id)
              ? optimisticUpdates[user.id]
              : user.paid_entry

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {effectivePaidStatus ? '💰' : '🆓'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">
                      {effectivePaidStatus ? 'Paid Entry' : 'Free Play'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => togglePaidStatus(user.id, effectivePaidStatus)}
                  disabled={loading === user.id}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${effectivePaidStatus
                      ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {loading === user.id
                    ? 'Updating...'
                    : effectivePaidStatus
                      ? 'Set to Free'
                      : 'Set to Paid'
                  }
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}