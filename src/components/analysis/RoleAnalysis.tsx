'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Performer, Role } from '@/lib/types'

interface RoleRanking {
  role: Role
  performers: (Performer & { rank: number })[]
  averageScore: number
  highestScore: number
  lowestScore: number
}

interface RoleAnalysisProps {
  roleRanking: RoleRanking
  allPerformers: Performer[]
  expanded?: boolean
}

export default function RoleAnalysis({ roleRanking, allPerformers, expanded = false }: RoleAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(expanded)
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null)

  const getRoleIcon = (role: Role) => {
    const icons = {
      head: '🦁',
      tail: '🎭',
      drum: '🥁',
      gong: '🔔',
      cymbal: '🥽'
    }
    return icons[role]
  }

  const getPerformerRoleScore = (performer: Performer, role: Role) => {
    const scoreField = `score_${role}` as keyof Performer
    return performer[scoreField] as number
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBar = (score: number) => {
    let colorClass = 'bg-red-500'
    if (score >= 90) colorClass = 'bg-green-500'
    else if (score >= 80) colorClass = 'bg-blue-500'
    else if (score >= 70) colorClass = 'bg-yellow-500'
    else if (score >= 60) colorClass = 'bg-orange-500'

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClass} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    )
  }

  const performersToShow = !isExpanded ? [] : roleRanking.performers.slice(0, 12)

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div
        className="px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 capitalize flex items-center">
            {getRoleIcon(roleRanking.role)}
            <span className="ml-2">{roleRanking.role} Rankings</span>
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Top {roleRanking.performers.length} performers
            </span>
            <span className="text-gray-400">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {performersToShow.map((performer) => {
              const roleScore = getPerformerRoleScore(performer, roleRanking.role)
              return (
                <div
                  key={performer.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPerformer(performer)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative w-12 h-12 rounded-full">
                      <Image
                        src={performer.avatar_url || '/default-avatar.svg'}
                        alt={performer.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                      <p className="text-sm text-gray-600">Rank #{performer.rank}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className={`font-bold text-lg ${getScoreColor(roleScore)}`}>
                        {roleScore}
                      </span>
                    </div>
                    {getScoreBar(roleScore)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Performer Detail Modal */}
      {selectedPerformer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-full">
                    <Image
                      src={selectedPerformer.avatar_url || '/default-avatar.svg'}
                      alt={selectedPerformer.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedPerformer.name}</h3>
                    <p className="text-gray-600">Detailed Performance Analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPerformer(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['head', 'tail', 'drum', 'gong', 'cymbal'].map((role) => {
                  const score = getPerformerRoleScore(selectedPerformer, role as Role)
                  const allScoresForRole = allPerformers.map(p => getPerformerRoleScore(p, role as Role))
                  const sortedScores = allScoresForRole.sort((a, b) => b - a)
                  const rank = sortedScores.indexOf(score) + 1
                  const isCurrentRole = role === roleRanking.role

                  return (
                    <div
                      key={role}
                      className={`p-4 rounded-lg border-2 ${
                        isCurrentRole ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 capitalize flex items-center">
                          {getRoleIcon(role as Role)}
                          <span className="ml-1">{role}</span>
                          {isCurrentRole && (
                            <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </h4>
                        <span className="text-sm text-gray-600">#{rank}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`font-bold text-lg ${getScoreColor(score)}`}>
                            {score}
                          </span>
                        </div>
                        {getScoreBar(score)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}