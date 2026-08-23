import { useState } from 'react'
import {
  Columns3,
  LayoutGrid,
  Plus,
  RefreshCw,
  Rows3,
  Search,
  Table2,
  X,
} from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'
import { PRODUCTS, type Product } from './products'

/**
 * Neon's table browser, reproduced as faithfully as Banhaten allows.
 *
 * https://mobbin.com/screens/926541e1-1d12-4677-8faf-54193a709b17
 *
 * Chosen for one element above all: the filter builder. `where · stock · gte ·
 * 15` is three `Select`s and an `Input` sitting in a row, and a second row
 * repeats it. Controls that must line up with each other across a row, twice,
 * is the arrangement where a disagreement in height, radius, or density stops
 * being a matter of taste and becomes visible as a broken line.
 *
 * It also forces a question this playground cannot answer by itself. The view
 * switcher in the top-left is three icon-only buttons expressing one exclusive
 * choice. Banhaten offers `SegmentedControl` and `ButtonGroup` for that, and
 * `SegmentedControl` declares itself as
 * `Omit<ToggleGroupProps, "itemWidth" | "mode">` — so `mode="iconOnly"` is not
 * reachable through it. This file uses `SegmentedControl` anyway, because using
 * the component whose name matches the pattern is what a team would do, and
 * what happens next is evidence rather than a workaround.
 *
 * The table is `expanded/Table` rather than `table-elements`. That is not a
 * preference: `table-elements` exports structural wrappers carrying almost no
 * styling — `TableCell` and `TableBody` add no classes at all — so a screen
 * built on them would be showing my CSS, not Banhaten's, and any defect found
 * would be mine. They are primitives for `expanded/Table` to build on, and they
 * belong to the code pass, not to a visual one.
 *
 * The sidebar chrome is plain markup for the same reason it was in the Mercury
 * screen: Banhaten ships no navigation component.
 */

const COPY = {
  project: { en: 'SLMobbin', ar: 'SLMobbin' },
  branch: { en: 'production', ar: 'production' },

  navProject: { en: 'Project', ar: 'المشروع' },
  navProjectItems: {
    en: ['Dashboard', 'Branches', 'Integrations', 'Settings'],
    ar: ['لوحة القيادة', 'الفروع', 'التكاملات', 'الإعدادات'],
  },
  navBranch: { en: 'Branch', ar: 'الفرع' },
  navBranchItems: {
    en: ['Overview', 'Monitoring', 'SQL Editor', 'Tables', 'Backup & Restore'],
    ar: ['نظرة عامة', 'المراقبة', 'محرر SQL', 'الجداول', 'النسخ والاستعادة'],
  },

  tables: { en: 'Tables', ar: 'الجداول' },
  database: { en: 'neondb', ar: 'neondb' },
  studio: { en: 'Database studio', ar: 'استوديو قاعدة البيانات' },
  schema: { en: 'public', ar: 'public' },
  searchTables: { en: 'Search', ar: 'بحث' },
  tableName: { en: 'products', ar: 'products' },

  viewLabel: { en: 'View mode', ar: 'وضع العرض' },
  viewTable: { en: 'Table', ar: 'جدول' },
  viewGrid: { en: 'Grid', ar: 'شبكة' },
  viewRows: { en: 'Rows', ar: 'صفوف' },

  filters: { en: 'Filters', ar: 'عوامل التصفية' },
  columns: { en: 'Columns', ar: 'الأعمدة' },
  addRecord: { en: 'Add record', ar: 'إضافة سجل' },
  rowsTiming: { en: '6 rows · 324ms', ar: '٦ صفوف · ٣٢٤ مللي ثانية' },
  refresh: { en: 'Refresh', ar: 'تحديث' },

  where: { en: 'where', ar: 'حيث' },
  and: { en: 'and', ar: 'و' },
  apply: { en: 'Apply', ar: 'تطبيق' },
  addFilter: { en: 'Add filter', ar: 'إضافة عامل تصفية' },
  clearFilters: { en: 'Clear filters', ar: 'مسح عوامل التصفية' },
  removeFilter: { en: 'Remove filter', ar: 'إزالة عامل التصفية' },
  filterValue: { en: 'Value', ar: 'القيمة' },

  colId: { en: 'id', ar: 'id' },
  colName: { en: 'product_name', ar: 'product_name' },
  colDescription: { en: 'description', ar: 'description' },
  colPrice: { en: 'price', ar: 'price' },
  colStock: { en: 'stock', ar: 'stock' },

  pageSize: { en: 'Rows per page', ar: 'صفوف لكل صفحة' },
  offset: { en: 'Offset', ar: 'الإزاحة' },
  more: { en: 'More actions', ar: 'إجراءات أخرى' },
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
  id: 80,
  product_name: 240,
  description: 'fill',
  price: 130,
  stock: 110,
} as const

const OPERATORS = ['equals', 'gte', 'less', 'contains'] as const
const FIELDS = ['id', 'product_name', 'description', 'price', 'stock'] as const

export default function TableStudio() {
  const {
    Button,
    Input,
    SegmentedControl,
    SegmentedControlItem,
    Select,
    SelectMenuItem,
    Table,
    Toolbar,
    ToolbarButton,
    ToolbarFilterButton,
    ToolbarMoreButton,
    ToolbarSection,
    ToolbarSelect,
    ToolbarSpacer,
    ToolbarText,
  } = useDS()
  const c = useCopy(COPY)

  const [view, setView] = useState('table')
  const [selected, setSelected] = useState<string[]>([])
  const [firstField, setFirstField] = useState('stock')
  const [firstOperator, setFirstOperator] = useState('gte')
  const [secondField, setSecondField] = useState('price')
  const [secondOperator, setSecondOperator] = useState('less')

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
  ]

  return (
    <div className="flex min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <aside className="flex w-[176px] shrink-0 flex-col gap-5 border-e border-[var(--bh-border-default)] px-3 py-4 text-sm">
        <span className="px-2 font-semibold">{c.project}</span>
        <NavGroup label={c.navProject} items={c.navProjectItems} />
        <NavGroup label={c.navBranch} items={c.navBranchItems} current={c.navBranchItems[3]} />
      </aside>

      {/* Neon's second column: the schema pickers stacked, which is three
          Selects in a vertical run — the same alignment question as the filter
          row, turned ninety degrees. */}
      <aside className="flex w-[220px] shrink-0 flex-col gap-3 border-e border-[var(--bh-border-default)] px-3 py-4">
        <div>
          <h1 className="text-lg font-semibold">{c.tables}</h1>
          <p className="text-xs text-[var(--bh-content-subtle)]">{c.branch}</p>
        </div>

        <Select selectValue="neondb" value={c.database} size="sm">
          <SelectMenuItem value="neondb" label={c.database} />
        </Select>
        <Select selectValue="studio" value={c.studio} size="sm">
          <SelectMenuItem value="studio" label={c.studio} />
        </Select>
        <Select selectValue="public" value={c.schema} size="sm">
          <SelectMenuItem value="public" label={c.schema} />
        </Select>

        <div className="flex items-center gap-1.5">
          <div className="min-w-0 flex-1">
            <Input
              size="sm"
              placeholder={c.searchTables}
              aria-label={c.searchTables}
              leadingIcon={<Search aria-hidden="true" />}
              hasLeadingIcon
            />
          </div>
          <IconButton label={c.refresh}>
            <RefreshCw aria-hidden="true" className="size-3.5" />
          </IconButton>
        </div>

        <span className="flex items-center justify-between rounded-[var(--bh-radius-md)] bg-[var(--bh-bg-neutral-subtle)] px-2.5 py-1.5 font-mono text-xs">
          {c.tableName}
          <span className="text-[var(--bh-content-subtle)]">0</span>
        </span>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* This is what `Toolbar` is for, and the match is close enough to be
            worth stating: Neon's row is a filter button, a columns button, an
            add action, a result count and two page selects. Banhaten exports
            `ToolbarFilterButton` (whose label already defaults to "Filters"),
            `ToolbarText`, `ToolbarSelect`, `ToolbarMoreButton` and
            `ToolbarSpacer` — and `expanded/Table.tsx` is the only file in the
            design system that imports any of them. It is a list toolbar, so it
            gets a list. */}
        <div className="border-b border-[var(--bh-border-default)] px-4 py-2">
          <Toolbar wrap>
            <ToolbarSection>
              {/* The ambiguous control. See the file comment. */}
              <SegmentedControl
                aria-label={c.viewLabel}
                value={view}
                onValueChange={(value: string) => setView(value)}
              >
                <SegmentedControlItem value="table" aria-label={c.viewTable}>
                  <Table2 aria-hidden="true" className="size-3.5" />
                </SegmentedControlItem>
                <SegmentedControlItem value="grid" aria-label={c.viewGrid}>
                  <LayoutGrid aria-hidden="true" className="size-3.5" />
                </SegmentedControlItem>
                <SegmentedControlItem value="rows" aria-label={c.viewRows}>
                  <Rows3 aria-hidden="true" className="size-3.5" />
                </SegmentedControlItem>
              </SegmentedControl>

              <ToolbarFilterButton label={c.filters} />

              <ToolbarButton>
                <Columns3 aria-hidden="true" className="size-3.5" />
                {c.columns}
              </ToolbarButton>

              {/* Neon's primary action is a filled button, and `ToolbarButton`
                  has no filled variant — only `default`, `soft` and `link`. So
                  the real `Button` goes in the toolbar rather than a toolbar
                  button pretending to be primary. Whether a list toolbar should
                  be able to carry its own primary action is a question for the
                  audit; inventing a variant that does not exist would bury it. */}
              <Button size="sm">
                <Plus aria-hidden="true" className="size-3.5" />
                {c.addRecord}
              </Button>
            </ToolbarSection>

            <ToolbarSpacer />

            <ToolbarSection>
              <ToolbarText>{c.rowsTiming}</ToolbarText>
              <ToolbarSelect value="50" aria-label={c.pageSize} />
              <ToolbarSelect value="0" aria-label={c.offset} />
              <ToolbarMoreButton label={c.more} />
            </ToolbarSection>
          </Toolbar>
        </div>

        {/* The reason this screen was chosen: two filter rows, each one a run of
            controls that has to line up with the run above it. */}
        <div className="grid gap-2 border-b border-[var(--bh-border-default)] px-4 py-3">
          <FilterRow
            conjunction={c.where}
            field={firstField}
            operator={firstOperator}
            value="15"
            onFieldChange={setFirstField}
            onOperatorChange={setFirstOperator}
            labels={c}
          />
          <FilterRow
            conjunction={c.and}
            field={secondField}
            operator={secondOperator}
            value="30"
            onFieldChange={setSecondField}
            onOperatorChange={setSecondOperator}
            labels={c}
          />
          <div className="flex items-center gap-2">
            <Button size="sm">{c.apply}</Button>
            <Button variant="tertiary" size="sm">
              <Plus aria-hidden="true" className="size-3.5" />
              {c.addFilter}
            </Button>
            <Button variant="tertiary" size="sm">
              {c.clearFilters}
            </Button>
          </div>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <Table
            columns={columns}
            rows={PRODUCTS}
            size="sm"
            selectedRowIds={selected}
            onSelectedRowIdsChange={setSelected}
          />
        </div>

        {/* Neon annotates every header with its SQL type. `Table` renders a
            header as a plain string, so the annotation is printed beneath the
            grid instead of inside it — the gap is stated rather than hidden,
            since faking it with markup would be inventing a component. */}
        <p className="px-4 py-3 font-mono text-[10px] text-[var(--bh-content-subtle)]">
          {FIELDS.map((field) => `${field} ${COLUMN_TYPES[field]}`).join('  ·  ')}
        </p>
      </div>
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
  const { Input, Select, SelectMenuItem } = useDS()

  return (
    <div className="flex items-center gap-2">
      <IconButton label={labels.removeFilter}>
        <X aria-hidden="true" className="size-3.5" />
      </IconButton>

      <span className="w-12 font-mono text-xs text-[var(--bh-content-subtle)]">{conjunction}</span>

      <div className="w-[150px]">
        <Select
          selectValue={field}
          value={field}
          size="sm"
          onValueChange={onFieldChange}
          aria-label="Field"
        >
          {FIELDS.map((name) => (
            <SelectMenuItem key={name} value={name} label={name} />
          ))}
        </Select>
      </div>

      <div className="w-[120px]">
        <Select
          selectValue={operator}
          value={operator}
          size="sm"
          onValueChange={onOperatorChange}
          aria-label="Operator"
        >
          {OPERATORS.map((name) => (
            <SelectMenuItem key={name} value={name} label={name} />
          ))}
        </Select>
      </div>

      <div className="w-[220px]">
        <Input size="sm" defaultValue={value} aria-label={labels.filterValue} />
      </div>
    </div>
  )
}

function NavGroup({
  label,
  items,
  current,
}: {
  label: string
  items: readonly string[]
  current?: string
}) {
  return (
    <div>
      <div className="mb-1 px-2 text-[10px] tracking-wide text-[var(--bh-content-subtle)] uppercase">
        {label}
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <span
            key={item}
            className={`truncate rounded-[var(--bh-radius-md)] px-2 py-1 ${
              item === current ? 'bg-[var(--bh-bg-neutral-subtle)] font-medium' : ''
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-7 shrink-0 place-items-center rounded-[var(--bh-radius-md)] border border-[var(--bh-border-default)]"
    >
      {children}
    </button>
  )
}
