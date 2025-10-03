import { getSession } from '@/lib/session'
import { isAdmin } from '@/lib/admin'
import PerformerAnalysis from '@/components/analysis/PerformerAnalysis'
import Header from '@/components/Header'

export default async function AnalysisPage() {
  const session = await getSession()
  const adminStatus = session ? await isAdmin() : false

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} adminStatus={adminStatus} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Performer Analysis</h2>
          <p className="text-gray-600">
            Analyze performer statistics and rankings across all positions based on their raw scores.
          </p>
        </div>

        <PerformerAnalysis />
      </main>
    </div>
  )
}