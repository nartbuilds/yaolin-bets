'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Performer } from '@/lib/types'

interface LeaderboardEntry {
  rank: number
  id: string
  user_id: string
  username: string
  paid_entry: boolean
  total_score: number
  updated_at: string
  revealed: boolean
  performers: {
    head: Performer
    tail: Performer
    drum: Performer
    gong: Performer
    cymbal: Performer
  } | null
}

export default function LeaderboardTable() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [allPerformers, setAllPerformers] = useState<Performer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchLeaderboard()
    fetchAllPerformers()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()

      if (response.ok) {
        setLeaderboard(data.leaderboard)
      } else {
        setError('Failed to load leaderboard')
      }
    } catch {
      setError('Network error loading leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllPerformers = async () => {
    try {
      const response = await fetch('/api/performers')
      const data = await response.json()

      if (response.ok) {
        setAllPerformers(data.performers)
      }
    } catch {
      // Silent fail, overall rankings just won't be shown
    }
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleRow = (teamId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(teamId)) {
        newSet.delete(teamId)
      } else {
        newSet.add(teamId)
      }
      return newSet
    })
  }

  const getPerformerRoleScore = (performer: Performer, role: string) => {
    switch (role) {
      case 'head': return performer.score_head
      case 'tail': return performer.score_tail
      case 'drum': return performer.score_drum
      case 'gong': return performer.score_gong
      case 'cymbal': return performer.score_cymbal
      default: return 0
    }
  }

  const calculateRoleRankings = () => {
    const roleRankings: { [role: string]: { [performerId: string]: number } } = {
      head: {}, tail: {}, drum: {}, gong: {}, cymbal: {}
    }

    const roles = ['head', 'tail', 'drum', 'gong', 'cymbal']

    roles.forEach(role => {
      const performersInRole = leaderboard
        .filter(entry => entry.revealed && entry.performers)
        .map(entry => ({
          id: entry.performers![role as keyof typeof entry.performers].id,
          score: getPerformerRoleScore(entry.performers![role as keyof typeof entry.performers], role)
        }))

      const sortedPerformers = performersInRole
        .sort((a, b) => b.score - a.score)
        .map((p, index) => ({ ...p, rank: index + 1 }))

      sortedPerformers.forEach(p => {
        roleRankings[role][p.id] = p.rank
      })
    })

    return roleRankings
  }

  const calculateOverallRoleRankings = () => {
    if (allPerformers.length === 0) return {}

    const overallRankings: { [role: string]: { [performerId: string]: number } } = {
      head: {}, tail: {}, drum: {}, gong: {}, cymbal: {}
    }

    const roles = ['head', 'tail', 'drum', 'gong', 'cymbal']

    roles.forEach(role => {
      const performersWithScores = allPerformers.map(performer => ({
        id: performer.id,
        score: getPerformerRoleScore(performer, role)
      }))

      const sortedPerformers = performersWithScores
        .sort((a, b) => b.score - a.score)
        .map((p, index) => ({ ...p, rank: index + 1 }))

      sortedPerformers.forEach(p => {
        overallRankings[role][p.id] = p.rank
      })
    })

    return overallRankings
  }

  const roleRankings = calculateRoleRankings()
  const overallRoleRankings = calculateOverallRoleRankings()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading leaderboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        <p>No teams on the leaderboard yet.</p>
        <p className="text-sm mt-2">Be the first to create a team!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          💡 Click on any row to view detailed team breakdown
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manager
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <>
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleRow(entry.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-center w-8">
                        {getRankDisplay(entry.rank)}
                      </div>
                      <div className="ml-2 text-gray-400">
                        {expandedRows.has(entry.id) ? '▼' : '▶'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-lg">
                      {entry.paid_entry ? '💰' : '🆓'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-red-600">
                      {entry.total_score}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.revealed && entry.performers ? (
                      <>
                        <div className="flex -space-x-2 overflow-hidden">
                          {Object.entries(entry.performers).map(([role, performer]) => (
                            <div
                              key={role}
                              className="relative w-8 h-8 rounded-full border-2 border-white"
                              title={`${role}: ${performer.name}`}
                            >
                              <Image
                                src={performer.avatar_url || '/default-avatar.svg'}
                                alt={performer.name}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.entries(entry.performers)
                            .map(([, performer]) => `${performer.name}`)
                            .join(', ')
                            .substring(0, 50)}
                          {Object.entries(entry.performers)
                            .map(([, performer]) => `${performer.name}`)
                            .join(', ').length > 50 && '...'}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        🔒 Revealed during CNY
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(entry.updated_at)}
                  </td>
                </tr>
                {expandedRows.has(entry.id) && (
                  <tr key={`${entry.id}-expanded`} className="bg-gray-50 animate-in slide-in-from-top duration-200">
                    <td colSpan={6} className="px-6 py-4 border-t border-gray-200">
                      {entry.revealed && entry.performers ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          {Object.entries(entry.performers).map(([role, performer]) => {
                          const roleScore = getPerformerRoleScore(performer, role)
                          const roleRank = roleRankings[role]?.[performer.id] || 0
                          const overallRank = overallRoleRankings[role]?.[performer.id] || 0
                          return (
                            <div key={role} className="bg-white rounded-lg p-4 shadow-sm border">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="relative w-12 h-12 rounded-full">
                                  <Image
                                    src={performer.avatar_url || '/default-avatar.svg'}
                                    alt={performer.name}
                                    fill
                                    className="rounded-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 capitalize flex items-center">
                                    {role === 'head' && '🦁'}
                                    {role === 'tail' && '🎭'}
                                    {role === 'drum' && '🥁'}
                                    {role === 'gong' && '🔔'}
                                    {role === 'cymbal' && '🥽'}
                                    <span className="ml-1">{role}</span>
                                  </h4>
                                  <p className="text-sm text-gray-600">{performer.name}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Points Contributed:</span>
                                  <span className="font-bold text-red-600">{roleScore}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Drafted Rank:</span>
                                  <span className="font-semibold text-gray-800">
                                    #{roleRank}
                                  </span>
                                </div>
                                {overallRank > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Role Rank:</span>
                                    <span className="font-semibold text-blue-600">
                                      #{overallRank}
                                    </span>
                                  </div>
                                )}
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-red-600 h-2 rounded-full"
                                    style={{ width: `${roleScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-3">🔒</div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">Team Details Hidden</h4>
                          <p className="text-gray-600">
                            Team compositions will be revealed during CNY
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}