import { getUser } from '@/src/lib/auth'
import { SubAppNavClient } from './SubAppNavClient'

interface SubAppNavProps {
  appName: string
}

export async function SubAppNav({ appName }: SubAppNavProps) {
  const user = await getUser()
  return <SubAppNavClient appName={appName} isLoggedIn={!!user} />
}
