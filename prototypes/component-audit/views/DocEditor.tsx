import { useState } from 'react'
import {
  ArrowLeft,
  Bell,
  Bold,
  ChevronDown,
  FileText,
  Image,
  Italic,
  Link2,
  Mail,
  MessageSquare,
  Settings,
  Sparkles,
  Strikethrough,
  Underline,
} from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'

/**
 * Coda's document editor with its floating formatting toolbar, reproduced as
 * faithfully as Banhaten allows.
 *
 * https://mobbin.com/screens/d43c69b1-4c44-461a-8af9-4b9047d0ab0a
 *
 * **This screen does not use `Toolbar`, and that is the finding rather than an
 * omission.** The first attempt did, and it looked wrong — controls at form
 * width, no grouping, no surface. Checking why: `Toolbar` is imported by exactly
 * one file in the whole design system, `expanded/Table.tsx`, and its exports are
 * `ToolbarSearch`, `ToolbarFilterButton`, `ToolbarMoreButton`, `ToolbarBadge`
 * and `ToolbarText`. Search, filters, more, a count. It is a **list toolbar**.
 * A rich-text formatting bar is a different instrument, and forcing one into
 * the other would have produced a convincing false defect — the worst thing
 * this playground can make.
 *
 * So the controls here are the ones whose contracts actually match:
 *
 * - **Bold, italic, underline, strikethrough** are independent states that can
 *   all be on at once, which is `ToggleGroup type="multiple"` exactly. Each item
 *   carries its own `aria-pressed`.
 * - **Link, comment, image, AI** fire and forget, so they are a `ButtonGroup`,
 *   not toggles. Putting an action in a toggle group would lie to a screen
 *   reader about whether it is currently on.
 * - **The style picker** opens a list and commits a value, which is `Select`.
 * - Both groups take `mode="iconOnly"`, which is the variant these components
 *   have for exactly this shape, and both are sized with `density`. That is not
 *   a preference: `ButtonGroup size="sm"` is 36px while `ToggleGroup
 *   density="compact"` is 32, so mixing the two vocabularies inside one bar put
 *   the action group 4px taller than everything beside it. `density` is the
 *   only word that means the same thing in both — see `architecture-4`.
 *
 * The icons inside both groups carry no size class. The groups set one through
 * `[&_svg]`, which is a descendant selector and outranks a utility on the
 * element, so a `size-4` written here never applied and only claimed to.
 *
 * The floating surface — the rounded panel with a shadow that the bar sits on —
 * is plain markup, because Banhaten ships no floating-toolbar surface and
 * inventing one as a component would put ours under test instead of theirs.
 *
 * The formatting works. Pressing bold bolds the selected run, and the style
 * picker changes it. A toolbar whose buttons do nothing cannot show whether its
 * pressed state reads as pressed, which is most of what there is to look at.
 */

const COPY = {
  back: { en: 'Back', ar: 'رجوع' },
  docTitle: { en: 'Weekly Standup', ar: 'اجتماع الوقوف الأسبوعي' },
  share: { en: 'Share', ar: 'مشاركة' },
  insert: { en: 'Insert', ar: 'إدراج' },
  insertTable: { en: 'Table', ar: 'جدول' },
  insertImage: { en: 'Image', ar: 'صورة' },
  insertPage: { en: 'Subpage', ar: 'صفحة فرعية' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  messages: { en: 'Messages', ar: 'الرسائل' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },

  lead: {
    en: 'During this week’s standup,',
    ar: 'خلال اجتماع الوقوف لهذا الأسبوع،',
  },
  rest: {
    en: ' the product team discussed progress made on current tasks and any obstacles encountered. They also planned upcoming work, identified dependencies, and committed to resolving any roadblocks to keep the project on track.',
    ar: ' ناقش فريق المنتج التقدم المحرز في المهام الحالية وأي عقبات واجهتهم. كما خططوا للعمل القادم، وحددوا الاعتماديات، والتزموا بحل أي عوائق للحفاظ على مسار المشروع.',
  },

  styleLabel: { en: 'Paragraph style', ar: 'نمط الفقرة' },
  styleBody: { en: 'Body', ar: 'نص أساسي' },
  styleHeading: { en: 'Heading 2', ar: 'عنوان ٢' },
  styleQuote: { en: 'Quote', ar: 'اقتباس' },

  formatLabel: { en: 'Text formatting', ar: 'تنسيق النص' },
  actionsLabel: { en: 'Insert', ar: 'إدراج' },

  bold: { en: 'Bold', ar: 'عريض' },
  italic: { en: 'Italic', ar: 'مائل' },
  underline: { en: 'Underline', ar: 'تسطير' },
  strike: { en: 'Strikethrough', ar: 'يتوسطه خط' },
  link: { en: 'Link', ar: 'رابط' },
  comment: { en: 'Comment', ar: 'تعليق' },
  image: { en: 'Image', ar: 'صورة' },
  ai: { en: 'AI', ar: 'ذكاء اصطناعي' },
} as const

/**
 * The shortcuts as a keyboard prints them. `⌘` is a bidi-neutral symbol beside a
 * strong Latin letter — the pair kbd-1 was about — reached here through
 * `TooltipShortcut`, which is its own span rather than `Kbd`.
 */
const SHORTCUTS = {
  bold: '⌘B',
  italic: '⌘I',
  underline: '⌘U',
  strike: '⌘⇧S',
  link: '⌘K',
} as const

const MARKS = {
  bold: 'font-bold',
  italic: 'italic',
  underline: 'underline',
  strike: 'line-through',
} as const

const STYLES = {
  body: 'text-base leading-7',
  heading: 'text-2xl font-semibold leading-snug',
  quote: 'border-s-2 border-[var(--bh-border-default)] ps-4 text-base leading-7 italic',
} as const

export default function DocEditor() {
  const {
    Avatar,
    AvatarFallback,
    Button,
    ButtonGroup,
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuTrigger,
    Select,
    SelectMenuItem,
    ToggleGroup,
    TooltipProvider,
  } = useDS()
  const c = useCopy(COPY)

  // Bold arrives already on, matching the reference, so the pressed and
  // unpressed states of one group are both visible without touching anything.
  const [marks, setMarks] = useState<string[]>(['bold'])
  const [style, setStyle] = useState<keyof typeof STYLES>('body')

  const styleLabel =
    style === 'body' ? c.styleBody : style === 'heading' ? c.styleHeading : c.styleQuote

  const markClass = marks
    .map((mark) => MARKS[mark as keyof typeof MARKS])
    .filter(Boolean)
    .join(' ')

  return (
    <TooltipProvider>
      <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
        <header className="flex items-center gap-3 border-b border-[var(--bh-border-default)] px-4 py-2.5">
          <button type="button" aria-label={c.back} className="shrink-0">
            <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          </button>
          <FileText aria-hidden="true" className="size-4 shrink-0 opacity-50" />
          <span className="min-w-0 truncate text-sm font-medium">{c.docTitle}</span>

          <div className="ms-auto flex items-center gap-2">
            <Button variant="ghost" density="compact">
              {c.share}
            </Button>

            <MenuRoot>
              <MenuTrigger asChild>
                <Button variant="ghost" density="compact">
                  {c.insert}
                  <ChevronDown aria-hidden="true" data-icon="inline-end" />
                </Button>
              </MenuTrigger>
              <MenuContent align="end">
                <MenuItem>{c.insertTable}</MenuItem>
                <MenuItem>{c.insertImage}</MenuItem>
                <MenuItem>{c.insertPage}</MenuItem>
              </MenuContent>
            </MenuRoot>

            <PlainIcon label={c.settings}>
              <Settings aria-hidden="true" className="size-4" />
            </PlainIcon>
            <PlainIcon label={c.messages}>
              <Mail aria-hidden="true" className="size-4" />
            </PlainIcon>
            <PlainIcon label={c.notifications}>
              <Bell aria-hidden="true" className="size-4" />
            </PlainIcon>

            <Avatar size="sm">
              <AvatarFallback>JK</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="mx-auto max-w-[760px] px-8 pt-12 pb-20">
          <h1 className="text-4xl font-bold">{c.docTitle}</h1>

          {/* The bar overlaps the heading, as it does in the reference — it
              floats over the document rather than beside it. The gap is tuned so
              the overlap clips the heading's descenders and not its x-height:
              a title cut in half is our layout, not Coda's. */}
          <div className="relative mt-16">
            {/* The floating surface is ours. Banhaten has no component for a bar
                that hovers over prose, and the shape only reads correctly with
                one, so it is stated here rather than faked with a component
                that means something else. */}
            <div className="absolute -top-3 start-0 z-10 -translate-y-full">
              <div className="flex items-center gap-1.5 rounded-[var(--bh-radius-lg-8)] border border-[var(--bh-border-default)] bg-[var(--bh-bg-default,white)] p-1.5 shadow-[var(--shadow-md)]">
                <div className="w-[132px]">
                  <Select
                    density="compact"
                    aria-label={c.styleLabel}
                    selectValue={style}
                    value={styleLabel}
                    onValueChange={(next: string) => setStyle(next as keyof typeof STYLES)}
                  >
                    <SelectMenuItem value="body" label={c.styleBody} />
                    <SelectMenuItem value="heading" label={c.styleHeading} />
                    <SelectMenuItem value="quote" label={c.styleQuote} />
                  </Select>
                </div>

                <Divider />

                {/* Independent states that can all be on at once. */}
                <ToggleGroup
                  type="multiple"
                  mode="iconOnly"
                  density="compact"
                  aria-label={c.formatLabel}
                  value={marks}
                  onValueChange={(next: string | string[]) =>
                    setMarks(Array.isArray(next) ? next : [next])
                  }
                >
                  <MarkButton value="bold" label={c.bold} shortcut={SHORTCUTS.bold} defaultOpen>
                    <Bold aria-hidden="true" />
                  </MarkButton>
                  <MarkButton value="italic" label={c.italic} shortcut={SHORTCUTS.italic}>
                    <Italic aria-hidden="true" />
                  </MarkButton>
                  <MarkButton value="underline" label={c.underline} shortcut={SHORTCUTS.underline}>
                    <Underline aria-hidden="true" />
                  </MarkButton>
                  <MarkButton value="strike" label={c.strike} shortcut={SHORTCUTS.strike}>
                    <Strikethrough aria-hidden="true" />
                  </MarkButton>
                </ToggleGroup>

                <Divider />

                {/* Actions, not states. A toggle group here would tell a screen
                    reader that "Comment" is currently on. */}
                <ButtonGroup mode="iconOnly" density="compact" aria-label={c.actionsLabel}>
                  <ActionButton label={c.link} shortcut={SHORTCUTS.link}>
                    <Link2 aria-hidden="true" />
                  </ActionButton>
                  <ActionButton label={c.comment}>
                    <MessageSquare aria-hidden="true" />
                  </ActionButton>
                  <ActionButton label={c.image}>
                    <Image aria-hidden="true" />
                  </ActionButton>
                  <ActionButton label={c.ai}>
                    <Sparkles aria-hidden="true" />
                  </ActionButton>
                </ButtonGroup>
              </div>
            </div>

            <p className={STYLES[style]}>
              <mark className={`bg-[#dbeafe] text-inherit ${markClass}`}>{c.lead}</mark>
              {c.rest}
            </p>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}

/**
 * One item of the formatting toggle group, wrapped in the tooltip that names it
 * and prints its shortcut.
 *
 * `defaultOpen` holds the first one open, matching the reference. A tooltip that
 * only exists on hover cannot be compared between two frames on a canvas, and
 * cannot be seen in a screenshot at all.
 */
function MarkButton({
  value,
  label,
  shortcut,
  defaultOpen,
  children,
}: {
  value: string
  label: string
  shortcut?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const { ToggleGroupItem, Tooltip, TooltipContent, TooltipTrigger } = useDS()

  return (
    <Tooltip defaultOpen={defaultOpen}>
      <TooltipTrigger asChild>
        <ToggleGroupItem value={value} aria-label={label}>
          {children}
        </ToggleGroupItem>
      </TooltipTrigger>
      <TooltipContent side="bottom" shortcut={shortcut} showShortcut={Boolean(shortcut)}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function ActionButton({
  label,
  shortcut,
  children,
}: {
  label: string
  shortcut?: string
  children: React.ReactNode
}) {
  const { ButtonGroupItem, Tooltip, TooltipContent, TooltipTrigger } = useDS()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ButtonGroupItem aria-label={label}>{children}</ButtonGroupItem>
      </TooltipTrigger>
      <TooltipContent side="bottom" shortcut={shortcut} showShortcut={Boolean(shortcut)}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="h-5 w-px shrink-0 bg-[var(--bh-border-default)]"
    />
  )
}

function PlainIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} className="grid size-7 place-items-center opacity-60">
      {children}
    </button>
  )
}
