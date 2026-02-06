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
      <div className="min-h-screen pb-24 md:pb-8 safe-area-bottom">
        <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-8">
          <div className="rounded-2xl bg-surface border border-border p-8 text-center animate-slide-up">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M6.5 6.5V17.5M17.5 6.5V17.5M2 9.5V14.5M22 9.5V14.5M6.5 12H17.5M2 12H6.5M17.5 12H22" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Create exercises first</h1>
            <p className="mt-2 text-sm text-muted">
              You need at least one exercise before logging a workout.
            </p>
            <a
              href="/workout/exercises"
              className="mt-5 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black
                hover:brightness-110 transition-all"
            >
              Go to Exercises
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 safe-area-bottom">
      <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-8">
        <div className="mb-6 animate-slide-up">
          <h1 className="font-display text-2xl font-bold text-foreground">Log Workout</h1>
          <p className="mt-1 text-sm text-muted">
            Record your sets, reps, and weights
          </p>
        </div>

        <WorkoutForm action={createWorkout} exercises={exercises} />
      </div>
    </div>
  )
}
