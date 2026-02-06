'use client'

import Link from 'next/link'
import { signOut } from '@/src/actions/auth'

interface SubAppNavClientProps {
  appName: string
  isLoggedIn: boolean
}

export function SubAppNavClient({ appName, isLoggedIn }: SubAppNavClientProps) {
  if (!isLoggedIn) {
    return (
      <nav className="safe-area-top">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="font-display text-lg font-bold tracking-tight text-foreground">
              HUB
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

  return (
    <nav className="border-b border-border safe-area-top bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-dim hover:text-foreground transition-colors"
            >
              &larr; Home
            </Link>
            <span className="text-border">/</span>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              {appName.toUpperCase()}
            </span>
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
  )
}
