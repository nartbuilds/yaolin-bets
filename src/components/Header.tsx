import Link from 'next/link'

interface HeaderProps {
  session: { username: string } | null
  adminStatus: boolean
}

export default function Header({ session, adminStatus }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏮</span>
            <h1 className="text-2xl font-bold text-gray-800">Yaolin Bets</h1>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/leaderboard"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Leaderboard
            </Link>
            <Link
              href="/analysis"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Analysis
            </Link>
            {session ? (
              <>
                <span className="text-gray-600">Welcome, {session.username}!</span>
                <Link
                  href="/team"
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  My Team
                </Link>
                {adminStatus && (
                  <Link
                    href="/admin"
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    🛡️ Admin
                  </Link>
                )}
                <form action="/api/auth/logout" method="post" className="inline">
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
