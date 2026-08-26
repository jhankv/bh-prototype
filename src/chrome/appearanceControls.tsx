import { Moon, Sun } from 'lucide-react'
import { AppearanceSchema, type Appearance } from '@/lib/schema'

/**
 * The appearance controls, shared by the two toolbars that carry them: the
 * canvas toolbar that floats over a selected frame, and the standalone toolbar
 * inside a frame opened on its own.
 *
 * They live outside both because they are the same controls — a reader who
 * learns the toolbar on the canvas should not have to learn a second one when
 * they open that same prototype full size. What genuinely differs between the
 * two is one control, and `direction` names it rather than hiding it behind a
 * second copy of this file.
 */

/** Read off the schema so adding a Banhaten theme never means editing chrome. */
const THEMES = AppearanceSchema.shape.theme.unwrap().options
const RADII = AppearanceSchema.shape.radius.unwrap().options

export function Divider() {
  return <span aria-hidden className="mx-0.5 h-4 w-px bg-shell-line" />
}

export function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex size-6 items-center justify-center rounded text-shell-muted transition-colors hover:bg-shell-bg hover:text-shell-ink"
    >
      {children}
    </button>
  )
}

/**
 * A native select rather than a custom popover: seven themes do not fit on a
 * toolbar as buttons and do not survive being cycled blind, and the browser
 * already renders its list at screen scale outside the transformed layer.
 */
export function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <select
      value={value}
      title={label}
      aria-label={label}
      onChange={(event) => onChange(event.target.value as T)}
      className="cursor-pointer rounded border-0 bg-transparent py-1 ps-1.5 pe-0.5 font-mono text-[10px] text-shell-muted transition-colors hover:bg-shell-bg hover:text-shell-ink focus:outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

/**
 * The comparison this whole repo exists to make, in one frame: flipping a
 * single frame between sandboxes beats reading two side by side, because the
 * difference is almost always a shift in POSITION and only a shared origin
 * makes that jump out.
 *
 * Renders nothing when there is only one sandbox — a switcher with a single
 * option is a control that cannot do anything.
 */
export function SandboxSwitcher({
  sandbox,
  sandboxes,
  onSandbox,
}: {
  sandbox: string
  sandboxes: string[]
  onSandbox: (sandbox: string) => void
}) {
  if (sandboxes.length <= 1) return null

  return (
    <div className="flex items-center gap-0.5">
      {sandboxes.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onSandbox(name)}
          title={`Render against ${name}`}
          className={`rounded px-1.5 py-1 font-mono text-[10px] transition-colors ${
            name === sandbox
              ? 'bg-shell-accent/10 text-shell-accent'
              : 'text-shell-muted hover:text-shell-ink'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

type AppearanceSetProps = {
  appearance: Appearance
  onChange: (appearance: Appearance) => void
  /**
   * False for documents: prose has no design system to theme, no radius to
   * round, and no Arabic translation to switch to.
   *
   * Mode is rendered either way, and that is a correction rather than an
   * inconsistency. A document frame renders in shell chrome, whose palette now
   * keys off the same `.dark` class a view uses — so a findings document really
   * does have a light and a dark version, and hiding the control leaves it
   * frozen at whatever `canvas.json` happened to declare.
   */
  themeable: boolean
  /**
   * What the direction control does — the one real difference between the two
   * toolbars.
   *
   * On the canvas it is `'fixed'`: a label, not a switch. Light and dark are one
   * screen in two token sets, but left-to-right and right-to-left are two
   * different screens, because RTL means the copy is Arabic — and reaching it
   * means a reload, which throws away the state the frame was in when you
   * noticed something was wrong. On the canvas the RTL twin is already on the
   * board beside it, so the toggle would spend that state to show you something
   * you can already see.
   *
   * Standalone it is `'reload'`: nothing sits beside it and you have just opened
   * it, so there is no state to lose and the toggle is the only way to reach
   * the Arabic screen from here.
   */
  direction: 'fixed' | 'reload'
  onDirection?: (dir: Appearance['dir']) => void
}

export function AppearanceSet({
  appearance,
  onChange,
  themeable,
  direction,
  onDirection,
}: AppearanceSetProps) {
  const set = <K extends keyof Appearance>(key: K, value: Appearance[K]) =>
    onChange({ ...appearance, [key]: value })

  const nextDir = appearance.dir === 'rtl' ? 'ltr' : 'rtl'

  return (
    <>
      <IconButton
        label={appearance.mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
        onClick={() => set('mode', appearance.mode === 'dark' ? 'light' : 'dark')}
      >
        {appearance.mode === 'dark' ? (
          <Sun className="size-3.5" aria-hidden />
        ) : (
          <Moon className="size-3.5" aria-hidden />
        )}
      </IconButton>

      {themeable && (
        <>
          <Picker
            label="Theme"
            value={appearance.theme}
            options={THEMES}
            onChange={(value) => set('theme', value)}
          />
          <Picker
            label="Radius"
            value={appearance.radius}
            options={RADII}
            onChange={(value) => set('radius', value)}
          />

          {direction === 'fixed' ? (
            <span
              title="Direction is declared per frame — RTL frames render Arabic copy"
              className="cursor-default rounded px-1.5 py-1 font-mono text-[10px] text-shell-muted"
            >
              {appearance.dir}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onDirection?.(nextDir)}
              title={`Reload in ${nextDir} — RTL renders Arabic copy`}
              aria-label={`Reload in ${nextDir}`}
              className="rounded px-1.5 py-1 font-mono text-[10px] text-shell-muted transition-colors hover:bg-shell-bg hover:text-shell-ink"
            >
              {appearance.dir}
            </button>
          )}
        </>
      )}
    </>
  )
}
