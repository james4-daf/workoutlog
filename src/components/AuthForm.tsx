'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>
  title: string
  subtitle: string
  submitText: string
  linkText: string
  linkHref: string
  linkLabel: string
  children: React.ReactNode
}

export function AuthForm({
  action,
  title,
  subtitle,
  submitText,
  linkText,
  linkHref,
  linkLabel,
  children,
}: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-5">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-muted text-sm">{subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-danger-muted border border-danger/20 px-4 py-3 animate-slide-down">
            <p className="text-sm font-medium text-danger">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-4">{children}</div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-accent px-6 py-3.5 text-sm font-semibold text-black
              hover:brightness-110 active:scale-[0.98] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isPending ? 'Please wait...' : submitText}
          </button>

          <div className="text-center text-sm pt-2">
            <span className="text-dim">{linkText} </span>
            <a
              href={linkHref}
              className="font-medium text-accent hover:text-accent-hover transition-colors"
            >
              {linkLabel}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
