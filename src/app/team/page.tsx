import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { isAdmin } from '@/lib/admin'
import TeamBuilder from '@/components/team/TeamBuilder'
import Header from '@/components/Header'

export default async function TeamPage() {
  const session = await getSession()

  if (!session) {
    redirect('/')
  }

  const adminStatus = await isAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} adminStatus={adminStatus} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Team Builder</h2>
          <p className="text-gray-600">
            Build your fantasy lion dance team by selecting one performer for each role.
            Each performer has different skill levels for each position.
          </p>
        </div>

        {/* Prize Pool Information */}
        <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">💰</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Join the Prize Pool!</h3>
              <p className="text-gray-600">Compete for real cash prizes</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-yellow-300">
              <h4 className="font-semibold text-gray-800 mb-2">💰 Paid Entry ($5)</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pay $5 cash to Brandon</li>
                <li>• Eligible for prize winnings</li>
                <li>• Prize pool grows with each paid entry</li>
                <li>• Winner takes the full prize pool!</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-300">
              <h4 className="font-semibold text-gray-800 mb-2">🆓 Free Play</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Play for free</li>
                <li>• Compete for fun and bragging rights</li>
                <li>• Same gameplay experience</li>
                <li>• Not eligible for cash prizes</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>How to join the prize pool:</strong> Find Brandon and pay $5 cash to be marked as a paid entry.
              You can switch to paid entry anytime before the competition starts!
            </p>
          </div>
        </div>

        <TeamBuilder />
      </main>
    </div>
  )
}