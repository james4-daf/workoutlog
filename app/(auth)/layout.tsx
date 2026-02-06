import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="safe-area-top">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex h-14 items-center">
            <Link href="/" className="font-display text-lg font-bold tracking-tight text-foreground">
              HUB
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  )
}
