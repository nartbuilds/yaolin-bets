import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import LoginForm from '@/components/auth/LoginForm'

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect('/leaderboard')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            🏮 Yaolin Bets
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build your fantasy lion dance team before the competition!
          </p>
          <p className="text-md text-gray-500 max-w-2xl mx-auto mb-8">
            Choose 5 performers for different roles (head, tail, drum, gong, cymbal) based on your instincts.
            After the competition, scores will be revealed and the best team manager wins!
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          <div className="flex-1 max-w-md mx-auto">
            <LoginForm />
            <p className="text-center mt-4 text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-red-600 hover:text-red-700 font-semibold">
                Register here
              </Link>
            </p>
          </div>

          <div className="flex-1 max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  href="/leaderboard"
                  className="block w-full bg-yellow-500 text-white py-2 px-4 rounded-md text-center hover:bg-yellow-600 transition-colors"
                >
                  View Leaderboard
                </Link>
                <Link
                  href="/analysis"
                  className="block w-full bg-blue-500 text-white py-2 px-4 rounded-md text-center hover:bg-blue-600 transition-colors"
                >
                  Performer Analysis
                </Link>
                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>How to play:</strong></p>
                  <ul className="space-y-1 text-xs">
                    <li>• Select one performer for each of 5 roles</li>
                    <li>• Choose based on your intuition - scores are hidden!</li>
                    <li>• No duplicate performers allowed in your team</li>
                    <li>• Update your team before the competition</li>
                    <li>• Rankings revealed after performers compete</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
