'use client'

import { useState, useEffect } from 'react'
import { Performer, Role } from '@/lib/types'
import RoleAnalysis from './RoleAnalysis'

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

export default function PerformerAnalysis() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAnalysisData()
  }, [])

  const fetchAnalysisData = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/analysis?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setAnalysisData(data)
      } else {
        setError('Failed to load analysis data')
      }
    } catch {
      setError('Network error loading analysis data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchAnalysisData()
  }

  const roles: { value: Role | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Roles', icon: '🎭' },
    { value: 'head', label: 'Head', icon: '🦁' },
    { value: 'tail', label: 'Tail', icon: '🎭' },
    { value: 'drum', label: 'Drum', icon: '🥁' },
    { value: 'gong', label: 'Gong', icon: '🔔' },
    { value: 'cymbal', label: 'Cymbal', icon: '🥽' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading analysis data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>{error}</p>
        <button
          onClick={fetchAnalysisData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="text-center text-gray-600 py-8">
        <p>No analysis data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search performers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Search
            </button>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedRole === role.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role.icon} {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role Analysis */}
      {selectedRole === 'all' ? (
        <div className="space-y-8">
          {analysisData.roleRankings.map((roleRanking) => (
            <RoleAnalysis
              key={roleRanking.role}
              roleRanking={roleRanking}
              allPerformers={analysisData.allPerformers}
            />
          ))}
        </div>
      ) : (
        <div>
          {analysisData.roleRankings
            .filter(r => r.role === selectedRole)
            .map((roleRanking) => (
              <RoleAnalysis
                key={roleRanking.role}
                roleRanking={roleRanking}
                allPerformers={analysisData.allPerformers}
                expanded={true}
              />
            ))}
        </div>
      )}
    </div>
  )
}