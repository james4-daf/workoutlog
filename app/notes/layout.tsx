import { SubAppNav } from '@/src/components/SubAppNav'

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SubAppNav appName="Notes" />
      {children}
    </>
  )
}
