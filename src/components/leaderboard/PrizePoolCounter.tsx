'use client'

import { useState, useEffect } from 'react'

interface PrizePoolData {
  totalParticipants: number
  paidParticipants: number
  prizePool: number
}

export default function PrizePoolCounter() {
  const [data, setData] = useState<PrizePoolData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPrizePoolData()
  }, [])

  const fetchPrizePoolData = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const result = await response.json()

      if (response.ok) {
        // Count paid and total participants
        const paidCount = result.leaderboard.filter((entry: any) => entry.paid_entry).length
        const totalCount = result.leaderboard.length
        const prizeAmount = paidCount * 5 // $5 per paid participant

        setData({
          totalParticipants: totalCount,
          paidParticipants: paidCount,
          prizePool: prizeAmount
        })
      } else {
        setError('Failed to load prize pool data')
      }
    } catch (error) {
      setError('Network error loading prize pool')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-center">
        <div className="text-white">Loading prize pool...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-400 to-pink-500 rounded-lg shadow-lg p-6 text-center">
        <div className="text-white">{error}</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6">
      <div className="text-white text-center">
        <h3 className="text-2xl font-bold mb-4">💰 Current Prize Pool</h3>
        <div className="text-4xl font-bold mb-4">${data.prizePool}</div>
        <div className="flex justify-center gap-6 text-sm">
          <div>
            <span className="font-semibold">💰 Paid: {data.paidParticipants}</span>
          </div>
          <div>
            <span className="font-semibold">🆓 Free: {data.totalParticipants - data.paidParticipants}</span>
          </div>
        </div>
      </div>
    </div>
  )
}