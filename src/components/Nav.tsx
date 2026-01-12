import { getUser } from '@/src/lib/auth'
import { signOut } from '@/src/actions/auth'
import Link from 'next/link'

export async function Nav() {
  const user = await getUser()

  return (
    <nav className="border-b border-gray-200 bg-white safe-area-top">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-xl font-semibold text-gray-900">
              Workout App
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link
                  href="/exercises"
                  className="text-sm sm:text-base text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2"
                >
                  Exercises
                </Link>
                <Link
                  href="/workouts"
                  className="text-sm sm:text-base text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2"
                >
                  Workouts
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-md bg-gray-900 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-gray-900 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-gray-800"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

