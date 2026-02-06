import Link from 'next/link'

interface AppCardProps {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}

export function AppCard({ href, title, description, icon }: AppCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-surface border border-border hover:border-border-hover
        p-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-muted">
        {icon}
      </div>
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </Link>
  )
}
