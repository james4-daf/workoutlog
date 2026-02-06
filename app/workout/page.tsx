import { requireAuth } from '@/src/lib/auth'
import { getLastWorkout } from '@/src/lib/workouts'
import Link from 'next/link'

const DAILY_QUOTES = [
  'The only bad workout is the one that didn’t happen.',
  'Your body can do it. It’s your mind you need to convince.',
  'Small progress is still progress.',
  'Strength doesn’t come from what you can do. It comes from overcoming the things you thought you couldn’t.',
  'The pain you feel today will be the strength you feel tomorrow.',
  'Don’t wish for it. Work for it.',
  'Every rep counts.',
  'You’re one workout away from a good mood.',
  'Train like a beast, look like a beauty.',
  'Sweat is fat crying.',
  'Do it for the “I did it” feeling.',
  'The only place where success comes before work is in the dictionary.',
  'Wake up. Work out. Look hot.',
  'Good things come to those who sweat.',
  'Be stronger than your excuses.',
  'No pain, no gain. Shut up and train.',
  'Fall in love with taking care of your body.',
  'Respect your body. It’s the only one you get.',
  'Discipline is choosing between what you want now and what you want most.',
  'The best project you’ll ever work on is you.',
]

function getDailyQuote(): string {
  const start = new Date(2025, 0, 1)
  const today = new Date()
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const index = diff % DAILY_QUOTES.length
  return DAILY_QUOTES[index]
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const d = date.toDateString()
  if (d === today) return 'Today'
  if (d === yesterday.toDateString()) return 'Yesterday'
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function WorkoutDashboardPage() {
  const user = await requireAuth()
  const [lastWorkout, quote] = await Promise.all([
    getLastWorkout(user.id),
    Promise.resolve(getDailyQuote()),
  ])

  const exerciseCount = lastWorkout
    ? new Set(lastWorkout.workout_sets.map((s) => s.exercise_id)).size
    : 0
  const totalSets = lastWorkout?.workout_sets.length ?? 0
  const lastDate = lastWorkout ? new Date(lastWorkout.workout_date) : null

  return (
    <div className="min-h-screen pb-24 md:pb-8 safe-area-bottom">
      <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-8">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="font-display text-2xl font-bold text-foreground">Workout</h1>
          <p className="mt-1 text-sm text-muted">Get after it.</p>
        </div>

        <div className="stagger">
          {/* CTA — Start workout */}
          <Link
            href="/workout/log"
            className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-accent py-5 px-6
              text-lg font-semibold text-black shadow-lg shadow-accent-glow
              hover:brightness-110 active:scale-[0.98] transition-all animate-slide-up"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Start Workout
          </Link>

          {/* Daily quote */}
          <div className="mt-6 rounded-2xl bg-surface border border-border px-5 py-4 animate-slide-up">
            <p className="text-sm font-medium text-foreground">&ldquo;{quote}&rdquo;</p>
            <p className="mt-2 text-xs text-dim">Daily motivation</p>
          </div>

          {/* Last workout */}
          <div className="mt-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Last workout
          </h2>
          {lastWorkout && lastDate ? (
            <Link
              href="/workout/history"
              className="block rounded-2xl bg-surface border border-border hover:border-border-hover
                p-4 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-accent-muted shrink-0">
                  <span className="text-[10px] font-bold text-accent leading-none">
                    {lastDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-accent leading-tight">
                    {lastDate.getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground">
                    {formatRelativeDate(lastDate)}
                  </p>
                  <p className="text-sm text-dim">
                    {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} · {totalSets} set{totalSets !== 1 ? 's' : ''}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" className="text-dim shrink-0">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ) : (
            <div className="rounded-2xl bg-surface border border-border p-6 text-center">
              <p className="text-sm text-muted">No workouts yet</p>
              <p className="mt-1 text-xs text-dim">Tap Start Workout to log your first one</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
