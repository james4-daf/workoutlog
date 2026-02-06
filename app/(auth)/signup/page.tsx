import { getUser } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { signUp } from '@/src/actions/auth'
import { AuthForm } from '@/src/components/AuthForm'

export default async function SignUpPage() {
  const user = await getUser()

  if (user) {
    redirect('/')
  }

  return (
    <AuthForm
      action={signUp}
      title="Create account"
      subtitle="Start tracking your workouts today"
      submitText="Create Account"
      linkText="Already training?"
      linkHref="/login"
      linkLabel="Sign in"
    >
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Min 6 characters"
        />
      </div>
    </AuthForm>
  )
}
