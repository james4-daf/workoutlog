'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/src/actions/auth'
import { signOut } from '@/src/actions/auth'
import { AppCard } from '@/src/components/AppCard'

export function HomeClient() {
  const [user, setUser] = useState<{ id: string; email?: string } | null | undefined>(undefined)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  if (user === undefined) {
    return (
      <div className="min-h-screen safe-area-bottom flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 safe-area-bottom">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/4 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>
        <div className="relative w-full max-w-sm text-center animate-slide-up">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
            HUB
          </h1>
          <p className="mt-4 text-muted text-base leading-relaxed max-w-xs mx-auto">
            Your personal app hub. Track workouts, monitor stocks, take notes.
          </p>
          <div className="mt-10 space-y-3">
            <a
              href="/signup"
              className="block w-full rounded-2xl bg-accent px-6 py-3.5 text-center text-sm font-semibold text-black
                hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="block w-full rounded-2xl bg-white/5 px-6 py-3.5 text-center text-sm font-medium text-foreground
                border border-border hover:bg-white/10 transition-colors"
            >
              I already have an account
            </a>
          </div>
          <p className="mt-12 text-xs text-dim">Free forever. No ads. No BS.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen safe-area-bottom">
      <nav className="safe-area-top">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              HUB
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg px-3 py-2 text-sm text-dim hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display text-2xl font-bold text-foreground">Your Apps</h1>
          <p className="mt-1 text-sm text-muted">Choose an app to get started</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger">
          <AppCard
            href="/workout"
            title="Workout"
            description="Track your lifts"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M6.5 6.5V17.5M17.5 6.5V17.5M2 9.5V14.5M22 9.5V14.5M6.5 12H17.5M2 12H6.5M17.5 12H22" />
              </svg>
            }
          />
          <AppCard
            href="/stocks"
            title="Stocks"
            description="Market tracker"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            }
          />
          <AppCard
            href="/notes"
            title="Notes"
            description="Daily notes"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}
