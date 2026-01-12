import { requireAuth } from '@/src/lib/auth'
import { createClient } from '@/src/lib/supabase/server'
import { createExercise, deleteExerciseAction } from '@/src/actions/exercises'
import { ExerciseForm } from '@/src/components/ExerciseForm'
import { redirect } from 'next/navigation'

interface Exercise {
  id: string
  name: string
  muscle_group: string | null
  equipment: string | null
  notes: string | null
  created_at: string
}

async function getExercises(userId: string): Promise<Exercise[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching exercises:', error)
    return []
  }

  return data || []
}

export default async function ExercisesPage() {
  const user = await requireAuth()
  const exercises = await getExercises(user.id)

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 safe-area-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Exercises</h1>
          <p className="mt-2 text-gray-600">
            Create and manage your custom exercises
          </p>
        </div>

        {/* Create Exercise Form */}
        <ExerciseForm action={createExercise} />

        {/* Exercises List */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Exercises ({exercises.length})
            </h2>
          </div>

          {exercises.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No exercises yet. Create your first one above!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {exercises.map((exercise) => (
                <li key={exercise.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {exercise.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        {exercise.muscle_group && (
                          <span>
                            <span className="font-medium">Muscle Group:</span>{' '}
                            {exercise.muscle_group}
                          </span>
                        )}
                        {exercise.equipment && (
                          <span>
                            <span className="font-medium">Equipment:</span>{' '}
                            {exercise.equipment}
                          </span>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          {exercise.notes}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Created {new Date(exercise.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <form action={deleteExerciseAction}>
                      <input type="hidden" name="exerciseId" value={exercise.id} />
                      <button
                        type="submit"
                        className="ml-4 rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

