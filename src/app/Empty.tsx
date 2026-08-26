import { Link } from 'wouter'

type EmptyProps = {
  title: string
  detail: string
  /** Renders a link back to the dashboard when true. */
  home?: boolean
}

export function Empty({ title, detail, home = true }: EmptyProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-lg font-medium text-shell-ink">{title}</h1>
      <p className="max-w-md text-sm text-shell-muted">{detail}</p>
      {home && (
        <Link href="/" className="mt-2 text-sm text-shell-accent hover:underline">
          Back to dashboard
        </Link>
      )}
    </div>
  )
}
