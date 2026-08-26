import { Link, useParams } from 'wouter'
import { ChevronRight, FileText, Maximize2 } from 'lucide-react'
import { appearanceToParams, describeAppearance } from '@/lib/appearance'
import {
  findProject,
  frameUrl,
  projectIndex,
  type IndexEntry,
  type IndexGroup,
} from '@/lib/projects'
import { Empty } from './Empty'

/**
 * What a project card opens: everything in a project, before any of it renders.
 *
 * The canvas is the tool's centre and is still one click away, but it is the
 * wrong front door. Opening it mounts frames until the board is covered —
 * reading one findings document used to cost a whole board — and it answers
 * "how do these compare" when the question is usually "where is the one about
 * forms".
 *
 * Documents and views are drawn differently on purpose. A document is prose you
 * read, so it gets a card with two lines of what it covers; a view is a screen
 * you drive, so it gets a row with a name, what it is, and the frame id you
 * would cite in a finding. Giving both the same treatment is what made this
 * page read as one undifferentiated block of grey text.
 */
export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = findProject(slug)

  if (!project) {
    return <Empty title="Project not found" detail={`No prototypes/${slug}/manifest.json`} />
  }

  const index = projectIndex(slug)

  const documents = index.ok ? index.value.filter((group) => group.kind === 'document') : []
  const views = index.ok ? index.value.filter((group) => group.kind === 'view') : []

  const count = (groups: IndexGroup[]) =>
    groups.reduce((total, group) => total + group.entries.length, 0)

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-10 border-b border-shell-line pb-6">
        <nav className="mb-3 flex items-center gap-1 text-xs text-shell-muted">
          <Link href="/" className="rounded hover:text-shell-ink">
            Prototypes
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-shell-ink">{project.manifest.name}</span>
        </nav>

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-medium tracking-tight text-shell-ink">
              {project.manifest.name}
            </h1>
            {project.manifest.description && (
              /* Capped rather than left to the container: at 4xl the description
                 runs past the length a line can be read at without effort. */
              <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-balance text-shell-muted">
                {project.manifest.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/p/${slug}/canvas`}
              className="flex items-center gap-1.5 rounded-md border border-shell-line bg-shell-surface px-3 py-1.5 text-sm whitespace-nowrap text-shell-ink transition-colors hover:border-shell-accent hover:text-shell-accent"
            >
              <Maximize2 className="size-3.5" aria-hidden />
              Open canvas
            </Link>
          </div>
        </div>
      </header>

      {!index.ok ? (
        <p className="rounded-lg border border-shell-line bg-shell-surface p-5 text-sm text-shell-muted">
          {index.error}
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Documents first, ahead of the canvas order that puts them last. On
              the board the reports sit after the screens they are about; in a
              list they are what someone came for. */}
          {documents.length > 0 && (
            <Section title="Documents" count={count(documents)} note={documents[0]?.title}>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {documents.flatMap((group) =>
                  group.entries.map((entry) => (
                    <li key={entry.id}>
                      <DocumentCard slug={slug} entry={entry} />
                    </li>
                  )),
                )}
              </ul>
            </Section>
          )}

          {views.length > 0 && (
            <Section title="Views" count={count(views)}>
              <ul className="-mx-3 flex flex-col">
                {views.map((group) => (
                  <ViewGroup key={group.title} slug={slug} group={group} />
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </main>
  )
}

/** Uppercase and tracked out, the way the canvas draws its section titles. */
function Section({
  title,
  count,
  note,
  children,
}: {
  title: string
  count: number
  note?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-xs font-medium tracking-wider text-shell-muted uppercase">
          {title}
        </h2>
        <span className="font-mono text-[10px] text-shell-muted tabular-nums">{count}</span>
        {note && <span className="truncate text-xs text-shell-muted">{note}</span>}
      </div>
      {children}
    </section>
  )
}

/**
 * A canvas section title reads `Product — what the screen is`, which is already
 * the two levels this list needs: the name you look for, and the line that tells
 * you which screen it is. Split rather than nested, because ten of the eleven
 * sections hold exactly one view and a folder around a single item is a level of
 * hierarchy that carries no information.
 */
function splitTitle(title: string): { name: string; detail?: string } {
  const [name, ...rest] = title.split(' — ')
  return { name, detail: rest.join(' — ') || undefined }
}

function ViewGroup({ slug, group }: { slug: string; group: IndexGroup }) {
  const { name, detail } = splitTitle(group.title)

  // One view is the common case and needs no label above it. Several — the
  // variant galleries — do, or two rows would carry the same name and differ
  // only in a caption.
  if (group.entries.length === 1) {
    return (
      <li>
        <ViewRow slug={slug} entry={group.entries[0]} name={name} detail={detail} />
      </li>
    )
  }

  return (
    <li className="mt-2 first:mt-0">
      <p className="px-3 pt-2 pb-1 text-xs text-shell-muted">
        <span className="text-shell-ink">{name}</span>
        {detail && ` — ${detail}`}
      </p>
      <ul>
        {group.entries.map((entry) => (
          <li key={entry.id}>
            <ViewRow slug={slug} entry={entry} name={entry.id} />
          </li>
        ))}
      </ul>
    </li>
  )
}

function hrefFor(slug: string, entry: IndexEntry): string {
  return frameUrl(slug, {
    src: entry.src,
    sandbox: entry.sandbox,
    appearance: appearanceToParams(entry.appearance),
  })
}

/* Plain anchors, not wouter Links: a frame is a different document at
   /frame.html, so these leave the shell rather than routing inside it. */

function ViewRow({
  slug,
  entry,
  name,
  detail,
}: {
  slug: string
  entry: IndexEntry
  name: string
  detail?: string
}) {
  // In a multi-entry group the row is already named by its frame id, so the
  // trailing one would print the same word twice on one line.
  const showId = name !== entry.id

  return (
    <a
      href={hrefFor(slug, entry)}
      title={describeAppearance(entry.appearance)}
      className="group grid grid-cols-[1fr_auto] items-start gap-4 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-shell-line hover:bg-shell-surface"
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-shell-ink">{name}</span>
          {detail && <span className="truncate text-sm text-shell-muted">{detail}</span>}
        </div>
        {/* One line, clamped. These captions were written for the canvas, where
            a frame is beside them; here a third line of prose per row is what
            turned eleven screens into a wall of text. */}
        {entry.caption && (
          <p className="mt-0.5 line-clamp-1 text-xs text-shell-muted">{entry.caption}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
        {/* The board carries this screen twice — the second is its Arabic twin.
            Said here rather than listed as a second row, because the row opens a
            frame whose own toolbar reaches the other direction. */}
        {entry.frames > 1 && (
          <span className="rounded border border-shell-line px-1.5 py-0.5 font-mono text-[10px] text-shell-muted">
            ltr · rtl
          </span>
        )}
        {showId && (
          <span className="font-mono text-[10px] text-shell-muted transition-colors group-hover:text-shell-accent">
            {entry.id}
          </span>
        )}
      </div>
    </a>
  )
}

function DocumentCard({ slug, entry }: { slug: string; entry: IndexEntry }) {
  return (
    <a
      href={hrefFor(slug, entry)}
      className="group flex h-full flex-col gap-1.5 rounded-lg border border-shell-line bg-shell-surface p-4 transition-colors hover:border-shell-accent"
    >
      <div className="flex items-center gap-2">
        <FileText
          className="size-3.5 shrink-0 text-shell-muted transition-colors group-hover:text-shell-accent"
          aria-hidden
        />
        <span className="text-sm font-medium text-shell-ink">{entry.id}</span>
      </div>
      {entry.caption && (
        <p className="line-clamp-2 text-xs leading-relaxed text-shell-muted">{entry.caption}</p>
      )}
    </a>
  )
}
