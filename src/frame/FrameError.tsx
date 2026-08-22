type FrameErrorProps = {
  title: string
  detail: string
}

/**
 * Every failure inside a frame renders here instead of throwing upward.
 * A broken prototype must never blank the canvas around it.
 */
export function FrameError({ title, detail }: FrameErrorProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="text-sm font-medium text-shell-danger">{title}</p>
      <p className="max-w-md font-mono text-xs leading-relaxed break-words text-shell-muted">
        {detail}
      </p>
    </div>
  )
}
