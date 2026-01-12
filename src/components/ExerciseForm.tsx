'use client'

import { useState, useTransition } from 'react'

interface ExerciseFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>
}

export function ExerciseForm({ action }: ExerciseFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
        // Reset form
        const form = document.getElementById('exercise-form') as HTMLFormElement
        form?.reset()
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Create Exercise
      </h2>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Exercise created successfully!
          </p>
        </div>
      )}

      <form id="exercise-form" action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Exercise Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
            placeholder="e.g., Bench Press"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="muscle_group"
              className="block text-sm font-medium text-gray-700"
            >
              Muscle Group
            </label>
            <input
              id="muscle_group"
              name="muscle_group"
              type="text"
              disabled={isPending}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
              placeholder="e.g., Chest"
            />
          </div>

          <div>
            <label
              htmlFor="equipment"
              className="block text-sm font-medium text-gray-700"
            >
              Equipment
            </label>
            <input
              id="equipment"
              name="equipment"
              type="text"
              disabled={isPending}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
              placeholder="e.g., Barbell"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
            placeholder="Additional notes or instructions..."
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating...' : 'Create Exercise'}
          </button>
        </div>
      </form>
    </div>
  )
}

