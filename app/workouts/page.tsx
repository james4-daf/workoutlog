import { requireAuth } from '@/src/lib/auth'
import { createClient } from '@/src/lib/supabase/server'
import { WorkoutCard } from '@/src/components/WorkoutCard'
import Link from 'next/link'

interface WorkoutSet {
  id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight: number | null
  duration_seconds: number | null
  distance_meters: number | null
  notes: string | null
  exercises: {
    id: string
    name: string
  }
}

interface Workout {
  id: string
  workout_date: string
  notes: string | null
  created_at: string
  workout_sets: WorkoutSet[]
}

async function getWorkouts(userId: string): Promise<Workout[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
      *,
      workout_sets (
        *,
        exercises (
          id,
          name
        )
      )
    `
    )
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })

  if (error) {
    console.error('Error fetching workouts:', error)
    return []
  }

  return (data || []).map((workout) => ({
    ...workout,
    workout_sets: (workout.workout_sets || []).sort(
      (a: WorkoutSet, b: WorkoutSet) => a.set_number - b.set_number
    ),
  }))
}

export default async function WorkoutsPage() {
  const user = await requireAuth()
  const workouts = await getWorkouts(user.id)

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 safe-area-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workout History</h1>
            <p className="mt-2 text-gray-600">
              View and manage your logged workouts
            </p>
          </div>
          <Link
            href="/workouts/log"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Log Workout
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="rounded-lg bg-white p-12 shadow text-center">
            <p className="text-gray-500 mb-4">No workouts logged yet.</p>
            <Link
              href="/workouts/log"
              className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Log Your First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

