import { useDS } from '@/ds'
import { Gallery, Group, Item } from '../gallery'

/**
 * The cases no real screen produces.
 *
 * Eight faithful reproductions cover almost every component, but six findings
 * have no frame on this canvas, and each is missing for a different reason:
 *
 * - `table-2`, `breadcrumbs-1` and `page-header-2` are about Latin text inside
 *   an RTL document. Every `-rtl` twin here reads Arabic, which is a different
 *   test and the right one for a different set of defects. `src/copy.ts` says
 *   so in its own docstring: "a real case, and the one that produced three
 *   findings, but only one of them." Those three lost their screen when the
 *   Sales Console went, and Arabic copy could not give it back.
 * - `avatar-1` needs Arabic names, and no reproduction carries any.
 * - `badge-2` needs a colour outside the union, which no product screen would
 *   ever pass on purpose.
 * - `badge-1` needs the same colour asked for twice, once through `Badge` and
 *   once through a `Table` badge cell. The point is that both rows look right:
 *   the restriction is in the type, not the rendering, and prose alone reads as
 *   if the colours were missing.
 *
 * So this file does not reproduce a product. It states each case with the
 * smallest data that shows it, which is what the two variant galleries already
 * do for `Button` and `Input`.
 *
 * Every string here is hardcoded rather than routed through `useCopy`. That is
 * the point of the first group: `useCopy` follows the frame's direction, so an
 * RTL frame written with it can never show Latin text in an RTL container.
 */

/** One long Latin name, so truncation has something to cut. */
const LONG_NAME = 'Maximiliano Alessandro Fernández de la Vega y Santibáñez'
const LONG_EMAIL = 'maximiliano.alessandro.fernandez@e-procurement.example.com'

/** The three names from `avatar-1`, kept exactly as the entry lists them. */
const ARABIC_NAMES = [
  'عاشور عوضية',
  'سفيان تومي',
  'عبد الرحمن بن محمد بن عبد الله آل سعود الشمري',
]

/**
 * `Badge` accepts ten colours. `red` is not one of them, and is the obvious
 * guess for a failure state — which is the whole of `badge-2`.
 */
const BADGE_COLORS = [
  'neutral',
  'blue',
  'green',
  'amber',
  'danger',
  'purple',
  'fuchsia',
  'rose',
  'sky',
  'golden',
] as const

/**
 * `red` is not one of them, and is the obvious guess for a failure state — the
 * token behind `danger` is literally `--bh-bg-accent-red-subtle`.
 */
const INVALID_BADGE_COLOR = 'red'

/**
 * `badge-1`: the ten colours `Badge` takes, asked for through a `Table` badge
 * cell whose `tone` type lists seven. All ten arrive, because `badgeColor()`
 * forwards anything it does not special-case. The five TypeScript rejects are
 * asked for under a `@ts-expect-error`, which is what makes this a specimen
 * rather than a bug: the directive fails if the union ever widens to admit them.
 */
const TONE_REQUESTS = BADGE_COLORS.map((color, index) => ({
  id: String(index),
  label: color,
  tone: color,
}))

/**
 * `architecture-3`: the same control asked for four ways. `compact` is the
 * documented answer, `md` is what it resolves to, and `sm` is the plausible
 * guess that belongs to `Button` and `Table` but not to `Select`.
 */
const SIZE_REQUESTS = [
  { label: 'density="compact"', props: { density: 'compact' as const } },
  { label: 'size="md"', props: { size: 'md' as const } },
  { label: 'size="lg"', props: { size: 'lg' as const } },
]

export default function Specimens() {
  const { Badge, PageHeader, Select, SelectMenuItem, Table } = useDS()

  // `table-2` is about the `avatarText` cell specifically, and no reproduction
  // on this canvas uses one. The width is deliberately too small for the name:
  // the defect is which end the ellipsis eats, so the string has to be cut.
  const bidiColumns = [
    {
      id: 'customer',
      header: 'Customer',
      width: 220,
      item: () => ({ type: 'avatarText' as const, name: LONG_NAME, caption: LONG_EMAIL }),
    },
    {
      id: 'reference',
      header: 'Reference',
      width: 120,
      renderCell: () => <span className="font-mono text-xs">NH4392</span>,
    },
    // `.ds-table` carries `min-width: 960px`, so the table cannot be narrowed to
    // fit the customer column. A filling column soaks up the remainder instead,
    // which leaves `customer` at its declared 220 and the name with nowhere to
    // go but the ellipsis.
    { id: 'spacer', header: '', width: 'fill' as const, renderCell: () => null },
  ]

  const arabicColumns = [
    {
      id: 'person',
      header: 'Person',
      width: 'fill' as const,
      item: (row: { id: string; name: string }) => ({
        type: 'avatarText' as const,
        name: row.name,
      }),
    },
  ]

  const toneColumns = [
    {
      id: 'requested',
      header: 'Requested tone',
      width: 200,
      renderCell: (row: { label: string }) => (
        <span className="font-mono text-xs">{row.label}</span>
      ),
    },
    {
      id: 'rendered',
      header: 'What arrives',
      width: 'fill' as const,
      item: (row: { id: string; label: string; tone: string }) => ({
        type: 'badges' as const,
        items: [{ label: row.label, tone: row.tone }],
      }),
    },
  ]

  return (
    <Gallery
      title="Specimens"
      subtitle="Six findings whose case no product screen produces"
    >
      <Group
        label="Bidi isolation"
        note="Latin strings, hardcoded. In an RTL frame these stay Latin, which is the case table-2, breadcrumbs-1 and page-header-2 are about. Open this view at dir=rtl and compare against dir=ltr."
      >
        <div className="w-full space-y-6">
          <PageHeader
            breadcrumbs={[{ label: LONG_NAME, href: '#' }]}
            title="Purchases overview"
            description="Every completed transaction across Retail, Online and Wholesale."
          />
          <div className="min-w-0 overflow-x-auto">
            <Table columns={bidiColumns} rows={[{ id: '1' }]} size="sm" />
          </div>
        </div>
      </Group>

      <Group
        label="Avatar initials, Arabic names"
        note="avatar-1. The derivation is expanded/Table.tsx, not avatar.tsx — it takes the first letter of the first two words and uppercases them."
      >
        <div className="w-full min-w-0 overflow-x-auto">
          <Table
            columns={arabicColumns}
            rows={ARABIC_NAMES.map((name, index) => ({ id: String(index), name }))}
            size="sm"
          />
        </div>
      </Group>

      <Group
        label="Badge colours"
        note="Every colour Badge accepts, plus one it does not. badge-2 is the last item: outside the union, it renders as bare text rather than failing."
      >
        {BADGE_COLORS.map((color) => (
          <Item key={color} label={color}>
            <Badge color={color}>Refunded</Badge>
          </Item>
        ))}
        <Item label={`${INVALID_BADGE_COLOR} — not in the union`}>
          <Badge
            // @ts-expect-error `red` is outside Badge's colour union. That is
            // the finding: it renders unstyled instead of failing. The directive
            // also guards the specimen — if `red` is ever added, this stops
            // compiling and `badge-2` needs rereading.
            color={INVALID_BADGE_COLOR}
          >
            Refunded
          </Badge>
        </Item>
      </Group>

      <Group
        label="One control, four ways to ask for its height"
        note="architecture-3. sm is valid on Button and on Table and absent from Select, so the last trigger gets no padding class at all and collapses onto its own text."
      >
        {SIZE_REQUESTS.map((request) => (
          <Item key={request.label} label={request.label}>
            <div className="w-[150px]">
              <Select selectValue="stock" value="stock" {...request.props}>
                <SelectMenuItem value="stock" label="stock" />
              </Select>
            </div>
          </Item>
        ))}

        {/* Written out rather than folded into the list above, because it is the
            only one the compiler rejects and the directive has to sit on the
            attribute that causes it. */}
        <Item label={'size="sm" — not in the union'}>
          <div className="w-[150px]">
            <Select
              selectValue="stock"
              value="stock"
              // @ts-expect-error `sm` is real on Button, Table and Badge, and
              // absent from Select. cva matches no rule, applies no padding, and
              // the trigger collapses onto its own text. See `architecture-3`.
              size="sm"
            >
              <SelectMenuItem value="stock" label="stock" />
            </Select>
          </div>
        </Item>
      </Group>

      <Group
        label="The same colours through Table's badge cell"
        note="badge-1. All ten render. Five of them — green, purple, rose, sky, golden — are outside the declared tone type, so they work at runtime and fail to compile."
      >
        <div className="w-full min-w-0 overflow-x-auto">
          <Table
            // @ts-expect-error five of the ten tones are outside the declared
            // union and render correctly anyway. That gap is `badge-1`.
            columns={toneColumns}
            rows={TONE_REQUESTS}
            size="sm"
          />
        </div>
      </Group>
    </Gallery>
  )
}
