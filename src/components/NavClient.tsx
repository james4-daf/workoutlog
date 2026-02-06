'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavClientProps {
  isLoggedIn: boolean
}

function DumbbellIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round"
      className="transition-all duration-200">
      <path d="M6.5 6.5V17.5M17.5 6.5V17.5M2 9.5V14.5M22 9.5V14.5M6.5 12H17.5M2 12H6.5M17.5 12H22" />
    </svg>
  )
}

function ClockIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round"
      className="transition-all duration-200">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round"
      className="transition-all duration-200">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  )
}

export function NavClient({ isLoggedIn }: NavClientProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')
  const isDashboard = pathname === '/workout'

  // Not logged in: minimal top bar
  if (!isLoggedIn) {
    return (
      <nav className="safe-area-top">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="font-display text-lg font-bold tracking-tight text-foreground">
              WORKOUT
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-white/[0.07] px-5 py-2 text-sm font-medium text-foreground
                border border-border hover:bg-white/[0.12] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  // Logged in: top bar + mobile bottom bar
  return (
    <>
      {/* ── Desktop top bar ───────────────────────── */}
      <nav className="hidden md:block border-b border-border safe-area-top bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-dim hover:text-foreground transition-colors"
              >
                &larr; Home
              </Link>
              <span className="text-border">/</span>
              <Link href="/workout" className="font-display text-lg font-bold tracking-tight text-foreground">
                WORKOUT
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/workout"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDashboard
                    ? 'text-accent bg-accent-muted'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                href="/workout/exercises"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/workout/exercises')
                    ? 'text-accent bg-accent-muted'
                    : 'text-muted hover:text-foreground hover:bg-white/[0.05]'
                }`}
              >
                Exercises
              </Link>
              <Link
                href="/workout/history"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/workout/history'
                    ? 'text-accent bg-accent-muted'
                    : 'text-muted hover:text-foreground hover:bg-white/[0.05]'
                }`}
              >
                History
              </Link>
              <Link
                href="/workout/log"
                className={`ml-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/workout/log')
                    ? 'bg-accent text-black'
                    : 'bg-accent/90 text-black hover:bg-accent'
                }`}
              >
                + Log Workout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile top bar (minimal) ──────────────── */}
      <nav className="md:hidden safe-area-top bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-12 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-dim hover:text-foreground transition-colors"
            >
              &larr; Home
            </Link>
            <span className="text-border">/</span>
            <Link href="/workout" className="font-display text-base font-bold tracking-tight text-foreground">
              WORKOUT
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom bar (bg on outer so safe-area isn’t whitespace) ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 safe-area-bottom bg-[#0C0C0E]/90 backdrop-blur-2xl border-t border-border">
        <div className="flex items-center justify-around px-4 py-2">
            {/* Home / Dashboard */}
            <Link
              href="/workout"
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-colors ${
                isDashboard ? 'text-accent' : 'text-dim'
              }`}
            >
              <HomeIcon active={isDashboard} />
              <span className="text-[10px] font-medium">Home</span>
            </Link>

            {/* Exercises */}
            <Link
              href="/workout/exercises"
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-colors ${
                isActive('/workout/exercises') ? 'text-accent' : 'text-dim'
              }`}
            >
              <DumbbellIcon active={isActive('/workout/exercises')} />
              <span className="text-[10px] font-medium">Exercises</span>
            </Link>

            {/* History */}
            <Link
              href="/workout/history"
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-colors ${
                pathname === '/workout/history' ? 'text-accent' : 'text-dim'
              }`}
            >
              <ClockIcon active={pathname === '/workout/history'} />
              <span className="text-[10px] font-medium">History</span>
            </Link>
          </div>
      </div>
    </>
  )
}
