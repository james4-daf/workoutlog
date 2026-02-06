import { requireAuth } from '@/src/lib/auth'
import { createClient } from '@/src/lib/supabase/server'
import { createExercise, deleteExerciseAction } from '@/src/actions/exercises'
import { ExerciseForm } from '@/src/components/ExerciseForm'

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
    <div className="min-h-screen pb-24 md:pb-8 safe-area-bottom">
      <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-8">
        <div className="mb-6 animate-slide-up">
          <h1 className="font-display text-2xl font-bold text-foreground">Exercises</h1>
          <p className="mt-1 text-sm text-muted">
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} in your library
          </p>
        </div>

        <ExerciseForm action={createExercise} />

        {exercises.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-12 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M6.5 6.5V17.5M17.5 6.5V17.5M2 9.5V14.5M22 9.5V14.5M6.5 12H17.5M2 12H6.5M17.5 12H22" />
              </svg>
            </div>
            <p className="text-foreground font-medium">No exercises yet</p>
            <p className="mt-1 text-sm text-dim">Create your first exercise to start building workouts</p>
          </div>
        ) : (
          <div className="space-y-2 stagger">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="group rounded-2xl bg-surface border border-border hover:border-border-hover
                  p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {exercise.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {exercise.muscle_group && (
                        <span className="inline-flex items-center rounded-lg bg-accent-muted
                          px-2.5 py-1 text-xs font-medium text-accent">
                          {exercise.muscle_group}
                        </span>
                      )}
                      {exercise.equipment && (
                        <span className="inline-flex items-center rounded-lg bg-white/[0.06]
                          px-2.5 py-1 text-xs font-medium text-muted">
                          {exercise.equipment}
                        </span>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="mt-2 text-sm text-dim line-clamp-2">{exercise.notes}</p>
                    )}
                  </div>
                  <form action={deleteExerciseAction}>
                    <input type="hidden" name="exerciseId" value={exercise.id} />
                    <button
                      type="submit"
                      className="rounded-lg p-2 text-dim hover:text-danger hover:bg-danger-muted
                        transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
