import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 hover:text-red-600 transition-colors">
              🏮 Yaolin Bets
            </h1>
          </Link>
          <p className="text-lg text-gray-600">
            Join the fantasy lion dance community!
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <RegisterForm />
          <p className="text-center mt-4 text-gray-600">
            Already have an account?{' '}
            <Link href="/" className="text-red-600 hover:text-red-700 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}