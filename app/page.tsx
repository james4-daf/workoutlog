import { getUser } from '@/src/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/exercises')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 safe-area-bottom">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 sm:p-8 shadow">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Workout App</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Track your exercises and build your workout routine
          </p>
        </div>
        <div className="mt-6">
          <a
            href="/login"
            className="block w-full rounded-md bg-gray-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  )
}
