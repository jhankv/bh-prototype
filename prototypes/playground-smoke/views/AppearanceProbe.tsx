/**
 * Reads back what the frame entry applied to <html>, plus the iframe's real
 * viewport size. If this renders correctly, the appearance pipeline works.
 *
 * Styling is inline on purpose: the shell stylesheet scans only src/, so a
 * prototype cannot borrow the tool's utility classes. That isolation is the
 * point, and this view proves it holds.
 */
export default function AppearanceProbe() {
  const root = document.documentElement

  const rows: Array<[string, string]> = [
    ['mode', root.classList.contains('dark') ? 'dark' : 'light'],
    ['data-theme', root.dataset.theme ?? '—'],
    ['data-radius', root.dataset.radius ?? '—'],
    ['dir', root.dir || '—'],
    ['lang', root.lang || '—'],
    ['viewport', `${window.innerWidth} × ${window.innerHeight}`],
  ]

  const isDark = root.classList.contains('dark')

  return (
    <main
      style={{
        minHeight: '100dvh',
        padding: '2rem',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        background: isDark ? '#18181b' : '#ffffff',
        color: isDark ? '#fafafa' : '#18181b',
      }}
    >
      <h1 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
        Appearance probe
      </h1>

      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem' }}>
        {rows.map(([key, value]) => (
          <div key={key} style={{ display: 'contents' }}>
            <dt style={{ fontSize: '0.8rem', opacity: 0.6 }}>{key}</dt>
            <dd
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '0.8rem',
                margin: 0,
              }}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6, maxWidth: '38ch' }}>
        This paragraph follows the document direction. In RTL it starts on the right.
      </p>
    </main>
  )
}
