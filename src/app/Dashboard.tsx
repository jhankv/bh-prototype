import { Link } from 'wouter'
import { LayoutGrid } from 'lucide-react'
import { listProjects } from '@/lib/projects'
import { Empty } from './Empty'

export function Dashboard() {
  const projects = listProjects()

  if (projects.length === 0) {
    return (
      <Empty
        home={false}
        title="No prototypes yet"
        detail="Add a folder under prototypes/ with a manifest.json and a canvas.json. It will appear here."
      />
    )
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-xl font-medium tracking-tight text-shell-ink">Prototypes</h1>
        <p className="mt-1 text-sm text-shell-muted">
          {projects.length} project{projects.length === 1 ? '' : 's'}
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/p/${project.slug}`}
              className="group flex h-full flex-col gap-2 rounded-lg border border-shell-line bg-shell-surface p-5 transition-colors hover:border-shell-accent"
            >
              <LayoutGrid
                className="size-4 text-shell-muted transition-colors group-hover:text-shell-accent"
                aria-hidden
              />
              <span className="font-medium text-shell-ink">{project.manifest.name}</span>
              {project.manifest.description && (
                <span className="text-sm leading-relaxed text-shell-muted">
                  {project.manifest.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
