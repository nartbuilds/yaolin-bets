import { getSession } from '@/lib/session'
import { isAdmin } from '@/lib/admin'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import PrizePoolCounter from '@/components/leaderboard/PrizePoolCounter'
import Header from '@/components/Header'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const session = await getSession()
  const adminStatus = session ? await isAdmin() : false

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} adminStatus={adminStatus} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h2>
          <p className="text-gray-600">
            See how the top fantasy lion dance teams are performing!
          </p>
        </div>

        {/* Prize Pool Counter */}
        <div className="mb-8">
          <PrizePoolCounter />
        </div>

        <LeaderboardTable />

        {!session && (
          <div className="mt-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Join the Competition!
              </h3>
              <p className="text-red-700 mb-4">
                Create your account to build your own fantasy lion dance team and compete for the top spot.
              </p>
              <Link
                href="/register"
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 inline-block"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}