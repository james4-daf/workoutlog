import { SubAppNav } from '@/src/components/SubAppNav'

export default function StocksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SubAppNav appName="Stocks" />
      {children}
    </>
  )
}
