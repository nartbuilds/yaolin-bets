'use client'

import { Performer, Role } from '@/lib/types'
import PerformerCard from './PerformerCard'

interface RoleSlotProps {
  role: Role
  performer: Performer | null
  onClear: () => void
  className?: string
}

const roleLabels = {
  head: 'Head',
  tail: 'Tail',
  drum: 'Drum',
  gong: 'Gong',
  cymbal: 'Cymbal',
}

const roleEmojis = {
  head: '🦁',
  tail: '🎭',
  drum: '🥁',
  gong: '🔔',
  cymbal: '🥇',
}

export default function RoleSlot({ role, performer, onClear, className = "" }: RoleSlotProps) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{roleEmojis[role]}</span>
          <h3 className="text-lg font-semibold text-gray-800">{roleLabels[role]}</h3>
        </div>
        {performer && (
          <button
            onClick={onClear}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {performer ? (
        <PerformerCard
          performer={performer}
          role={role}
          className="!cursor-default"
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Select a performer for {roleLabels[role]}</p>
        </div>
      )}
    </div>
  )
}