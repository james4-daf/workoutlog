import { getUser } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { signIn } from '@/src/actions/auth'
import { AuthForm } from '@/src/components/AuthForm'

export default async function LoginPage() {
  const user = await getUser()

  if (user) {
    redirect('/')
  }

  return (
    <AuthForm
      action={signIn}
      title="Welcome back"
      subtitle="Sign in to continue your training"
      submitText="Sign In"
      linkText="New here?"
      linkHref="/signup"
      linkLabel="Create an account"
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
          autoComplete="current-password"
          required
          placeholder="Enter your password"
        />
      </div>
    </AuthForm>
  )
}
