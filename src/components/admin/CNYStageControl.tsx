'use client'

import { useState, useEffect } from 'react'

export default function CNYStageControl() {
  const [cnyStage, setCnyStage] = useState<'before_cny' | 'during_cny'>('before_cny')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (response.ok) {
        setCnyStage(data.settings.cny_stage || 'before_cny')
      } else {
        setError('Failed to load settings')
      }
    } catch (error) {
      setError('Network error loading settings')
    } finally {
      setLoading(false)
    }
  }

  const updateStage = async (newStage: 'before_cny' | 'during_cny') => {
    setUpdating(true)
    setError('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'cny_stage',
          value: newStage,
        }),
      })

      if (response.ok) {
        setCnyStage(newStage)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update stage')
      }
    } catch (error) {
      setError('Network error updating stage')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-gray-600">Loading CNY stage settings...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🏮 CNY Stage Control</h3>
        <p className="text-gray-600 text-sm">
          Control whether team compositions are visible on the leaderboard
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => updateStage('before_cny')}
            disabled={updating}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              cnyStage === 'before_cny'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🔒 Before CNY
          </button>
          <button
            onClick={() => updateStage('during_cny')}
            disabled={updating}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              cnyStage === 'during_cny'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🎉 During CNY
          </button>
        </div>

        <div className="flex-1">
          {cnyStage === 'before_cny' ? (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Current:</span> Teams are hidden on leaderboard. Users can only see their own team.
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Current:</span> All teams are visible on the leaderboard.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
