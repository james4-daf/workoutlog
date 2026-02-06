import { Nav } from '@/src/components/Nav'

export default function WorkoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      {children}
    </>
  )
}
