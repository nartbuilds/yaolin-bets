'use client'

import { Performer, Role } from '@/lib/types'
import Image from 'next/image'

interface PerformerCardProps {
  performer: Performer
  role?: Role
  onSelect?: (performer: Performer) => void
  onRoleSelect?: (performer: Performer, role: Role) => void
  isSelected?: boolean
  assignedRole?: Role
  className?: string
  showRoleButtons?: boolean
}

export default function PerformerCard({
  performer,
  role,
  onSelect,
  onRoleSelect,
  isSelected = false,
  assignedRole,
  className = "",
  showRoleButtons = false
}: PerformerCardProps) {
  const getRoleScore = (performer: Performer, role: Role) => {
    const scores = {
      head: performer.score_head,
      tail: performer.score_tail,
      drum: performer.score_drum,
      gong: performer.score_gong,
      cymbal: performer.score_cymbal,
    }
    return scores[role]
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    if (score >= 60) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer
        hover:shadow-md transition-shadow
        ${isSelected ? 'ring-2 ring-red-500 bg-red-50' : ''}
        ${className}
      `}
      onClick={() => onSelect?.(performer)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative w-12 h-12">
          <Image
            src={performer.avatar_url || '/default-avatar.svg'}
            alt={performer.name}
            fill
            className="rounded-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {performer.name}
          </p>
          {showRoleButtons && onRoleSelect && (
            <div className="grid grid-cols-5 gap-1 mt-2">
              {(['head', 'tail', 'drum', 'gong', 'cymbal'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRoleSelect(performer, r)
                  }}
                  className={`text-xs py-1 px-1 rounded transition-colors font-medium ${
                    assignedRole === r
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 hover:bg-red-100 text-gray-700'
                  }`}
                  title={`Select ${performer.name} for ${r}`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}