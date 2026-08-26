/**
 * Gate for the Vercel Toolbar in production. This app has no auth layer to
 * check "is this visitor a teammate" against, so the gate is a manual
 * opt-in instead: visiting once with `?toolbar=1` persists a localStorage
 * flag, and only that flag — never the query param alone — decides whether
 * the toolbar mounts on later visits. Unconditional injection would prompt
 * every visitor to log in, which is what Vercel's own docs warn against.
 */
const TOOLBAR_FLAG_KEY = 'playground:vercel-toolbar'

export function maybeMountVercelToolbar(): void {
  if (!import.meta.env.PROD) return

  if (new URLSearchParams(window.location.search).get('toolbar') === '1') {
    try {
      localStorage.setItem(TOOLBAR_FLAG_KEY, '1')
    } catch {
      /* opt-in is not persisted this session */
    }
  }

  let enabled = false
  try {
    enabled = localStorage.getItem(TOOLBAR_FLAG_KEY) === '1'
  } catch {
    /* storage blocked — toolbar stays off */
  }
  if (!enabled) return

  import('@vercel/toolbar').then(({ mountVercelToolbar }) => mountVercelToolbar())
}
