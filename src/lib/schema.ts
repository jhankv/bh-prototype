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
  type: z.enum(['view', 'document']).default('view'),
  /** Path relative to the project folder, e.g. "views/orders-table.tsx". */
  src: z.string().min(1),
  sandbox: z.string().default('none'),
  x: z.number(),
  y: z.number(),
  width: z.number().positive().default(1440),
  height: z.number().positive().default(900),
  // zod v4 defaults take the OUTPUT shape, so build it from the schema itself.
  appearance: AppearanceSchema.default(() => AppearanceSchema.parse({})),
  caption: z.string().optional(),
})

export const SectionSchema = z.object({
  title: z.string().min(1),
  frames: z.array(FrameSchema),
})

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
export type Section = z.infer<typeof SectionSchema>
export type Canvas = z.infer<typeof CanvasSchema>
export type Manifest = z.infer<typeof ManifestSchema>

/** Flattens a zod error into a short, human-readable line for an error frame. */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join(' · ')
}
