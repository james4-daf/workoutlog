import { requireAuth } from '@/src/lib/auth'
import { createClient } from '@/src/lib/supabase/server'
import { createWorkout } from '@/src/actions/workouts'
import { getScheduledWorkout } from '@/src/actions/scheduledWorkout'
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

export default async function LogWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ scheduled?: string }>
}) {
  const user = await requireAuth()
  const [exercises, params] = await Promise.all([
    getExercises(user.id),
    searchParams,
  ])
  const isScheduled = params.scheduled === '1'
  const scheduledIds = isScheduled ? await getScheduledWorkout() : []
  const validExerciseIds = new Set(exercises.map((e) => e.id))
  const initialExerciseIds =
    isScheduled && scheduledIds.length > 0
      ? scheduledIds.filter((id) => validExerciseIds.has(id))
      : undefined
  const skippedCount = isScheduled ? scheduledIds.length - (initialExerciseIds?.length ?? 0) : 0

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
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isScheduled ? 'Scheduled Workout' : 'Log Workout'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isScheduled
              ? 'Pre-filled from your schedule. Add sets and log it.'
              : 'Record your sets, reps, and weights'}
          </p>
          {skippedCount > 0 && (
            <p className="mt-2 text-xs text-dim">
              {skippedCount} scheduled exercise{skippedCount !== 1 ? 's' : ''} no longer in your library (removed or renamed).
            </p>
          )}
        </div>

        <WorkoutForm
          action={createWorkout}
          exercises={exercises}
          initialExerciseIds={initialExerciseIds}
        />
      </div>
    </div>
  )
}
