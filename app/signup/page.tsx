import { getUser } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { signUp } from '@/src/actions/auth'
import { AuthForm } from '@/src/components/AuthForm'

export default async function SignUpPage() {
  const user = await getUser()

  if (user) {
    redirect('/exercises')
  }

  return (
    <AuthForm
      action={signUp}
      title="Sign Up"
      subtitle="Create an account to get started"
      submitText="Sign Up"
      linkText="Already have an account?"
      linkHref="/login"
      linkLabel="Sign in"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900"
        />
        <p className="mt-1 text-xs text-gray-500">
          Must be at least 6 characters
        </p>
      </div>
    </AuthForm>
  )
}

