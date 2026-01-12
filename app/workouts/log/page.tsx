import { requireAuth } from '@/src/lib/auth'
import { createClient } from '@/src/lib/supabase/server'
import { createWorkout } from '@/src/actions/workouts'
import { WorkoutForm } from '@/src/components/WorkoutForm'

interface Exercise {
  id: string
  name: string
}

async function getExercises(userId: string): Promise<Exercise[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching exercises:', error)
    return []
  }

  return data || []
}

export default async function LogWorkoutPage() {
  const user = await requireAuth()
  const exercises = await getExercises(user.id)

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 safe-area-bottom">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow">
            <h1 className="text-2xl font-bold text-gray-900">Log Workout</h1>
            <p className="mt-4 text-gray-600">
              You need to create at least one exercise before logging a workout.
            </p>
            <a
              href="/exercises"
              className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Go to Exercises
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 safe-area-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Log Workout</h1>
          <p className="mt-2 text-gray-600">
            Record your workout sets, reps, and weights
          </p>
        </div>

        <WorkoutForm action={createWorkout} exercises={exercises} />
      </div>
    </div>
  )
}

