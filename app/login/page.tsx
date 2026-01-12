import { getUser } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { signIn } from '@/src/actions/auth'
import { AuthForm } from '@/src/components/AuthForm'

export default async function LoginPage() {
  const user = await getUser()

  if (user) {
    redirect('/exercises')
  }

  return (
    <AuthForm
      action={signIn}
      title="Sign In"
      subtitle="Sign in to your account to continue"
      submitText="Sign In"
      linkText="Don't have an account?"
      linkHref="/signup"
      linkLabel="Sign up"
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
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900"
        />
      </div>
    </AuthForm>
  )
}

