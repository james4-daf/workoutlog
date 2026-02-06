import { getUser } from '@/src/lib/auth'
import { NavClient } from './NavClient'

export async function Nav() {
  const user = await getUser()
  return <NavClient isLoggedIn={!!user} />
}
