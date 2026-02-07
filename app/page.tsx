import { HomeClient } from '@/src/components/HomeClient'

/**
 * Home is a client component so the server can respond instantly when
 * navigating here from other apps. Auth is fetched on the client.
 */
export default function Home() {
  return <HomeClient />
}
