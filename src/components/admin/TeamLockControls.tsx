'use client'

import { useState } from 'react'

interface Team {
  id: string
  total_score: number
  locked: boolean
  updated_at: string
  users: { username: string }
  head: { name: string }
  tail: { name: string }
  drum: { name: string }
  gong: { name: string }
  cymbal: { name: string }
}

interface TeamLockControlsProps {
  teams: Team[]
  onTeamsUpdate: () => void
}

export default function TeamLockControls({ teams, onTeamsUpdate }: TeamLockControlsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const toggleTeamLock = async (teamId: string, currentLocked: boolean) => {
    setLoading(teamId)
    setMessage('')

    try {
      const response = await fetch('/api/admin/teams/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          locked: !currentLocked
        })
      })

      if (response.ok) {
        setMessage(`Team ${!currentLocked ? 'locked' : 'unlocked'} successfully`)
        onTeamsUpdate()
      } else {
        const data = await response.json()
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Network error occurred')
    } finally {
      setLoading(null)
    }
  }

  const bulkAction = async (action: 'lockAll' | 'unlockAll') => {
    setLoading('bulk')
    setMessage('')

    try {
      const response = await fetch('/api/admin/teams/lock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [action]: true })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(data.message)
        onTeamsUpdate()
      } else {
        const data = await response.json()
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Network error occurred')
    } finally {
      setLoading(null)
    }
  }

  const lockedCount = teams.filter(team => team.locked).length
  const unlockedCount = teams.length - lockedCount

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team Lock Controls</h2>
          <p className="text-gray-600 mt-1">
            {lockedCount} locked • {unlockedCount} unlocked • {teams.length} total teams
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => bulkAction('lockAll')}
            disabled={loading === 'bulk'}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading === 'bulk' ? 'Processing...' : '🔒 Lock All'}
          </button>
          <button
            onClick={() => bulkAction('unlockAll')}
            disabled={loading === 'bulk'}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading === 'bulk' ? 'Processing...' : '🔓 Unlock All'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {team.users.username}
                </td>
                <td className="px-4 py-3 text-2xl font-bold text-red-600">
                  {team.total_score}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {[team.head.name, team.tail.name, team.drum.name, team.gong.name, team.cymbal.name]
                    .join(', ')
                    .substring(0, 50)}...
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    team.locked
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {team.locked ? '🔒 Locked' : '🔓 Unlocked'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleTeamLock(team.id, team.locked)}
                    disabled={loading === team.id}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      team.locked
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } disabled:opacity-50`}
                  >
                    {loading === team.id
                      ? 'Loading...'
                      : team.locked
                      ? 'Unlock'
                      : 'Lock'
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}