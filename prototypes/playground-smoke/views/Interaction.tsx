import { useState } from 'react'

/**
 * Proves frames are live applications, not screenshots. If the counter and the
 * input respond, the click-to-activate handoff on the canvas works.
 */
export default function Interaction() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  const isDark = document.documentElement.classList.contains('dark')

  const box: React.CSSProperties = {
    border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
    borderRadius: 8,
    padding: '0.5rem 0.85rem',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.85rem',
  }

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
        Interaction check
      </h1>

      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" style={{ ...box, cursor: 'pointer' }} onClick={() => setCount((c) => c + 1)}>
          Clicked {count} {count === 1 ? 'time' : 'times'}
        </button>

        <input
          style={box}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type here"
        />
      </div>

      {text && (
        <p style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}>
          You typed: <strong>{text}</strong>
        </p>
      )}
    </main>
  )
}
