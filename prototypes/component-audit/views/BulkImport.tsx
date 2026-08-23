import { Check, Folder, X } from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'

/**
 * PandaDoc's bulk import dialog, reproduced as faithfully as Banhaten allows.
 *
 * https://mobbin.com/screens/6e7783c1-2ce2-4ba2-832d-bab89ec45f67
 *
 * Chosen because it shows four things loading at once at four different
 * percentages — 51, 13, 22 and 12. One progress indicator says whether the
 * component works; four stacked says whether they agree with each other, which
 * is the only question this playground is built to answer. Four bars at four
 * fills, with four labels of different lengths beside them, is where a track
 * that sizes itself to its label instead of to its row becomes visible.
 *
 * The filenames are the reference's own and they are long on purpose. A file
 * called `Grey minimalist business project presentation .pdf` competes with the
 * progress track for the row, and truncation of a filename is a real defect in
 * a dialog whose job is to tell you which file is stuck.
 *
 * `Progress` carries `showSpinner`, so the spinner beside each row is the
 * component's own rather than one placed next to it. The bare `Spinner` in the
 * header is the same component with nothing around it, which is what makes the
 * pair comparable.
 */

const COPY = {
  stepSelect: { en: 'Select documents', ar: 'اختيار المستندات' },
  stepImport: { en: 'Import', ar: 'استيراد' },
  close: { en: 'Close', ar: 'إغلاق' },

  title: { en: 'Imported 0 of 4 files', ar: 'تم استيراد ٠ من ٤ ملفات' },
  folder: { en: 'All', ar: 'الكل' },
  keepOpen: {
    en: 'Keep this window open so your bulk import can continue uninterrupted.',
    ar: 'أبقِ هذه النافذة مفتوحة حتى يستمر الاستيراد المجمّع دون انقطاع.',
  },
  cancel: { en: 'Cancel import', ar: 'إلغاء الاستيراد' },
  uploading: { en: 'Uploading', ar: 'جارٍ الرفع' },
  importing: { en: 'Importing', ar: 'جارٍ الاستيراد' },
} as const

/**
 * The reference's own four files and percentages. Seeded, because frames on one
 * canvas exist to be compared and random values make every difference noise.
 */
const FILES = [
  { name: 'Grey minimalist business project presentation .pdf', percent: 51 },
  { name: 'Blue Modern Company Profile Presentation.pdf', percent: 13 },
  { name: 'Blue Dark Professional Geometric Business Project Presentation .pdf', percent: 22 },
  { name: 'Grey Modern Professional Business Project Presentation.pdf', percent: 12 },
] as const

export default function BulkImport() {
  const { Button, Progress, Spinner } = useDS()
  const c = useCopy(COPY)

  return (
    <div className="min-h-dvh bg-[var(--bh-bg-neutral-subtle,#f4f5f7)] p-6">
      <section className="mx-auto max-w-[900px] rounded-[var(--bh-radius-lg-8)] bg-[var(--background)] text-[var(--foreground)] shadow-[var(--shadow-md)]">
        <header className="flex items-center gap-3 border-b border-[var(--bh-border-default)] px-6 py-3.5">
          <div className="mx-auto flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-[var(--bh-content-subtle)]">
              <Check aria-hidden="true" className="size-3.5" />
              {c.stepSelect}
            </span>
            <span aria-hidden="true" className="text-[var(--bh-content-subtle)] rtl:rotate-180">
              ›
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-[var(--bh-radius-full)] bg-[var(--bh-interactive-brand-default)]"
              />
              {c.stepImport}
            </span>
          </div>
          <button type="button" aria-label={c.close} className="shrink-0">
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="px-8 py-7">
          <h1 className="flex items-center gap-2.5 text-xl font-semibold">
            {/* The same component the rows reach through `showSpinner`, here on
                its own — so the two can be compared without hunting. */}
            <Spinner aria-hidden="true" className="size-4" />
            {c.title}
          </h1>

          <p className="mt-3 flex items-center gap-1.5 text-sm">
            <Folder aria-hidden="true" className="size-4 opacity-50" />
            {c.folder}
          </p>
          <p className="mt-1.5 text-sm text-[var(--bh-content-subtle)]">{c.keepOpen}</p>

          <div className="mt-5 grid gap-2">
            {FILES.map((file) => (
              <div
                key={file.name}
                className="rounded-[var(--bh-radius-md)] border border-[var(--bh-border-default)] px-4 py-3"
              >
                <Progress
                  value={file.percent}
                  label={file.name}
                  helperText={`${c.uploading} ${file.percent}%`}
                  showSpinner
                  showInfo
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="secondary">{c.cancel}</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
