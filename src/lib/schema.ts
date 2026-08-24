import { z } from 'zod'

/**
 * Appearance maps one-to-one onto Banhaten's documented HTML attributes:
 * class="dark", data-theme, data-radius, and dir.
 */
export const AppearanceSchema = z.object({
  mode: z.enum(['light', 'dark']).default('light'),
  theme: z
    .enum(['blue', 'gray', 'brown', 'orange', 'green', 'purple', 'teal'])
    .default('blue'),
  radius: z.enum(['default', 'rounded', 'sharp']).default('default'),
  dir: z.enum(['ltr', 'rtl']).default('ltr'),
})

export const FrameSchema = z.object({
  id: z.string().min(1),
  /** Path relative to the project folder, e.g. "views/orders-table.tsx". */
  src: z.string().min(1),
  sandbox: z.string().default('none'),
  /**
   * The viewport the frame opens at — NOT its place on the board.
   *
   * Position is derived from the grouping in `src/canvas/layout.ts`; size is
   * authored, because a dialog and a table browser want different ones.
   */
  width: z.number().positive().default(1440),
  height: z.number().positive().default(900),
  // zod v4 defaults take the OUTPUT shape, so build it from the schema itself.
  appearance: AppearanceSchema.default(() => AppearanceSchema.parse({})),
  caption: z.string().optional(),
  /**
   * The screen this frame reproduces, when it reproduces one.
   *
   * A faithful reproduction is only worth calling faithful if the reader can
   * check it, and a defect claimed against a real product is only credible next
   * to the product. Recorded per frame rather than per project because two
   * frames of one project can model two different screens.
   */
  reference: z.url().optional(),
})

export const RowSchema = z.object({
  label: z.string().min(1).optional(),
  frames: z.array(FrameSchema).min(1),
})

/**
 * A section is one or more rows. Most are a single unlabelled row, so `frames`
 * is accepted as shorthand for exactly that and normalised away here — the
 * layout code then only ever sees rows, and never branches on which spelling
 * the file used.
 *
 * Exactly one of the two, because a section carrying both would have to pick a
 * winner, and every rule for picking one is a rule someone has to remember.
 */
export const SectionSchema = z
  .object({
    title: z.string().min(1),
    frames: z.array(FrameSchema).min(1).optional(),
    rows: z.array(RowSchema).min(1).optional(),
  })
  .superRefine((section, ctx) => {
    if (!section.frames === !section.rows) {
      ctx.addIssue({
        code: 'custom',
        message: 'a section needs exactly one of "frames" or "rows"',
      })
    }
  })
  .transform(({ title, frames, rows }) => ({
    title,
    rows: rows ?? [{ frames: frames ?? [] }],
  }))

export const CanvasSchema = z.object({
  sections: z.array(SectionSchema),
})

export const ManifestSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  /** Frame id used as the dashboard card preview. */
  cover: z.string().optional(),
})

export type Appearance = z.infer<typeof AppearanceSchema>
export type Frame = z.infer<typeof FrameSchema>
export type Row = z.infer<typeof RowSchema>
export type Section = z.infer<typeof SectionSchema>
export type Canvas = z.infer<typeof CanvasSchema>
export type Manifest = z.infer<typeof ManifestSchema>

/**
 * What a frame renders is its file, not a separate field.
 *
 * Views are `.tsx` under `views/` and documents are `.md`/`.mdx` under
 * `documents/`; the globs that load them already enforce that split, so a
 * `type` field alongside `src` could
 * only ever repeat it or contradict it — and `type: "view"` pointing at a `.md`
 * was a state the schema allowed and nothing could render.
 */
export function isDocument(src: string): boolean {
  return src.endsWith('.md') || src.endsWith('.mdx')
}

/** Flattens a zod error into a short, human-readable line for an error frame. */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join(' · ')
}
