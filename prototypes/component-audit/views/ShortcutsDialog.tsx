import { X } from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'

/**
 * Relume's keyboard shortcuts dialog, reproduced as faithfully as Banhaten
 * allows.
 *
 * https://mobbin.com/screens/d6b809da-7f84-4812-be03-d0b61decff90
 *
 * The only screen in this audit that uses `Kbd` directly, and that is the whole
 * reason it exists. `kbd-2` narrowed the original finding to exactly this path:
 * anyone reaching for `KbdShortcut` or `Input kind="shortcut"` was already safe,
 * because those wrappers set `dir="ltr"` themselves. `<Kbd>⌘C</Kbd>` does not.
 *
 * Relume's own list happens to cover every case that matters:
 *
 * - `⌘C`, `⌘X`, `⌘V` are a bidi-neutral glyph beside a strong Latin letter,
 *   which is the pair the reordering acts on
 * - `⇧⌘Z` stacks two neutral glyphs before the letter
 * - `Enter`, `Esc` and `Delete` are strong LTR words and should not move at all
 * - `1`, `2`, `3` are digits, which behave differently again
 * - `Esc or V` puts prose between two keys
 *
 * A fixture where every shortcut is `⌘K` would show one third of that.
 */

const COPY = {
  title: { en: 'Keyboard shortcuts', ar: 'اختصارات لوحة المفاتيح' },
  close: { en: 'Close', ar: 'إغلاق' },

  groupEdit: { en: 'Edit', ar: 'تحرير' },
  groupView: { en: 'View', ar: 'عرض' },
  groupLayout: { en: 'Layout', ar: 'التخطيط' },
  groupTools: { en: 'Tools', ar: 'الأدوات' },

  copy: { en: 'Copy', ar: 'نسخ' },
  cut: { en: 'Cut', ar: 'قص' },
  paste: { en: 'Paste', ar: 'لصق' },
  duplicate: { en: 'Duplicate', ar: 'تكرار' },
  del: { en: 'Delete', ar: 'حذف' },
  undo: { en: 'Undo', ar: 'تراجع' },
  redo: { en: 'Redo', ar: 'إعادة' },
  selectChild: { en: 'Select child', ar: 'تحديد العنصر الفرعي' },
  selectParent: { en: 'Select parent', ar: 'تحديد العنصر الأصل' },

  zoomIn: { en: 'Zoom in', ar: 'تكبير' },
  zoomOut: { en: 'Zoom out', ar: 'تصغير' },
  zoomFit: { en: 'Zoom to fit', ar: 'ملاءمة العرض' },
  editPanel: { en: 'Show edit panel', ar: 'إظهار لوحة التحرير' },
  addPanel: { en: 'Show add panel', ar: 'إظهار لوحة الإضافة' },
  comments: { en: 'Toggle comments', ar: 'تبديل التعليقات' },
  sitemap: { en: 'Sitemap view', ar: 'عرض خريطة الموقع' },
  wireframe: { en: 'Wireframe view', ar: 'عرض الهيكل' },
  desktop: { en: 'Desktop breakpoint', ar: 'نقطة توقف سطح المكتب' },
  tablet: { en: 'Tablet breakpoint', ar: 'نقطة توقف الجهاز اللوحي' },
  mobile: { en: 'Mobile breakpoint', ar: 'نقطة توقف الجوال' },

  newPage: { en: 'Add new page', ar: 'إضافة صفحة جديدة' },
  newSection: { en: 'Add new section', ar: 'إضافة قسم جديد' },
  moveUp: { en: 'Move section up', ar: 'نقل القسم لأعلى' },
  moveDown: { en: 'Move section down', ar: 'نقل القسم لأسفل' },

  addComment: { en: 'Add comment', ar: 'إضافة تعليق' },
  exitCommenting: { en: 'Exit commenting', ar: 'إنهاء وضع التعليق' },
  or: { en: 'or', ar: 'أو' },
} as const

/**
 * One row. The keys are `Kbd` children, which is the path `kbd-2` narrowed the
 * defect down to. Declared at module scope rather than inside the screen: a
 * component created during render is a new type on every pass, and React resets
 * its state each time.
 */
function Row({ label, keys }: { label: string; keys: string[] }) {
  const { Kbd } = useDS()
  const c = useCopy({ or: COPY.or })

  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="min-w-0 text-sm">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        {keys.map((key, index) => (
          <span key={key + index} className="flex items-center gap-1">
            {index > 0 && <span className="text-xs text-[var(--bh-content-subtle)]">{c.or}</span>}
            <Kbd>{key}</Kbd>
          </span>
        ))}
      </span>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-1.5 text-xs font-medium text-[var(--bh-content-subtle)]">{title}</h2>
      {children}
    </section>
  )
}

export default function ShortcutsDialog() {
  const c = useCopy(COPY)

  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--bh-bg-neutral-subtle,#f4f5f7)] p-8">
      <section className="w-full max-w-[880px] rounded-[var(--bh-radius-lg-8)] bg-[var(--background)] p-7 text-[var(--foreground)] shadow-[var(--shadow-md)]">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold">{c.title}</h1>
          <button type="button" aria-label={c.close}>
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="grid gap-x-10 gap-y-0 sm:grid-cols-3">
          <div>
            <Group title={c.groupEdit}>
              {/* Bidi-neutral glyph plus a strong Latin letter. The pair kbd-1
                  is about, and the reason this column comes first. */}
              <Row label={c.copy} keys={['⌘C']} />
              <Row label={c.cut} keys={['⌘X']} />
              <Row label={c.paste} keys={['⌘V']} />
              <Row label={c.duplicate} keys={['⌘D']} />
              <Row label={c.del} keys={['Delete']} />
              <Row label={c.undo} keys={['⌘Z']} />
              <Row label={c.redo} keys={['⇧⌘Z']} />
              <Row label={c.selectChild} keys={['Enter']} />
              <Row label={c.selectParent} keys={['⌥↑']} />
            </Group>
          </div>

          <div>
            <Group title={c.groupView}>
              <Row label={c.zoomIn} keys={['⌘+', 'Z']} />
              <Row label={c.zoomOut} keys={['⌘-', '⌥Z']} />
              <Row label={c.zoomFit} keys={['⌘1']} />
              <Row label={c.editPanel} keys={['⌥E']} />
              <Row label={c.addPanel} keys={['⌥A']} />
              <Row label={c.comments} keys={['⌥C']} />
              <Row label={c.sitemap} keys={['⌥S']} />
              <Row label={c.wireframe} keys={['⌥W']} />
              {/* Digits reorder differently from letters and from symbols. */}
              <Row label={c.desktop} keys={['1']} />
              <Row label={c.tablet} keys={['2']} />
              <Row label={c.mobile} keys={['3']} />
            </Group>
          </div>

          <div>
            <Group title={c.groupLayout}>
              <Row label={c.newPage} keys={['↵']} />
              <Row label={c.newSection} keys={['⇧↵']} />
              <Row label={c.moveUp} keys={['↑']} />
              <Row label={c.moveDown} keys={['↓']} />
            </Group>

            <Group title={c.groupTools}>
              <Row label={c.addComment} keys={['C']} />
              {/* Prose between two keys, which no other row here has. */}
              <Row label={c.exitCommenting} keys={['Esc', 'V']} />
            </Group>
          </div>
        </div>
      </section>
    </div>
  )
}
