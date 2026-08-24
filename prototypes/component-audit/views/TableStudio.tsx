import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Copy,
  Database,
  Eye,
  GitBranch,
  LayoutGrid,
  ListFilter,
  MoreHorizontal,
  PanelLeft,
  Plus,
  RefreshCw,
  Rows3,
  Search,
  Settings,
  Table2,
  Trash2,
  X,
} from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'
import { PRODUCTS, type Product } from './products'
import type { TableSortState } from '../../../sandboxes/banhaten/components/ui/expanded/Table'

/**
 * Neon's table browser, reproduced as faithfully as Banhaten allows.
 *
 * https://mobbin.com/screens/926541e1-1d12-4677-8faf-54193a709b17
 *
 * Chosen for one element above all: the filter builder. `where · stock · gte ·
 * 15` is three `Select`s and an `Input` sitting in a row, and a second row
 * repeats it. Controls that must line up with each other across a row, twice,
 * is the arrangement where a disagreement in height, radius, or density stops
 * being a matter of taste and becomes visible as a broken line. `architecture-3`
 * came out of exactly that row.
 *
 * Neon's chrome is a top bar and two navigation columns, and Banhaten ships no
 * component for any of it. Those parts are plain markup and deliberately plain:
 * they exist so the components under test sit in a real screen rather than on a
 * blank page, and a defect found in them would be ours, not yours. Where a real
 * component exists it is used — the plan and status chips, the upgrade button,
 * the avatar, every select, every input, every icon button, the toolbar, the
 * table.
 *
 * The row menu is the part that matters for a second pass. A component that only
 * ever renders is half-tested: `Menu` is Radix-backed, so it portals out of the
 * table, manages focus, closes on Escape and mirrors in RTL — and none of that
 * is visible until something opens it. Deleting a row here actually removes it,
 * and duplicating one actually inserts it.
 *
 * The table is `expanded/Table` rather than `table-elements`. That is not a
 * preference: `table-elements` exports structural wrappers carrying almost no
 * styling — `TableCell` and `TableBody` add no classes at all — so a screen
 * built on them would be showing my CSS, not Banhaten's, and any defect found
 * would be mine. They are primitives for `expanded/Table` to build on.
 */

const COPY = {
  account: { en: 'alexsmith.mobbin+1@example.com', ar: 'alexsmith.mobbin+1@example.com' },
  plan: { en: 'Free', ar: 'مجاني' },
  project: { en: 'SLMobbin', ar: 'SLMobbin' },
  status: { en: 'All OK', ar: 'كل شيء سليم' },
  upgrade: { en: 'Upgrade', ar: 'ترقية' },

  branch: { en: 'production', ar: 'production' },
  navProject: { en: 'Project', ar: 'المشروع' },
  navProjectItems: {
    en: ['Dashboard', 'Branches', 'Integrations', 'Settings'],
    ar: ['لوحة القيادة', 'الفروع', 'التكاملات', 'الإعدادات'],
  },
  navBranch: { en: 'Branch', ar: 'الفرع' },
  navBranchItems: {
    en: ['Overview', 'Monitoring', 'SQL Editor', 'Tables', 'Backup & Restore', 'Data Masking'],
    ar: ['نظرة عامة', 'المراقبة', 'محرر SQL', 'الجداول', 'النسخ والاستعادة', 'إخفاء البيانات'],
  },
  navBackend: { en: 'App backend', ar: 'واجهة التطبيق' },
  navBackendItems: {
    en: ['Data API', 'Auth'],
    ar: ['واجهة البيانات', 'المصادقة'],
  },
  beta: { en: 'Beta', ar: 'تجريبي' },
  feedback: { en: 'Feedback', ar: 'ملاحظات' },
  collapse: { en: 'Collapse menu', ar: 'طي القائمة' },

  tables: { en: 'Tables', ar: 'الجداول' },
  database: { en: 'neondb', ar: 'neondb' },
  studio: { en: 'Database studio', ar: 'استوديو قاعدة البيانات' },
  schema: { en: 'public', ar: 'public' },
  searchTables: { en: 'Search...', ar: 'بحث...' },
  filterTables: { en: 'Filter tables', ar: 'تصفية الجداول' },
  newTable: { en: 'New table', ar: 'جدول جديد' },
  tableName: { en: 'products', ar: 'products' },
  schemaSettings: { en: 'Schema settings', ar: 'إعدادات المخطط' },

  togglePanel: { en: 'Toggle panel', ar: 'تبديل اللوحة' },
  viewLabel: { en: 'View mode', ar: 'وضع العرض' },
  viewTable: { en: 'Table', ar: 'جدول' },
  viewGrid: { en: 'Grid', ar: 'شبكة' },
  viewRows: { en: 'Rows', ar: 'صفوف' },
  previous: { en: 'Previous', ar: 'السابق' },
  next: { en: 'Next', ar: 'التالي' },
  paging: { en: 'Paging', ar: 'التنقل بين الصفحات' },

  filters: { en: 'Filters', ar: 'عوامل التصفية' },
  columns: { en: 'Columns', ar: 'الأعمدة' },
  addRecord: { en: 'Add record', ar: 'إضافة سجل' },
  rowsTiming: { en: 'rows · 324ms', ar: 'صفوف · ٣٢٤ مللي ثانية' },
  refresh: { en: 'Refresh', ar: 'تحديث' },

  where: { en: 'where', ar: 'حيث' },
  and: { en: 'and', ar: 'و' },
  apply: { en: 'Apply', ar: 'تطبيق' },
  addFilter: { en: 'Add filter', ar: 'إضافة عامل تصفية' },
  clearFilters: { en: 'Clear filters', ar: 'مسح عوامل التصفية' },
  removeFilter: { en: 'Remove filter', ar: 'إزالة عامل التصفية' },
  filterValue: { en: 'Value', ar: 'القيمة' },

  pageSize: { en: 'Rows per page', ar: 'صفوف لكل صفحة' },
  offset: { en: 'Offset', ar: 'الإزاحة' },
  more: { en: 'More actions', ar: 'إجراءات أخرى' },

  rowActions: { en: 'Row actions', ar: 'إجراءات الصف' },
  viewRow: { en: 'View record', ar: 'عرض السجل' },
  duplicateRow: { en: 'Duplicate', ar: 'تكرار' },
  deleteRow: { en: 'Delete row', ar: 'حذف الصف' },
  exportCsv: { en: 'Export as CSV', ar: 'تصدير كملف CSV' },
  resetRows: { en: 'Reset rows', ar: 'إعادة تعيين الصفوف' },
} as const

/**
 * Neon prints the SQL type beside every column name, which is the detail that
 * makes this header row worth reproducing: a header is no longer one short word
 * but a word plus a monospaced annotation, and `numeric(10, 2)` is long enough
 * to compete with the values under it.
 */
const COLUMN_TYPES = {
  id: 'integer',
  product_name: 'varchar(255)',
  description: 'text',
  price: 'numeric(10, 2)',
  stock: 'integer',
} as const

/**
 * Neon's own column proportions. Stated rather than left to the component,
 * because a data grid whose columns divide the width evenly is not the screen
 * being reproduced — and available width is what most defects found in this
 * playground have turned out to be about.
 */
const COLUMN_WIDTHS = {
  id: 90,
  product_name: 220,
  description: 'fill',
  price: 150,
  stock: 120,
} as const

const OPERATORS = ['equals', 'gte', 'less', 'contains'] as const
const FIELDS = ['id', 'product_name', 'description', 'price', 'stock'] as const

type Sort = TableSortState

/**
 * `SegmentedControl` inherits `onValueChange` from `ToggleGroup`, whose value is
 * `string | string[]` because the same group also serves multi-select. The type
 * is local to `button-group.tsx` and not exported, so it is restated here rather
 * than widened away with `any`.
 */
type SegmentedValue = string | string[]

export default function TableStudio() {
  const {
    Avatar,
    AvatarFallback,
    Badge,
    Button,
    Input,
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuSeparator,
    MenuTrigger,
    ButtonGroup,
    ButtonGroupItem,
    SegmentedControl,
    SegmentedControlItem,
    Select,
    SelectMenuItem,
    Table,
    Toolbar,
    ToolbarButton,
    ToolbarFilterButton,
    ToolbarSection,
    ToolbarSpacer,
    ToolbarText,
  } = useDS()
  const c = useCopy(COPY)

  const [view, setView] = useState('table')
  const [selected, setSelected] = useState<string[]>([])
  const [rows, setRows] = useState<Product[]>(PRODUCTS)
  const [sort, setSort] = useState<Sort>(null)
  const [firstField, setFirstField] = useState('stock')
  const [firstOperator, setFirstOperator] = useState('gte')
  const [secondField, setSecondField] = useState('price')
  const [secondOperator, setSecondOperator] = useState('less')

  // Ordering is applied here rather than left to the component: `Table` takes
  // `sort` as controlled state and reorders nothing itself. Worth knowing before
  // someone wires a header up and waits for the rows to move.
  const visible = sortRows(rows, sort)

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id))
    setSelected((current) => current.filter((rowId) => rowId !== id))
  }

  const duplicateRow = (id: string) => {
    setRows((current) => {
      const index = current.findIndex((row) => row.id === id)
      if (index === -1) return current
      const source = current[index]
      const copy = { ...source, id: `${source.id}-copy-${current.length}` }
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)]
    })
  }

  // The selection column is `kind: "selection"`, which is how `Table` reaches
  // Banhaten's own `Checkbox` — including the header's indeterminate state once
  // some but not all rows are picked. Neon's grid has exactly this, and it is
  // the only path by which `checkbox` appears on a real screen here.
  const columns = [
    { id: 'select', kind: 'selection' as const, width: 44 },
    ...FIELDS.map((field) => ({
      id: field,
      header: field,
      sortable: true,
      width: COLUMN_WIDTHS[field],
      align:
        field === 'price' || field === 'stock' || field === 'id' ? ('end' as const) : undefined,
      renderCell: (row: Product) => <span className="font-mono text-xs">{String(row[field])}</span>,
    })),
    // A real menu inside a real grid. Radix portals the content out of the
    // table's scroll container, which is also where a z-index conflict or an
    // `overflow-x: auto` clip would show up if there were one.
    {
      id: 'actions',
      header: '',
      width: 56,
      align: 'end' as const,
      renderCell: (row: Product) => (
        <MenuRoot>
          <MenuTrigger asChild>
            <Button variant="ghost" density="compact" size="icon" aria-label={c.rowActions}>
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </MenuTrigger>
          <MenuContent width="menu" align="end">
            <MenuItem onSelect={() => undefined}>
              <Eye aria-hidden="true" data-icon="inline-start" />
              {c.viewRow}
            </MenuItem>
            <MenuItem onSelect={() => duplicateRow(row.id)}>
              <Copy aria-hidden="true" data-icon="inline-start" />
              {c.duplicateRow}
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => removeRow(row.id)}>
              <Trash2 aria-hidden="true" data-icon="inline-start" />
              {c.deleteRow}
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      ),
    },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Plain markup, with a real component wherever one exists: the plan chip,
          the status chip, the upgrade button and the avatar are all Banhaten. */}
      <header className="flex items-center gap-2.5 border-b border-[var(--bh-border-default)] px-3 py-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-[var(--bh-radius-md-6)] bg-[var(--bh-bg-neutral-bold,#111)] font-mono text-[11px] text-[var(--bh-content-on-neutral,#fff)]">
          N
        </span>
        <span className="text-[var(--bh-content-subtle)]">/</span>
        <span className="truncate text-xs" dir="auto">
          {c.account}
        </span>
        <Badge color="neutral" size="xs">
          {c.plan}
        </Badge>
        <span className="text-[var(--bh-content-subtle)]">/</span>
        <span className="text-xs font-medium">{c.project}</span>

        <span className="flex-1" />

        <Badge color="green" type="dot" size="xs">
          {c.status}
        </Badge>
        <Button variant="secondary" density="compact">
          {c.upgrade}
        </Button>
        {/* `md` is 32px, which is the compact control height. An avatar sitting
            in a row of buttons has to be one of them, not a decoration beside
            them. */}
        <Avatar size="md">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Static. Banhaten ships no sidebar, and building one would put ours
            under test instead of yours. */}
        <aside className="flex w-[200px] shrink-0 flex-col gap-5 border-e border-[var(--bh-border-default)] px-2 py-4 text-sm">
          <NavGroup label={c.navProject} items={c.navProjectItems} />

          <div className="grid gap-1">
            <NavLabel>{c.navBranch}</NavLabel>
            <span className="mx-1 mb-1 flex items-center gap-2 rounded-[var(--bh-radius-md-6)] border border-[var(--bh-border-default)] px-2 py-1.5 text-xs">
              <GitBranch aria-hidden="true" className="size-3.5 opacity-50" />
              {c.branch}
            </span>
            <NavItems
              items={c.navBranchItems}
              current={c.navBranchItems[3]}
              badgeOn={c.navBranchItems[5]}
              badge={c.beta}
            />
          </div>

          <NavGroup label={c.navBackend} items={c.navBackendItems} />

          <div className="mt-auto grid gap-1 border-t border-[var(--bh-border-default)] pt-3">
            <NavRow>{c.feedback}</NavRow>
            <NavRow>
              <PanelLeft aria-hidden="true" className="size-3.5 opacity-50" />
              {c.collapse}
            </NavRow>
          </div>
        </aside>

        {/* Neon's second column: the schema pickers stacked, which is three
            controls in a vertical run — the same alignment question as the
            filter row, turned ninety degrees. */}
        <aside className="flex w-[230px] shrink-0 flex-col gap-2.5 border-e border-[var(--bh-border-default)] px-3 py-4">
          <div className="mb-1">
            <h1 className="text-xl font-semibold">{c.tables}</h1>
            <p className="flex items-center gap-1.5 text-xs text-[var(--bh-content-subtle)]">
              <GitBranch aria-hidden="true" className="size-3" />
              {c.branch}
            </p>
          </div>

          <Select selectValue="neondb" value={c.database} density="compact">
            <SelectMenuItem value="neondb" label={c.database} />
          </Select>

          <Button variant="secondary" density="compact" className="w-full justify-start">
            <Database aria-hidden="true" data-icon="inline-start" />
            {c.studio}
          </Button>

          <Select selectValue="public" value={c.schema} density="compact">
            <SelectMenuItem value="public" label={c.schema} />
          </Select>

          <div className="flex items-center gap-1.5">
            <div className="min-w-0 flex-1">
              <Input
                density="compact"
                placeholder={c.searchTables}
                aria-label={c.searchTables}
                leadingIcon={<Search aria-hidden="true" />}
              />
            </div>
            <Button variant="outline" density="compact" size="icon" aria-label={c.filterTables}>
              <ListFilter aria-hidden="true" />
            </Button>
            <Button variant="outline" density="compact" size="icon" aria-label={c.refresh}>
              <RefreshCw aria-hidden="true" />
            </Button>
            <Button variant="outline" density="compact" size="icon" aria-label={c.newTable}>
              <Plus aria-hidden="true" />
            </Button>
          </div>

          <span className="flex items-center justify-between rounded-[var(--bh-radius-md-6)] bg-[var(--bh-bg-neutral-subtle)] px-2.5 py-1.5 font-mono text-xs">
            {c.tableName}
            <span className="text-[var(--bh-content-subtle)]">0</span>
          </span>

          <div className="mt-auto">
            <Button variant="outline" density="compact" size="icon" aria-label={c.schemaSettings}>
              <Settings aria-hidden="true" />
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* This is what `Toolbar` is for, and the match is close enough to be
              worth stating: Neon's row is a filter button, a columns button, an
              add action, a result count and two page controls. `expanded/Table`
              is the only file in the design system that imports any of them. It
              is a list toolbar, so it gets a list. */}
          <div className="border-b border-[var(--bh-border-default)] px-3 py-2">
            <Toolbar wrap>
              <ToolbarSection>
                <Button variant="secondary" density="compact" size="icon" aria-label={c.togglePanel}>
                  <PanelLeft aria-hidden="true" />
                </Button>

                {/* The ambiguous control. `SegmentedControl` declares itself as
                    `Omit<ToggleGroupProps, "itemWidth" | "mode">`, so
                    `mode="iconOnly"` is not reachable through it — and this is a
                    row of three icon-only buttons expressing one exclusive
                    choice. Used anyway, because reaching for the component whose
                    name matches the pattern is what a team would do. */}
                <SegmentedControl
                  density="compact"
                  aria-label={c.viewLabel}
                  value={view}
                  onValueChange={(value: SegmentedValue) => setView(Array.isArray(value) ? value[0] : value)}
                >
                  <SegmentedControlItem value="table" aria-label={c.viewTable}>
                    <Table2 aria-hidden="true" />
                  </SegmentedControlItem>
                  <SegmentedControlItem value="grid" aria-label={c.viewGrid}>
                    <LayoutGrid aria-hidden="true" />
                  </SegmentedControlItem>
                  <SegmentedControlItem value="rows" aria-label={c.viewRows}>
                    <Rows3 aria-hidden="true" />
                  </SegmentedControlItem>
                </SegmentedControl>

                {/* Two adjacent buttons acting as one control is a group, not
                    two buttons that happen to touch. This is also the second
                    frame to carry `button-group-1`: the component ships
                    `role="group"` together with `tabIndex={0}`, so the container
                    takes a tab stop of its own before either arrow. */}
                <ButtonGroup mode="iconOnly" density="compact" aria-label={c.paging}>
                  <ButtonGroupItem aria-label={c.previous}>
                    <ChevronLeft aria-hidden="true" data-rtl-flip="true" />
                  </ButtonGroupItem>
                  <ButtonGroupItem aria-label={c.next}>
                    <ChevronRight aria-hidden="true" data-rtl-flip="true" />
                  </ButtonGroupItem>
                </ButtonGroup>

                <ToolbarFilterButton density="compact" label={c.filters} />

                <ToolbarButton density="compact">
                  <Columns3 aria-hidden="true" data-icon="inline-start" />
                  {c.columns}
                </ToolbarButton>

                {/* Neon's primary action is a filled button, and `ToolbarButton`
                    has no filled variant — only `default`, `soft` and `link`. So
                    the real `Button` goes in the toolbar rather than a toolbar
                    button pretending to be primary. Whether a list toolbar should
                    be able to carry its own primary action is a question for the
                    audit; inventing a variant that does not exist would bury it. */}
                <Button density="compact">
                  <Plus aria-hidden="true" data-icon="inline-start" />
                  {c.addRecord}
                </Button>
              </ToolbarSection>

              <ToolbarSpacer />

              <ToolbarSection>
                <ToolbarText>
                  {visible.length} {c.rowsTiming}
                </ToolbarText>
                {/* Not a group: these two bracket the page controls rather than
                    sitting together, and grouping them would say they are one
                    control when they are not. */}
                <Button variant="secondary" density="compact" size="icon" aria-label={c.previous}>
                  <ChevronLeft aria-hidden="true" data-rtl-flip="true" />
                </Button>
                <div className="w-[86px]">
                  <Select selectValue="50" value="50" density="compact" aria-label={c.pageSize}>
                    <SelectMenuItem value="50" label="50" />
                    <SelectMenuItem value="100" label="100" />
                  </Select>
                </div>
                <div className="w-[76px]">
                  <Select selectValue="0" value="0" density="compact" aria-label={c.offset}>
                    <SelectMenuItem value="0" label="0" />
                    <SelectMenuItem value="50" label="50" />
                  </Select>
                </div>
                <Button variant="secondary" density="compact" size="icon" aria-label={c.next}>
                  <ChevronRight aria-hidden="true" data-rtl-flip="true" />
                </Button>
                <Button variant="secondary" density="compact" size="icon" aria-label={c.refresh}>
                  <RefreshCw aria-hidden="true" />
                </Button>

                {/* The toolbar's own menu, functional. `ToolbarMoreButton` is a
                    button and nothing else, so the surface behind it has to be a
                    real `Menu` — which is the point: a trigger with no menu is
                    exactly the kind of thing that ships looking finished. */}
                <MenuRoot>
                  <MenuTrigger asChild>
                    <Button variant="secondary" density="compact" size="icon" aria-label={c.more}>
                      <MoreHorizontal aria-hidden="true" />
                    </Button>
                  </MenuTrigger>
                  <MenuContent width="menu" align="end">
                    <MenuItem onSelect={() => undefined}>{c.exportCsv}</MenuItem>
                    <MenuSeparator />
                    <MenuItem onSelect={() => setRows(PRODUCTS)}>{c.resetRows}</MenuItem>
                  </MenuContent>
                </MenuRoot>
              </ToolbarSection>
            </Toolbar>
          </div>

          {/* The reason this screen was chosen: two filter rows, each one a run
              of controls that has to line up with the run above it. */}
          <div className="grid gap-2 border-b border-[var(--bh-border-default)] bg-[var(--bh-bg-neutral-subtle)] px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <FilterRow
                conjunction={c.where}
                field={firstField}
                operator={firstOperator}
                value="15"
                onFieldChange={setFirstField}
                onOperatorChange={setFirstOperator}
                labels={c}
              />
              <div className="flex items-center gap-2 ps-2">
                <Button density="compact">{c.apply}</Button>
                <Button variant="ghost" density="compact">
                  <Plus aria-hidden="true" data-icon="inline-start" />
                  {c.addFilter}
                </Button>
                <Button variant="ghost" density="compact">
                  {c.clearFilters}
                </Button>
              </div>
            </div>

            <FilterRow
              conjunction={c.and}
              field={secondField}
              operator={secondOperator}
              value="30"
              onFieldChange={setSecondField}
              onOperatorChange={setSecondOperator}
              labels={c}
            />
          </div>

          <div className="min-w-0 flex-1 overflow-x-auto">
            <Table
              columns={columns}
              rows={visible}
              size="sm"
              sort={sort}
              onSortChange={setSort}
              selectedRowIds={selected}
              onSelectedRowIdsChange={setSelected}
            />
          </div>

          {/* Neon annotates every header with its SQL type. `Table` renders a
              header as a plain string, so the annotation is printed beneath the
              grid instead of inside it — the gap is stated rather than hidden,
              since faking it with markup would be inventing a component. */}
          <p className="border-t border-[var(--bh-border-default)] px-3 py-2 font-mono text-[10px] text-[var(--bh-content-subtle)]">
            {FIELDS.map((field) => `${field} ${COLUMN_TYPES[field]}`).join('  ·  ')}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Ordering is ours, because `Table` takes `sort` as state and reorders nothing. */
function sortRows(rows: Product[], sort: Sort): Product[] {
  if (!sort) return rows
  const key = sort.columnId as keyof Product
  const factor = sort.direction === 'desc' ? -1 : 1

  return [...rows].sort((a, b) => {
    const left = a[key]
    const right = b[key]
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor
    return String(left).localeCompare(String(right), undefined, { numeric: true }) * factor
  })
}

function NavLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 text-[10px] font-semibold tracking-wide text-[var(--bh-content-subtle)] uppercase">
      {children}
    </span>
  )
}

function NavRow({ children, current }: { children: React.ReactNode; current?: boolean }) {
  return (
    <span
      className={`mx-1 flex items-center gap-2 rounded-[var(--bh-radius-md-6)] px-2 py-1.5 text-xs ${
        current ? 'bg-[var(--bh-bg-neutral-subtle)] font-medium' : 'text-[var(--bh-content-subtle)]'
      }`}
    >
      {children}
    </span>
  )
}

function NavItems({
  items,
  current,
  badgeOn,
  badge,
}: {
  items: readonly string[]
  current?: string
  badgeOn?: string
  badge?: string
}) {
  const { Badge } = useDS()

  return (
    <>
      {items.map((item) => (
        <NavRow key={item} current={item === current}>
          {item}
          {item === badgeOn && badge && (
            <Badge color="purple" size="xs">
              {badge}
            </Badge>
          )}
        </NavRow>
      ))}
    </>
  )
}

function NavGroup({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div className="grid gap-1">
      <NavLabel>{label}</NavLabel>
      <NavItems items={items} />
    </div>
  )
}

function FilterRow({
  conjunction,
  field,
  operator,
  value,
  onFieldChange,
  onOperatorChange,
  labels,
}: {
  conjunction: string
  field: string
  operator: string
  value: string
  onFieldChange: (value: string) => void
  onOperatorChange: (value: string) => void
  labels: { removeFilter: string; filterValue: string }
}) {
  const { Button, Input, Select, SelectMenuItem } = useDS()

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" density="compact" size="icon" aria-label={labels.removeFilter}>
        <X aria-hidden="true" />
      </Button>

      <span className="w-14 rounded-[var(--bh-radius-md-6)] bg-[var(--background)] px-2 py-1 text-center font-mono text-xs text-[var(--bh-content-subtle)]">
        {conjunction}
      </span>

      <div className="w-[150px]">
        <Select
          selectValue={field}
          value={field}
          density="compact"
          onValueChange={onFieldChange}
          aria-label="Field"
        >
          {FIELDS.map((name) => (
            <SelectMenuItem key={name} value={name} label={name} />
          ))}
        </Select>
      </div>

      <div className="w-[130px]">
        <Select
          selectValue={operator}
          value={operator}
          density="compact"
          onValueChange={onOperatorChange}
          aria-label="Operator"
        >
          {OPERATORS.map((name) => (
            <SelectMenuItem key={name} value={name} label={name} />
          ))}
        </Select>
      </div>

      <div className="w-[240px]">
        <Input density="compact" defaultValue={value} aria-label={labels.filterValue} />
      </div>
    </div>
  )
}
