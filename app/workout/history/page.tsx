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
    <div className="min-h-screen pb-24 md:pb-8 safe-area-bottom">
      <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-8">
        <div className="mb-6 flex items-end justify-between animate-slide-up">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">History</h1>
            <p className="mt-1 text-sm text-muted">
              {workouts.length} workout{workouts.length !== 1 ? 's' : ''} logged
            </p>
          </div>
          <Link
            href="/workout/log"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black
              hover:brightness-110 active:scale-[0.98] transition-all"
          >
            + Log Workout
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-12 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" className="text-accent">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <p className="text-foreground font-medium">No workouts yet</p>
            <p className="mt-1 text-sm text-dim mb-5">Log your first workout to start tracking</p>
            <Link
              href="/workout/log"
              className="inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black
                hover:brightness-110 transition-all"
            >
              Log Your First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-2 stagger">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
