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
        // Redirect on success
        router.push('/exercises')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">{subtitle}</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">{children}</div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Please wait...' : submitText}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">{linkText} </span>
            <a
              href={linkHref}
              className="font-medium text-gray-900 hover:underline"
            >
              {linkLabel}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

