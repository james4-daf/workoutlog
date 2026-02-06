'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/src/actions/auth'

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

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
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

export function NavClient({ isLoggedIn }: NavClientProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

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
            <Link href="/" className="font-display text-lg font-bold tracking-tight text-foreground">
              WORKOUT
            </Link>

            <div className="flex items-center gap-1">
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

      {/* ── Mobile top bar (minimal) ──────────────── */}
      <nav className="md:hidden safe-area-top bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-12 items-center justify-between px-5">
          <span className="font-display text-base font-bold tracking-tight text-foreground">
            WORKOUT
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-dim hover:text-foreground transition-colors py-2 px-2"
            >
              Logout
            </button>
          </form>
        </div>
      </nav>

      {/* ── Mobile bottom bar ─────────────────────── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 safe-area-bottom">
        <div className="bg-[#0C0C0E]/90 backdrop-blur-2xl border-t border-border">
          <div className="flex items-center justify-around px-6 py-2">
            {/* Exercises tab */}
            <Link
              href="/workout/exercises"
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                isActive('/workout/exercises') ? 'text-accent' : 'text-dim'
              }`}
            >
              <DumbbellIcon active={isActive('/workout/exercises')} />
              <span className="text-[10px] font-medium">Exercises</span>
            </Link>

            {/* Log Workout tab (center, prominent) */}
            <Link
              href="/workout/log"
              className={`flex items-center justify-center w-14 h-14 -mt-5 rounded-2xl transition-all shadow-lg ${
                isActive('/workout/log')
                  ? 'bg-accent text-black shadow-accent-glow'
                  : 'bg-accent/90 text-black hover:bg-accent'
              }`}
              style={{ boxShadow: isActive('/workout/log') ? '0 4px 24px rgba(212,255,0,0.3)' : '0 4px 16px rgba(0,0,0,0.4)' }}
            >
              <PlusIcon />
            </Link>

            {/* History tab */}
            <Link
              href="/workout/history"
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                pathname === '/workout/history' ? 'text-accent' : 'text-dim'
              }`}
            >
              <ClockIcon active={pathname === '/workout/history'} />
              <span className="text-[10px] font-medium">History</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
