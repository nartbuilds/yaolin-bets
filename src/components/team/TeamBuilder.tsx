'use client'

import { useState, useEffect } from 'react'
import { Performer, Role, TeamSelection, TeamWithDetails } from '@/lib/types'
import PerformerCard from './PerformerCard'
import RoleSlot from './RoleSlot'

export default function TeamBuilder() {
  const [performers, setPerformers] = useState<Performer[]>([])
  const [currentTeam, setCurrentTeam] = useState<TeamWithDetails | null>(null)
  const [selection, setSelection] = useState<TeamSelection>({
    head_id: null,
    tail_id: null,
    drum_id: null,
    gong_id: null,
    cymbal_id: null,
  })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPerformers()
    fetchCurrentTeam()
  }, [])

  const fetchPerformers = async (searchTerm = '') => {
    try {
      const url = searchTerm
        ? `/api/performers?search=${encodeURIComponent(searchTerm)}`
        : '/api/performers'

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setPerformers(data.performers)
      } else {
        setError('Failed to load performers')
      }
    } catch (error) {
      setError('Network error loading performers')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentTeam = async () => {
    try {
      const response = await fetch('/api/teams')
      const data = await response.json()

      if (response.ok && data.team) {
        setCurrentTeam(data.team)
        setSelection({
          head_id: data.team.head_id,
          tail_id: data.team.tail_id,
          drum_id: data.team.drum_id,
          gong_id: data.team.gong_id,
          cymbal_id: data.team.cymbal_id,
        })
      }
    } catch (error) {
      console.error('Failed to fetch current team:', error)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    fetchPerformers(value)
  }

  const selectPerformer = (performer: Performer, role: Role) => {
    // Check if this performer is already assigned to another role
    const currentlyAssignedRole = Object.entries(selection).find(
      ([key, id]) => id === performer.id && key !== `${role}_id`
    )

    if (currentlyAssignedRole) {
      // Remove performer from their current role before assigning to new role
      const [currentRoleKey] = currentlyAssignedRole
      setSelection(prev => ({
        ...prev,
        [currentRoleKey]: null,
        [`${role}_id`]: performer.id
      }))
    } else {
      setSelection(prev => ({
        ...prev,
        [`${role}_id`]: performer.id
      }))
    }
    setError('')
    setSuccess('')
  }

  const clearRole = (role: Role) => {
    setSelection(prev => ({
      ...prev,
      [`${role}_id`]: null
    }))
  }

  const getSelectedPerformer = (role: Role): Performer | null => {
    const selectedId = selection[`${role}_id` as keyof TeamSelection]
    if (!selectedId) return null
    return performers.find(p => p.id === selectedId) || null
  }

  const isPerformerSelected = (performer: Performer): boolean => {
    return Object.values(selection).includes(performer.id)
  }

  const getPerformerAssignedRole = (performer: Performer): Role | undefined => {
    for (const role of ['head', 'tail', 'drum', 'gong', 'cymbal'] as Role[]) {
      if (selection[`${role}_id` as keyof TeamSelection] === performer.id) {
        return role
      }
    }
    return undefined
  }

  const canSave = (): boolean => {
    return Object.values(selection).every(id => id !== null)
  }

  const calculateScore = (): number => {
    if (!canSave()) return 0

    const head = performers.find(p => p.id === selection.head_id)
    const tail = performers.find(p => p.id === selection.tail_id)
    const drum = performers.find(p => p.id === selection.drum_id)
    const gong = performers.find(p => p.id === selection.gong_id)
    const cymbal = performers.find(p => p.id === selection.cymbal_id)

    if (!head || !tail || !drum || !gong || !cymbal) return 0

    return head.score_head + tail.score_tail + drum.score_drum + gong.score_gong + cymbal.score_cymbal
  }

  const saveTeam = async () => {
    if (!canSave()) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selection),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Team saved successfully!')
        fetchCurrentTeam()
      } else {
        setError(data.error || 'Failed to save team')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading performers...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Team Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Team</h2>
          <p className="text-gray-600 mt-2">
            Select one performer for each role. Scores will be revealed after the competition!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(['head', 'tail', 'drum', 'gong', 'cymbal'] as Role[]).map((role) => (
            <RoleSlot
              key={role}
              role={role}
              performer={getSelectedPerformer(role)}
              onClear={() => clearRole(role)}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={saveTeam}
            disabled={!canSave() || saving}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Team'}
          </button>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </div>
      </div>

      {/* Performer Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Available Performers</h3>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search performers..."
            value={search}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performers.map((performer) => (
            <PerformerCard
              key={performer.id}
              performer={performer}
              isSelected={isPerformerSelected(performer)}
              assignedRole={getPerformerAssignedRole(performer)}
              className={isPerformerSelected(performer) ? 'opacity-50' : ''}
              showRoleButtons={true}
              onRoleSelect={selectPerformer}
            />
          ))}
        </div>
      </div>
    </div>
  )
}