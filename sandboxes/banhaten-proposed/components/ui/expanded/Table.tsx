import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowUpDownIcon,
  EditIcon as LucideEditIcon,
  EllipsisIcon,
  EyeIcon,
  FileIcon as LucideFileIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { Pagination, type PaginationPage, type PaginationProps } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { Avatar as AvatarPrimitive, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress as ProgressPrimitive } from "@/components/ui/progress";
import { Tag } from "@/components/ui/tag";
import { Toggle } from "@/components/ui/toggle";
import {
  Toolbar,
  ToolbarBadge,
  ToolbarButton,
  ToolbarSearch,
  ToolbarSection,
  ToolbarText,
  type ToolbarButtonProps,
} from "@/components/ui/toolbar";
import "./table.css";

export type TableDirection = "ltr" | "rtl";
export type TableSize = "sm" | "lg";
export type TableRowState = "default" | "selected" | "disabled";
export type TableSortDirection = "asc" | "desc";
export type TableSortValue = string | number | boolean | Date | null | undefined;
export type TableSortState = {
  columnId: string;
  direction: TableSortDirection;
} | null;

export type TableRowBase = {
  id: string;
  state?: TableRowState;
};

export type TableColumn<Row extends TableRowBase> = {
  align?: "start" | "center" | "end";
  header?: string;
  id: string;
  item?: TableItemFactory<Row>;
  kind?: "data" | "selection" | "actions";
  minWidth?: number;
  renderCell?: (row: Row) => ReactNode;
  searchValue?: (row: Row) => string;
  sortable?: boolean;
  sortValue?: (row: Row) => TableSortValue;
  width?: number | "fill";
};

export type TableItemFactory<Row extends TableRowBase> = (row: Row) => TableItem;

export type BadgeItem = {
  dot?: boolean;
  label: string;
  tone?: "blue" | "fuchsia" | "amber" | "neutral" | "success" | "warning" | "danger";
};

export type AvatarItem = {
  alt: string;
  src?: string;
};

export type TableAction = {
  disabled?: boolean;
  icon: "view" | "edit" | "delete" | "more";
  label: string;
  onAction?: () => void;
};

export type TableItem =
  | { type: "checkbox"; ariaLabel?: string; checked: boolean; disabled?: boolean; indeterminate?: boolean; onCheckedChange?: (checked: boolean) => void }
  | { type: "text"; tone?: "default" | "subtle"; value: string; weight?: "regular" | "medium" }
  | { type: "avatarText"; caption?: string; name: string; src?: string; status?: "top" | "bottom" }
  | { type: "rating"; max?: 5; value: number }
  | { type: "progress"; label?: string; tone?: "success" | "brand"; value: number }
  | { type: "toggle"; ariaLabel?: string; checked: boolean; disabled?: boolean; onCheckedChange?: (checked: boolean) => void }
  | { type: "badges"; items: BadgeItem[]; maxVisible?: number }
  | { type: "onlyAvatar"; alt: string; src?: string }
  | { type: "avatarStack"; addLabel?: string; avatars: AvatarItem[]; canAdd?: boolean; count?: number; onAdd?: () => void }
  | { type: "tags"; items: string[]; maxVisible?: number }
  | { type: "file"; label?: string }
  | { type: "brandLogoText"; label: string; logoSrc?: string }
  | { type: "payment"; brand: string; label?: string }
  | { type: "image"; label: string; src: string }
  | { type: "action"; icon: TableAction["icon"]; label: string; onAction?: () => void }
  | { type: "actionGroup"; actions: TableAction[] };

export type TableProps<Row extends TableRowBase> = {
  columns: TableColumn<Row>[];
  dir?: TableDirection;
  onSelectedRowIdsChange?: (rowIds: string[]) => void;
  onSortChange?: (sort: TableSortState) => void;
  rows: Row[];
  selectedRowIds?: string[];
  size?: TableSize;
  sort?: TableSortState;
};

export type DataTableAction = {
  ariaLabel?: string;
  disabled?: boolean;
  label: string;
  onAction?: () => void;
  variant?: ToolbarButtonProps["variant"];
};

export type DataTableFilter<Row extends TableRowBase> = {
  active?: boolean;
  id: string;
  label: string;
  onAction?: () => void;
  predicate?: (row: Row) => boolean;
  value?: string;
};

export type DataTableSearch<Row extends TableRowBase> =
  | boolean
  | {
      defaultValue?: string;
      disabled?: boolean;
      getRowText?: (row: Row) => string;
      label?: string;
      onValueChange?: (value: string) => void;
      placeholder?: string;
      value?: string;
    };

export type DataTablePagination = {
  ariaLabel?: string;
  defaultPage?: number;
  manual?: boolean;
  onPageChange?: (page: number) => void;
  page?: number;
  pageSize?: number;
  pages?: PaginationPage[];
  showCaption?: boolean;
  totalRows?: number;
  type?: PaginationProps["type"];
  variant?: PaginationProps["variant"];
};

export type DataTableState = {
  action?: DataTableAction;
  description?: ReactNode;
  title?: ReactNode;
};

export type DataTableLabels = {
  emptyDescription: ReactNode;
  emptyTitle: ReactNode;
  errorDescription: ReactNode;
  errorTitle: ReactNode;
  loadingDescription: ReactNode;
  loadingTitle: ReactNode;
  resultsSummary: (summary: { from: number; to: number; total: number }) => ReactNode;
  searchPlaceholder: string;
  selectedCount: (count: number) => ReactNode;
};

export type DataTableProps<Row extends TableRowBase> = Omit<TableProps<Row>, "onSortChange" | "rows" | "sort"> & {
  actions?: DataTableAction[];
  bulkActions?: DataTableAction[];
  className?: string;
  defaultSort?: TableSortState;
  description?: ReactNode;
  emptyState?: DataTableState;
  error?: boolean | string | DataTableState;
  filters?: DataTableFilter<Row>[];
  getRowSearchText?: (row: Row) => string;
  labels?: Partial<DataTableLabels>;
  loading?: boolean;
  onSortChange?: (sort: TableSortState) => void;
  pagination?: false | DataTablePagination;
  rows: Row[];
  search?: DataTableSearch<Row>;
  sort?: TableSortState;
  title?: ReactNode;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Table<Row extends TableRowBase>({
  columns,
  dir,
  onSelectedRowIdsChange,
  onSortChange,
  rows,
  selectedRowIds = [],
  size = "sm",
  sort = null,
}: TableProps<Row>) {
  const selectableRows = rows.filter((row) => row.state !== "disabled");
  const allSelected = selectableRows.length > 0 && selectableRows.every((row) => selectedRowIds.includes(row.id));
  const someSelected = selectableRows.some((row) => selectedRowIds.includes(row.id)) && !allSelected;

  function toggleAll(checked: boolean) {
    onSelectedRowIdsChange?.(checked ? selectableRows.map((row) => row.id) : []);
  }

  function toggleRow(row: Row, checked: boolean) {
    if (row.state === "disabled") return;
    const next = checked
      ? Array.from(new Set([...selectedRowIds, row.id]))
      : selectedRowIds.filter((rowId) => rowId !== row.id);
    onSelectedRowIdsChange?.(next);
  }

  return (
    <div
      aria-label="Scrollable table"
      className={`ds-table-wrap ds-table-wrap--${size}`}
      dir={dir}
      tabIndex={0}
    >
      <table className="ds-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                aria-sort={column.sortable ? getAriaSort(sort, column.id) : undefined}
                className={columnClass(column)}
                key={column.id}
                style={columnStyle(column)}
                scope="col"
              >
                {column.kind === "selection" ? (
                  <SelectionCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    label="Select all rows"
                    onChange={toggleAll}
                  />
                ) : column.header ? (
                  column.sortable ? (
                    onSortChange ? (
                      <Button
                        aria-label={`Sort by ${column.header}`}
                        className={cx(
                          "ds-table__sort",
                          sort?.columnId === column.id && `ds-table__sort--${sort.direction}`,
                        )}
                        onClick={() => onSortChange(getNextSort(sort, column.id))}
                        size="xs"
                        type="button"
                        variant="ghost"
                      >
                        <span>{column.header}</span>
                        <SortIcon direction={sort?.columnId === column.id ? sort.direction : undefined} />
                      </Button>
                    ) : (
                      <span className="ds-table__sort ds-table__sort--static">
                        <span>{column.header}</span>
                        <SortIcon />
                      </span>
                    )
                  ) : (
                    column.header
                  )
                ) : (
                  <span className="sr-only">
                    {column.kind === "actions" ? "Actions" : column.id}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const selected = selectedRowIds.includes(row.id);
            const state = row.state === "disabled" ? "disabled" : selected ? "selected" : row.state ?? "default";

            return (
              <tr aria-selected={selected || undefined} className={`ds-table__row ds-table__row--${state}`} key={row.id}>
                {columns.map((column) => (
                  <td className={columnClass(column)} key={column.id} style={columnStyle(column)}>
                    {column.kind === "selection" ? (
                      <SelectionCheckbox
                        checked={selected}
                        disabled={row.state === "disabled"}
                        label={`Select row ${row.id}`}
                        onChange={(checked) => toggleRow(row, checked)}
                      />
                    ) : column.renderCell ? (
                      column.renderCell(row)
                    ) : column.item ? (
                      renderTableItem(column.item(row), size)
                    ) : null}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const defaultDataTablePagination: DataTablePagination = {};

const defaultDataTableLabels: DataTableLabels = {
  emptyDescription: "Try adjusting the search or filters.",
  emptyTitle: "No rows found",
  errorDescription: "Refresh the table or try again later.",
  errorTitle: "Table unavailable",
  loadingDescription: "Please wait while the table updates.",
  loadingTitle: "Loading rows",
  resultsSummary: ({ from, to, total }) => (total === 0 ? "Showing 0 rows" : `Showing ${from} to ${to} of ${total} rows`),
  searchPlaceholder: "Search rows...",
  selectedCount: (count) => `${count} selected`,
};

export function DataTable<Row extends TableRowBase>({
  actions = [],
  bulkActions = [],
  className,
  columns,
  defaultSort = null,
  description,
  dir,
  emptyState,
  error = false,
  filters = [],
  getRowSearchText,
  labels: labelOverrides,
  loading = false,
  onSelectedRowIdsChange,
  onSortChange,
  pagination = defaultDataTablePagination,
  rows,
  search = true,
  selectedRowIds = [],
  size = "sm",
  sort,
  title,
}: DataTableProps<Row>) {
  const labels: DataTableLabels = { ...defaultDataTableLabels, ...labelOverrides };
  const searchConfig = search === true ? {} : search && typeof search === "object" ? search : null;
  const paginationConfig = pagination === false ? null : pagination;
  const [uncontrolledSearch, setUncontrolledSearch] = useState(() => searchConfig?.defaultValue ?? "");
  const [uncontrolledSort, setUncontrolledSort] = useState<TableSortState>(() => sort ?? defaultSort);
  const [uncontrolledPage, setUncontrolledPage] = useState(() => paginationConfig?.page ?? paginationConfig?.defaultPage ?? 1);
  const selectedSort = sort !== undefined ? sort : uncontrolledSort;
  const searchValue = searchConfig?.value ?? uncontrolledSearch;
  const normalizedSearchValue = searchValue.trim().toLowerCase();

  const processedRows = useMemo(() => {
    let nextRows = rows;

    if (normalizedSearchValue) {
      nextRows = nextRows.filter((row) =>
        getDataTableSearchText({
          columns,
          getRowSearchText: getRowSearchText ?? searchConfig?.getRowText,
          row,
        })
          .toLowerCase()
          .includes(normalizedSearchValue),
      );
    }

    for (const filter of filters) {
      if (filter.active && filter.predicate) {
        nextRows = nextRows.filter(filter.predicate);
      }
    }

    return sortDataTableRows(nextRows, columns, selectedSort);
  }, [columns, filters, getRowSearchText, normalizedSearchValue, rows, searchConfig?.getRowText, selectedSort]);

  const pageSize = Math.max(1, paginationConfig?.pageSize ?? 10);
  const totalRows = paginationConfig?.totalRows ?? processedRows.length;
  const pageCount = Math.max(1, Math.ceil(Math.max(totalRows, 0) / pageSize));
  const currentPage = paginationConfig ? clampNumber(paginationConfig.page ?? uncontrolledPage, 1, pageCount) : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const displayedRows = paginationConfig?.manual ? processedRows : paginationConfig ? processedRows.slice(startIndex, startIndex + pageSize) : processedRows;
  const visibleFrom = totalRows === 0 ? 0 : startIndex + 1;
  const visibleTo = paginationConfig?.manual ? Math.min(currentPage * pageSize, totalRows) : Math.min(startIndex + displayedRows.length, totalRows);
  const hasHeader = Boolean(title || description || actions.length > 0);
  const hasToolbar = Boolean(searchConfig || filters.length > 0 || selectedRowIds.length > 0 || bulkActions.length > 0);
  const activeBulkActions = selectedRowIds.length > 0 ? bulkActions : [];
  const state = getDataTableState({
    emptyState,
    error,
    labels,
    loading,
    rowCount: processedRows.length,
  });

  function setDataTablePage(nextPage: number) {
    if (!paginationConfig) return;

    const safePage = clampNumber(nextPage, 1, pageCount);
    if (paginationConfig.page === undefined) {
      setUncontrolledPage(safePage);
    }
    paginationConfig.onPageChange?.(safePage);
  }

  function resetPagination() {
    setDataTablePage(1);
  }

  function handleSearchChange(value: string) {
    if (searchConfig?.value === undefined) {
      setUncontrolledSearch(value);
    }
    searchConfig?.onValueChange?.(value);
    resetPagination();
  }

  function handleSortChange(nextSort: TableSortState) {
    if (sort === undefined) {
      setUncontrolledSort(nextSort);
    }
    onSortChange?.(nextSort);
    resetPagination();
  }

  return (
    <section className={cx("ds-data-table", className)} dir={dir}>
      {hasHeader && (
        <header className="ds-data-table__header">
          <div className="ds-data-table__heading">
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions.length > 0 && (
            <div className="ds-data-table__actions">
              {actions.map((action) => (
                <DataTableActionButton action={action} key={action.label} />
              ))}
            </div>
          )}
        </header>
      )}

      {hasToolbar && (
        <Toolbar className="ds-data-table__toolbar" dir={dir} layout="split" wrap>
          <ToolbarSection grow wrap>
            {searchConfig && (
              <ToolbarSearch
                aria-label={searchConfig.label ?? "Search table rows"}
                disabled={searchConfig.disabled}
                onChange={(event) => handleSearchChange(event.currentTarget.value)}
                placeholder={searchConfig.placeholder ?? labels.searchPlaceholder}
                value={searchValue}
                width="full"
              />
            )}
            {filters.map((filter) => (
              <ToolbarButton
                aria-pressed={filter.active || undefined}
                key={filter.id}
                onClick={() => {
                  filter.onAction?.();
                  resetPagination();
                }}
                size="sm"
                variant={filter.active ? "default" : "soft"}
              >
                {filter.value ? `${filter.label}: ${filter.value}` : filter.label}
              </ToolbarButton>
            ))}
          </ToolbarSection>
          {(selectedRowIds.length > 0 || activeBulkActions.length > 0) && (
            <ToolbarSection align="end" wrap>
              {selectedRowIds.length > 0 && <ToolbarBadge variant="brand">{labels.selectedCount(selectedRowIds.length)}</ToolbarBadge>}
              {activeBulkActions.map((action) => (
                <DataTableActionButton action={action} key={action.label} />
              ))}
            </ToolbarSection>
          )}
        </Toolbar>
      )}

      <div className="ds-data-table__body">
        <Table
          columns={columns}
          dir={dir}
          onSelectedRowIdsChange={onSelectedRowIdsChange}
          onSortChange={handleSortChange}
          rows={state ? [] : displayedRows}
          selectedRowIds={selectedRowIds}
          size={size}
          sort={selectedSort}
        />
        {state && <DataTableStateView loading={loading} state={state} />}
      </div>

      {paginationConfig && (
        <footer className="ds-data-table__footer">
          <ToolbarText>{labels.resultsSummary({ from: visibleFrom, to: visibleTo, total: totalRows })}</ToolbarText>
          <Pagination
            aria-label={
              paginationConfig.ariaLabel ??
              (typeof title === "string" ? `${title} pagination` : "Table pagination")
            }
            dir={dir}
            nextDisabled={currentPage >= pageCount}
            onPageChange={setDataTablePage}
            page={currentPage}
            pages={paginationConfig.pages ?? getDataTablePaginationPages(currentPage, pageCount)}
            previousDisabled={currentPage <= 1}
            showCaption={paginationConfig.showCaption ?? false}
            caption={labels.resultsSummary({ from: visibleFrom, to: visibleTo, total: totalRows })}
            summary={labels.resultsSummary({ from: visibleFrom, to: visibleTo, total: totalRows })}
            type={paginationConfig.type ?? "numeric"}
            variant={paginationConfig.variant ?? "soft"}
          />
        </footer>
      )}
    </section>
  );
}

function columnClass<Row extends TableRowBase>(column: TableColumn<Row>) {
  return cx(
    "ds-table__cell",
    column.width === "fill" && "ds-table__cell--fill",
    column.align && `ds-table__cell--${column.align}`,
    column.kind === "selection" && "ds-table__cell--selection",
    column.kind === "actions" && "ds-table__cell--actions",
  );
}

function columnStyle<Row extends TableRowBase>(column: TableColumn<Row>): CSSProperties {
  return {
    minWidth: column.minWidth,
    width: typeof column.width === "number" ? column.width : undefined,
  };
}

type ResolvedDataTableState = DataTableState & {
  tone: "danger" | "default" | "loading";
};

function DataTableActionButton({ action }: { action: DataTableAction }) {
  return (
    <ToolbarButton
      aria-label={action.ariaLabel}
      disabled={action.disabled}
      onClick={action.onAction}
      size="sm"
      variant={action.variant ?? "soft"}
    >
      {action.label}
    </ToolbarButton>
  );
}

function DataTableStateView({ loading, state }: { loading: boolean; state: ResolvedDataTableState }) {
  return (
    <div className={`ds-data-table__state ds-data-table__state--${state.tone}`} role={state.tone === "danger" ? "alert" : "status"}>
      <div className="ds-data-table__state-copy">
        {loading && <Spinner className="ds-data-table__spinner" />}
        {state.title && <strong>{state.title}</strong>}
        {state.description && <p>{state.description}</p>}
      </div>
      {state.action && (
        <div className="ds-data-table__state-action">
          <DataTableActionButton action={state.action} />
        </div>
      )}
    </div>
  );
}

function getDataTableState({
  emptyState,
  error,
  labels,
  loading,
  rowCount,
}: {
  emptyState?: DataTableState;
  error: boolean | string | DataTableState;
  labels: DataTableLabels;
  loading: boolean;
  rowCount: number;
}): ResolvedDataTableState | null {
  if (loading) {
    return {
      description: labels.loadingDescription,
      title: labels.loadingTitle,
      tone: "loading",
    };
  }

  if (error) {
    if (typeof error === "string") {
      return {
        description: error,
        title: labels.errorTitle,
        tone: "danger",
      };
    }

    if (typeof error === "object") {
      return {
        action: error.action,
        description: error.description ?? labels.errorDescription,
        title: error.title ?? labels.errorTitle,
        tone: "danger",
      };
    }

    return {
      description: labels.errorDescription,
      title: labels.errorTitle,
      tone: "danger",
    };
  }

  if (rowCount === 0) {
    return {
      action: emptyState?.action,
      description: emptyState?.description ?? labels.emptyDescription,
      title: emptyState?.title ?? labels.emptyTitle,
      tone: "default",
    };
  }

  return null;
}

function getDataTableSearchText<Row extends TableRowBase>({
  columns,
  getRowSearchText,
  row,
}: {
  columns: TableColumn<Row>[];
  getRowSearchText?: (row: Row) => string;
  row: Row;
}) {
  const values = [row.id, getRowSearchText?.(row)];

  for (const column of columns) {
    const columnValue = column.searchValue?.(row) ?? (column.item ? getTableItemText(column.item(row)) : undefined);
    if (columnValue) values.push(columnValue);
  }

  return values.filter(Boolean).join(" ");
}

function sortDataTableRows<Row extends TableRowBase>(rows: Row[], columns: TableColumn<Row>[], sort: TableSortState) {
  if (!sort) return rows;

  const column = columns.find((item) => item.id === sort.columnId);
  if (!column) return rows;

  const direction = sort.direction === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    const result = compareTableSortValues(getColumnSortValue(column, left), getColumnSortValue(column, right));
    return result * direction;
  });
}

function getColumnSortValue<Row extends TableRowBase>(column: TableColumn<Row>, row: Row): TableSortValue {
  if (column.sortValue) return column.sortValue(row);
  if (column.item) return getTableItemSortValue(column.item(row));
  return undefined;
}

function compareTableSortValues(left: TableSortValue, right: TableSortValue) {
  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;

  const normalizedLeft = normalizeTableSortValue(left);
  const normalizedRight = normalizeTableSortValue(right);

  if (typeof normalizedLeft === "number" && typeof normalizedRight === "number") {
    return normalizedLeft - normalizedRight;
  }

  return String(normalizedLeft).localeCompare(String(normalizedRight), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function normalizeTableSortValue(value: Exclude<TableSortValue, null | undefined>) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

function getTableItemSortValue(item: TableItem): TableSortValue {
  switch (item.type) {
    case "avatarText":
      return item.name;
    case "badges":
      return item.items.map((badge) => badge.label).join(" ");
    case "brandLogoText":
      return item.label;
    case "file":
      return item.label;
    case "image":
      return item.label;
    case "payment":
      return item.label ?? item.brand;
    case "progress":
    case "rating":
      return item.value;
    case "tags":
      return item.items.join(" ");
    case "text":
      return item.value;
    case "toggle":
      return item.checked;
    default:
      return undefined;
  }
}

function getTableItemText(item: TableItem) {
  const value = getTableItemSortValue(item);
  return value === null || value === undefined ? "" : String(value);
}

function getDataTablePaginationPages(currentPage: number, pageCount: number): PaginationPage[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages: PaginationPage[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  if (end < pageCount - 1) pages.push("ellipsis");
  pages.push(pageCount);

  return pages;
}

function getAriaSort(sort: TableSortState, columnId: string) {
  if (sort?.columnId !== columnId) return "none";
  return sort.direction === "asc" ? "ascending" : "descending";
}

function getNextSort(sort: TableSortState, columnId: string): TableSortState {
  if (sort?.columnId !== columnId) {
    return { columnId, direction: "asc" };
  }

  return {
    columnId,
    direction: sort.direction === "asc" ? "desc" : "asc",
  };
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function renderTableItem(item: TableItem, tableSize: TableSize) {
  switch (item.type) {
    case "checkbox":
      return (
        <SelectionCheckbox
          checked={item.checked}
          disabled={item.disabled ?? !item.onCheckedChange}
          indeterminate={item.indeterminate}
          label={item.ariaLabel ?? "Select row"}
          onChange={item.onCheckedChange}
        />
      );
    case "text":
      return <span className={`ds-table-item-text ds-table-item-text--${item.tone ?? "default"} ds-table-item-text--${item.weight ?? "regular"}`}>{item.value}</span>;
    case "avatarText":
      return (
        <span className="ds-table-avatar-text">
          <Avatar name={item.name} size={tableSize === "lg" ? "md" : "sm"} src={item.src} />
          <span>
            {/* dir="auto" lets each string choose its own base direction. Without
                it, text running opposite to the document direction truncates from
                its logical start and loses the beginning of the name. */}
            <strong dir="auto">{item.name}</strong>
            {item.caption && <em dir="auto">{item.caption}</em>}
          </span>
        </span>
      );
    case "rating":
      return <Rating value={item.value} max={item.max ?? 5} />;
    case "progress":
      return <Progress value={item.value} label={item.label} tone={item.tone ?? "success"} />;
    case "toggle":
      return (
        <Toggle
          aria-label={item.ariaLabel ?? "Toggle row value"}
          checked={item.checked}
          disabled={item.disabled ?? !item.onCheckedChange}
          onCheckedChange={item.onCheckedChange}
          size="sm"
        />
      );
    case "badges":
      return <BadgeList items={item.items} maxVisible={item.maxVisible} />;
    case "onlyAvatar":
      return <Avatar name={item.alt} size={tableSize === "lg" ? "md" : "xs"} src={item.src} />;
    case "avatarStack":
      return (
        <AvatarStack
          addLabel={item.addLabel}
          avatars={item.avatars}
          canAdd={item.canAdd}
          count={item.count}
          onAdd={item.onAdd}
          size={tableSize}
        />
      );
    case "tags":
      return <TagList items={item.items} maxVisible={item.maxVisible} />;
    case "file":
      return item.label ? <IconLabel icon={<FileIcon />} label={item.label} /> : null;
    case "brandLogoText":
      return <IconLabel icon={item.logoSrc ? <img alt="" src={item.logoSrc} /> : <BrandIcon />} label={item.label} />;
    case "payment":
      return <IconLabel icon={<PaymentIcon />} label={item.label ?? item.brand} />;
    case "image":
      return <IconLabel icon={<img alt="" src={item.src} />} label={item.label} />;
    case "action":
      return <IconButton icon={item.icon} label={item.label} onClick={item.onAction} />;
    case "actionGroup":
      return (
        <span className="ds-table-action-group">
          {item.actions.map((action) => (
            <IconButton disabled={action.disabled} key={action.label} icon={action.icon} label={action.label} onClick={action.onAction} />
          ))}
        </span>
      );
    default:
      return null;
  }
}

function SelectionCheckbox({
  checked,
  disabled = false,
  indeterminate = false,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  label: string;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <Checkbox
      aria-label={label}
      checked={indeterminate ? "indeterminate" : checked}
      disabled={disabled}
      onCheckedChange={(nextChecked) => onChange?.(nextChecked === true)}
    />
  );
}

type TableAvatarSize = "xs" | "sm" | "md";

function Avatar({ name, size, src }: { name: string; size: TableAvatarSize; src?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AvatarPrimitive className="ds-table-avatar" size={size}>
      {src ? <AvatarImage alt="" src={src} /> : null}
      <AvatarFallback size={size}>{initials}</AvatarFallback>
    </AvatarPrimitive>
  );
}

function AvatarStack({
  addLabel = "Add person",
  avatars,
  canAdd,
  count,
  onAdd,
  size,
}: {
  addLabel?: string;
  avatars: AvatarItem[];
  canAdd?: boolean;
  count?: number;
  onAdd?: () => void;
  size: TableSize;
}) {
  return (
    <span className={`ds-table-avatar-stack ds-table-avatar-stack--${size}`}>
      {avatars.slice(0, 3).map((avatar) => (
        <Avatar key={avatar.alt} name={avatar.alt} size={size === "lg" ? "md" : "xs"} src={avatar.src} />
      ))}
      {count ? <span className="ds-table-avatar ds-table-avatar--count">+{count}</span> : null}
      {canAdd ? (
        <Button aria-label={addLabel} disabled={!onAdd} onClick={onAdd} size="icon-xs" type="button" variant="ghost">
          +
        </Button>
      ) : null}
    </span>
  );
}

function BadgeList({ items, maxVisible = items.length }: { items: BadgeItem[]; maxVisible?: number }) {
  const visible = items.slice(0, maxVisible);
  const overflow = items.length - visible.length;

  return (
    <span className="ds-table-badges">
      {visible.map((item, index) => (
        <Badge
          badgeStyle="light"
          color={badgeColor(item.tone)}
          key={`${item.label}-${index}`}
          size="xs"
          type={item.dot ? "dot" : "default"}
        >
          {item.label}
        </Badge>
      ))}
      {overflow > 0 && <Badge size="xs">+{overflow}</Badge>}
    </span>
  );
}

function TagList({ items, maxVisible = items.length }: { items: string[]; maxVisible?: number }) {
  const visible = items.slice(0, maxVisible);
  const overflow = items.length - visible.length;

  return (
    <span className="ds-table-tags">
      {visible.map((item, index) => (
        <Tag key={`${item}-${index}`} size="xs">{item}</Tag>
      ))}
      {overflow > 0 && <Tag size="xs">+{overflow}</Tag>}
    </span>
  );
}

function Progress({ label, tone, value }: { label?: string; tone: "success" | "brand"; value: number }) {
  return (
    <ProgressPrimitive
      aria-label={label ?? "Progress"}
      className={`ds-table-progress ds-table-progress--${tone}`}
      indicator={label}
      labelPosition="inline"
      size="lg"
      value={value}
    />
  );
}

function Rating({ max, value }: { max: number; value: number }) {
  return (
    <span
      aria-label={`${value} out of ${max}`}
      className="ds-table-rating"
      role="img"
    >
      {Array.from({ length: max }, (_, index) => (
        <StarIcon
          aria-hidden="true"
          className={index < value ? "is-filled" : undefined}
          key={index}
          strokeWidth="var(--bh-icon-stroke-190)"
        />
      ))}
    </span>
  );
}

function IconLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="ds-table-icon-label">
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function IconButton({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon: TableAction["icon"];
  label: string;
  onClick?: () => void;
}) {
  return (
    <Button aria-label={label} className="ds-table-icon-button" disabled={disabled ?? !onClick} onClick={onClick} size="icon-xs" type="button" variant="ghost">
      {renderActionIcon(icon)}
    </Button>
  );
}

function badgeColor(tone: BadgeItem["tone"]) {
  if (tone === "success") return "green" as const;
  if (tone === "warning") return "amber" as const;
  return tone ?? "neutral";
}

function renderActionIcon(icon: TableAction["icon"]) {
  switch (icon) {
    case "view":
      return <ViewIcon />;
    case "edit":
      return <EditIcon />;
    case "delete":
      return <DeleteIcon />;
    case "more":
    default:
      return <MoreIcon />;
  }
}

function SortIcon({ direction }: { direction?: TableSortDirection }) {
  return (
    <ArrowUpDownIcon aria-hidden="true" data-direction={direction ?? "none"} strokeWidth="var(--bh-icon-stroke-190)" />
  );
}

function MoreIcon() {
  return <EllipsisIcon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-225)" />;
}

function ViewIcon() {
  return <EyeIcon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-190)" />;
}

function EditIcon() {
  return <LucideEditIcon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-190)" />;
}

function DeleteIcon() {
  return <Trash2Icon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-190)" />;
}

function FileIcon() {
  return <LucideFileIcon strokeWidth="var(--bh-icon-stroke-190)" />;
}

function BrandIcon() {
  return <span className="ds-table-brand-icon" />;
}

function PaymentIcon() {
  return <span className="ds-table-payment-icon" />;
}
