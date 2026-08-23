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
 * Chosen for one detail visible in the reference: the tooltip under the bold
 * button reads **Bold ⌘ B**. A shortcut printed inside a tooltip is a shape
 * this design system has an opinion about — `TooltipContent` takes `shortcut`
 * and `showShortcut` — and it is a shape the existing findings have never
 * reached, because every shortcut examined so far arrived through `Kbd` or
 * `Input kind="shortcut"`.
 *
 * The tooltip on the bold button is left `open`, as it is in the reference.
 * That is deliberate: a tooltip that only exists on hover cannot be compared
 * between two frames on a canvas, and cannot be seen at all in a screenshot.
 *
 * The document body is plain markup. Banhaten ships no prose or editor
 * component, and the toolbar is the subject here — the paragraph is only there
 * to give it something to float over and a selection to act on.
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

  body: {
    en: 'During this week’s standup, the product team discussed progress made on current tasks and any obstacles encountered. They also planned upcoming work, identified dependencies, and committed to resolving any roadblocks to keep the project on track.',
    ar: 'خلال اجتماع الوقوف لهذا الأسبوع، ناقش فريق المنتج التقدم المحرز في المهام الحالية وأي عقبات واجهتهم. كما خططوا للعمل القادم، وحددوا الاعتماديات، والتزموا بحل أي عوائق للحفاظ على مسار المشروع.',
  },
  selection: {
    en: 'During this week’s standup,',
    ar: 'خلال اجتماع الوقوف لهذا الأسبوع،',
  },

  style: { en: 'Text', ar: 'نص' },
  styleBody: { en: 'Body', ar: 'نص أساسي' },
  styleHeading: { en: 'Heading 1', ar: 'عنوان ١' },
  colour: { en: 'Text colour', ar: 'لون النص' },
  align: { en: 'Alignment', ar: 'المحاذاة' },

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
 * The shortcuts as a keyboard prints them. `⌘` is a bidi-neutral symbol and the
 * letter beside it is strong Latin, which is the pair that F-001 was about —
 * reached here through `TooltipShortcut` rather than through `Kbd`.
 */
const SHORTCUTS = {
  bold: '⌘B',
  italic: '⌘I',
  underline: '⌘U',
  strike: '⌘⇧S',
  link: '⌘K',
} as const

export default function DocEditor() {
  const {
    Avatar,
    AvatarFallback,
    Button,
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuTrigger,
    Toolbar,
    ToolbarSelect,
    TooltipProvider,
  } = useDS()
  const c = useCopy(COPY)

  const [before, rest] = splitOnce(String(c.body), String(c.selection))

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
            <Button variant="tertiary" size="sm">
              {c.share}
            </Button>

            <MenuRoot>
              <MenuTrigger asChild>
                <Button variant="tertiary" size="sm">
                  {c.insert}
                  <ChevronDown aria-hidden="true" className="size-3.5" />
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

        <main className="mx-auto max-w-[760px] px-8 pt-10 pb-20">
          <h1 className="text-4xl font-bold">{c.docTitle}</h1>

          {/* The toolbar floats over the text, which is the arrangement the
              reference uses and the one that matters: it has to read against
              prose rather than against a chrome surface of its own. */}
          <div className="relative mt-6">
            <div className="absolute -top-2 start-0 z-10 -translate-y-full">
              <Toolbar>
                <ToolbarSelect value={c.styleBody} aria-label={c.style} />

                <FormatButton shortcut={SHORTCUTS.bold} label={c.bold} defaultOpen>
                  <Bold aria-hidden="true" className="size-4" />
                </FormatButton>
                <FormatButton shortcut={SHORTCUTS.italic} label={c.italic}>
                  <Italic aria-hidden="true" className="size-4" />
                </FormatButton>
                <FormatButton shortcut={SHORTCUTS.underline} label={c.underline}>
                  <Underline aria-hidden="true" className="size-4" />
                </FormatButton>
                <FormatButton shortcut={SHORTCUTS.strike} label={c.strike}>
                  <Strikethrough aria-hidden="true" className="size-4" />
                </FormatButton>

                <ToolbarSelect value={c.colour} aria-label={c.colour} />

                <FormatButton shortcut={SHORTCUTS.link} label={c.link}>
                  <Link2 aria-hidden="true" className="size-4" />
                </FormatButton>
                <FormatButton label={c.comment}>
                  <MessageSquare aria-hidden="true" className="size-4" />
                </FormatButton>
                <FormatButton label={c.image}>
                  <Image aria-hidden="true" className="size-4" />
                </FormatButton>
                <FormatButton label={c.ai}>
                  <Sparkles aria-hidden="true" className="size-4" />
                </FormatButton>
              </Toolbar>
            </div>

            <p className="text-base leading-7">
              {before}
              <mark className="bg-[var(--bh-bg-accent-sky-subtle,#dbeafe)] text-[var(--foreground)]">
                {c.selection}
              </mark>
              {rest}
            </p>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}

/**
 * One toolbar button and the tooltip that names it.
 *
 * `defaultOpen` holds one of them open, matching the reference. Radix keeps a
 * `defaultOpen` tooltip open until something else takes over, which is what
 * makes it comparable between two frames instead of only reachable by hovering
 * inside an iframe on a canvas.
 */
function FormatButton({
  label,
  shortcut,
  defaultOpen,
  children,
}: {
  label: string
  shortcut?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const { Tooltip, TooltipContent, TooltipTrigger, ToolbarIconButton } = useDS()

  return (
    <Tooltip defaultOpen={defaultOpen}>
      <TooltipTrigger asChild>
        <ToolbarIconButton aria-label={label}>{children}</ToolbarIconButton>
      </TooltipTrigger>
      <TooltipContent side="bottom" shortcut={shortcut} showShortcut={Boolean(shortcut)}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function PlainIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} className="grid size-7 place-items-center opacity-60">
      {children}
    </button>
  )
}

/** Splits the body once so the selected run can be marked without a rich editor. */
function splitOnce(text: string, needle: string): [string, string] {
  const at = text.indexOf(needle)
  if (at === -1) return ['', text]
  return [text.slice(0, at), text.slice(at + needle.length)]
}
