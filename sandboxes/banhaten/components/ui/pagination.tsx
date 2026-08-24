import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useResolvedDirection } from "@/hooks/use-direction"

import "./pagination.css"

type PaginationType = "numeric" | "simple" | "summary"
type PaginationVariant = "soft" | "ghost"
type PaginationPage =
  | number
  | "ellipsis"
  | {
      type: "page"
      value: number
      label?: React.ReactNode
      ariaLabel?: string
    }
  | {
      type: "ellipsis"
      label?: React.ReactNode
      ariaLabel?: string
    }

type PaginationMessages = {
  caption: React.ReactNode
  morePagesAriaLabel: string
  navigation: string
  next: React.ReactNode
  nextAriaLabel: string
  pageAriaLabel: (page: number) => string
  previous: React.ReactNode
  previousAriaLabel: string
  summary: React.ReactNode
}

const defaultPaginationPages: PaginationPage[] = [1, 2, 3, 4, "ellipsis", 10]

const defaultPaginationMessages: PaginationMessages = {
  caption: "Showing 1 to 10 of 20 results",
  morePagesAriaLabel: "More pages",
  navigation: "Pagination",
  next: "Next",
  nextAriaLabel: "Next page",
  pageAriaLabel: (page) => `Page ${page}`,
  previous: "Previous",
  previousAriaLabel: "Previous page",
  summary: "Page 1 of 10",
}

const arabicPaginationMessages: PaginationMessages = {
  caption:
    "\u0639\u0631\u0636 1 \u0625\u0644\u0649 10 \u0645\u0646 20 \u0646\u062a\u064a\u062c\u0629",
  morePagesAriaLabel: "\u0635\u0641\u062d\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629",
  navigation: "\u0627\u0644\u062a\u0631\u0642\u064a\u0645",
  next: "\u0627\u0644\u062a\u0627\u0644\u064a",
  nextAriaLabel:
    "\u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
  pageAriaLabel: (page) => `\u0627\u0644\u0635\u0641\u062d\u0629 ${page}`,
  previous: "\u0627\u0644\u0633\u0627\u0628\u0642",
  previousAriaLabel:
    "\u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629",
  summary: "\u0627\u0644\u0635\u0641\u062d\u0629 1 \u0645\u0646 10",
}

const paginationVariants = cva(
  [
    "ds-pagination flex w-full max-w-full min-w-0 flex-wrap items-center",
    "text-[length:var(--bh-pagination-font-size)]",
    "leading-[var(--bh-pagination-line-height)]",
    "tracking-[var(--bh-pagination-letter-spacing)]",
  ],
  {
    variants: {
      type: {
        numeric:
          "max-w-[var(--bh-pagination-numeric-width)] justify-between gap-[var(--bh-pagination-root-gap)]",
        simple:
          "max-w-[var(--bh-pagination-simple-width)] justify-between gap-[var(--bh-pagination-root-gap)]",
        summary:
          "max-w-[var(--bh-pagination-simple-width)] justify-between gap-[var(--bh-pagination-root-gap)]",
      },
      showCaption: {
        true: "",
        false: "justify-center",
      },
    },
    compoundVariants: [
      {
        type: ["simple", "summary"],
        showCaption: false,
        class: "justify-between",
      },
    ],
    defaultVariants: {
      type: "numeric",
      showCaption: true,
    },
  }
)

const paginationControlVariants = cva(
  [
    "relative inline-flex h-[var(--bh-pagination-item-size)] shrink-0 items-center justify-center",
    "whitespace-nowrap rounded-[var(--bh-pagination-radius)]",
    "text-[color:var(--bh-pagination-control-content)]",
    "text-[length:var(--bh-pagination-font-size)] font-[var(--bh-pagination-label-font-weight)]",
    "leading-[var(--bh-pagination-line-height)] tracking-[var(--bh-pagination-letter-spacing)]",
    "outline-none transition-[background-color,border-color,color,box-shadow]",
    "focus-visible:shadow-[var(--shadow-pagination-focus)]",
    "disabled:pointer-events-none disabled:text-[var(--bh-content-disabled)]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "rtl:[&_svg[data-rtl-flip='true']]:-scale-x-100",
  ],
  {
    variants: {
      variant: {
        soft:
          "bg-[var(--bh-pagination-control-soft-bg)] shadow-[var(--shadow-pagination-control)] hover:bg-[var(--bh-pagination-control-soft-hover)] active:bg-[var(--bh-pagination-control-soft-pressed)]",
        ghost:
          "bg-[var(--bh-pagination-control-ghost-bg)] hover:bg-[var(--bh-pagination-control-ghost-hover)] active:bg-[var(--bh-pagination-control-ghost-pressed)]",
      },
      mode: {
        icon: "w-[var(--bh-pagination-item-size)] p-0",
        text:
          "gap-[var(--bh-pagination-control-text-gap)] px-[var(--bh-pagination-control-text-padding-x)] py-[var(--bh-space-md-8)] rtl:gap-[var(--bh-pagination-control-text-rtl-gap)] rtl:px-[var(--bh-pagination-control-text-rtl-padding-x)]",
      },
    },
    defaultVariants: {
      variant: "soft",
      mode: "text",
    },
  }
)

const paginationControlLabelVariants = cva(
  "min-w-0 whitespace-nowrap",
  {
    variants: {
      variant: {
        soft:
          "px-[var(--bh-pagination-control-label-padding-x)] rtl:px-[var(--bh-pagination-control-label-rtl-padding-x)]",
        ghost: "px-[var(--bh-pagination-control-label-rtl-padding-x)]",
      },
    },
    defaultVariants: {
      variant: "soft",
    },
  }
)

const paginationItemVariants = cva(
  [
    "relative inline-flex size-[var(--bh-pagination-item-size)] shrink-0 items-center justify-center",
    "rounded-[var(--bh-pagination-radius)] border border-transparent text-center",
    "text-[length:var(--bh-pagination-font-size)] font-[var(--bh-pagination-label-font-weight)]",
    "leading-[var(--bh-pagination-line-height)] tracking-[var(--bh-pagination-letter-spacing)]",
    "outline-none transition-[background-color,border-color,color,box-shadow]",
    "disabled:pointer-events-none disabled:text-[var(--bh-content-disabled)]",
  ],
  {
    variants: {
      active: {
        true:
          "border-[var(--bh-pagination-active-border)] bg-[var(--bh-pagination-active-bg)] text-[var(--bh-pagination-active-content)] shadow-[var(--shadow-pagination-active)]",
        false:
          "bg-[var(--bh-pagination-page-bg)] text-[var(--bh-pagination-page-content)] hover:bg-[var(--bh-pagination-page-hover)] active:bg-[var(--bh-pagination-page-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] focus-visible:shadow-[var(--shadow-pagination-focus)]",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

type PaginationProps = Omit<React.ComponentProps<"nav">, "children"> &
  VariantProps<typeof paginationVariants> & {
    type?: PaginationType
    variant?: PaginationVariant
    page?: number
    pages?: PaginationPage[]
    messages?: Partial<PaginationMessages>
    showCaption?: boolean
    caption?: React.ReactNode
    summary?: React.ReactNode
    previousLabel?: React.ReactNode
    nextLabel?: React.ReactNode
    previousAriaLabel?: string
    nextAriaLabel?: string
    previousDisabled?: boolean
    nextDisabled?: boolean
    onPageChange?: (page: number) => void
  }

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination({
  className,
  type = "numeric",
  variant = "soft",
  page = 2,
  pages = defaultPaginationPages,
  messages: messageOverrides,
  showCaption = true,
  caption,
  summary,
  previousLabel,
  nextLabel,
  previousAriaLabel,
  nextAriaLabel,
  previousDisabled,
  nextDisabled,
  onPageChange,
  "aria-label": ariaLabel,
  dir,
  ...props
}, ref) {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const selectedDirection = useResolvedDirection(
    dir === "ltr" || dir === "rtl" ? dir : undefined,
    rootRef
  )
  const setRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )
  const selectedType = type || "numeric"
  const selectedVariant = variant || "soft"
  const messages = { ...defaultPaginationMessages, ...messageOverrides }
  const captionContent = caption ?? messages.caption
  const summaryContent = summary ?? messages.summary
  const previousContent = previousLabel ?? messages.previous
  const nextContent = nextLabel ?? messages.next

  return (
    <nav
      aria-label={ariaLabel ?? messages.navigation}
      data-show-caption={showCaption ? "true" : "false"}
      data-slot="pagination"
      data-type={selectedType}
      data-variant={selectedVariant}
      dir={selectedDirection}
      ref={setRootRef}
      className={cn(
        paginationVariants({
          type: selectedType,
          showCaption,
          className,
        })
      )}
      {...props}
    >
      {selectedType === "simple" ? (
        <>
          {showCaption ? (
            <PaginationCaption type="simple">{captionContent}</PaginationCaption>
          ) : null}
          <PaginationControls type="actions">
            <PaginationTextButton
              ariaLabel={previousAriaLabel ?? messages.previousAriaLabel}
              disabled={previousDisabled}
              label={previousContent}
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              type="previous"
              variant={selectedVariant}
            />
            <PaginationTextButton
              ariaLabel={nextAriaLabel ?? messages.nextAriaLabel}
              disabled={nextDisabled}
              label={nextContent}
              onClick={() => onPageChange?.(page + 1)}
              type="next"
              variant={selectedVariant}
            />
          </PaginationControls>
        </>
      ) : null}

      {selectedType === "summary" ? (
        <>
          <PaginationTextButton
            ariaLabel={previousAriaLabel ?? messages.previousAriaLabel}
            disabled={previousDisabled}
            label={previousContent}
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            type="previous"
            variant={selectedVariant}
          />
          <span
            data-slot="pagination-summary"
            dir="auto"
            className="shrink-0 whitespace-nowrap text-[color:var(--bh-pagination-caption-content)] font-[var(--bh-pagination-caption-font-weight)]"
          >
            {summaryContent}
          </span>
          <PaginationTextButton
            ariaLabel={nextAriaLabel ?? messages.nextAriaLabel}
            disabled={nextDisabled}
            label={nextContent}
            onClick={() => onPageChange?.(page + 1)}
            type="next"
            variant={selectedVariant}
          />
        </>
      ) : null}

      {selectedType === "numeric" ? (
        <>
          {showCaption ? (
            <PaginationCaption type="numeric">{captionContent}</PaginationCaption>
          ) : null}
          <PaginationControls type="numeric">
            <PaginationIconButton
              ariaLabel={previousAriaLabel ?? messages.previousAriaLabel}
              disabled={previousDisabled}
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              type="previous"
              variant={selectedVariant}
            />
            <div
              data-slot="pagination-pages"
              className="ds-pagination__pages flex min-w-0 shrink-0 items-center gap-[var(--bh-pagination-page-gap)]"
            >
              {pages.map((item, index) => (
                <PaginationPageItem
                  key={getPaginationPageKey(item, index)}
                  item={item}
                  messages={messages}
                  page={page}
                  onPageChange={onPageChange}
                />
              ))}
            </div>
            <PaginationIconButton
              ariaLabel={nextAriaLabel ?? messages.nextAriaLabel}
              disabled={nextDisabled}
              onClick={() => onPageChange?.(page + 1)}
              type="next"
              variant={selectedVariant}
            />
          </PaginationControls>
        </>
      ) : null}
    </nav>
  )
})

function PaginationCaption({
  children,
  type,
}: {
  children: React.ReactNode
  type: "numeric" | "simple"
}) {
  return (
    <span
      data-slot="pagination-caption"
      dir="auto"
      className={cn(
        "min-w-0 text-[color:var(--bh-pagination-caption-content)] font-[var(--bh-pagination-caption-font-weight)]",
        type === "numeric"
          ? "w-[var(--bh-pagination-caption-width)] shrink-0"
          : "flex-1"
      )}
    >
      {children}
    </span>
  )
}

function PaginationControls({
  children,
  type,
}: {
  children: React.ReactNode
  type: "actions" | "numeric"
}) {
  return (
    <div
      data-slot="pagination-controls"
      className={cn(
        "ds-pagination__controls flex max-w-full min-w-0 shrink-0 items-center",
        type === "numeric"
          ? "gap-[var(--bh-pagination-control-gap)]"
          : "gap-[var(--bh-pagination-action-gap)]"
      )}
    >
      {children}
    </div>
  )
}

function PaginationIconButton({
  ariaLabel,
  disabled,
  onClick,
  type,
  variant,
}: {
  ariaLabel: string
  disabled?: boolean
  onClick?: () => void
  type: "previous" | "next"
  variant: PaginationVariant
}) {
  return (
    <button
      aria-label={ariaLabel}
      data-slot="pagination-control"
      disabled={disabled}
      type="button"
      className={cn(paginationControlVariants({ variant, mode: "icon" }))}
      onClick={onClick}
    >
      <PaginationArrowIcon type={type} />
    </button>
  )
}

function PaginationTextButton({
  ariaLabel,
  disabled,
  label,
  onClick,
  type,
  variant,
}: {
  ariaLabel: string
  disabled?: boolean
  label: React.ReactNode
  onClick?: () => void
  type: "previous" | "next"
  variant: PaginationVariant
}) {
  return (
    <button
      aria-label={ariaLabel}
      data-slot="pagination-control"
      disabled={disabled}
      type="button"
      className={cn(paginationControlVariants({ variant, mode: "text" }))}
      onClick={onClick}
    >
      {type === "previous" ? <PaginationArrowIcon type="previous" /> : null}
      <span
        data-slot="pagination-control-label"
        dir="auto"
        className={cn(paginationControlLabelVariants({ variant }))}
      >
        {label}
      </span>
      {type === "next" ? <PaginationArrowIcon type="next" /> : null}
    </button>
  )
}

function PaginationPageItem({
  item,
  messages,
  page,
  onPageChange,
}: {
  item: PaginationPage
  messages: PaginationMessages
  page: number
  onPageChange?: (page: number) => void
}) {
  const normalizedItem = normalizePaginationPage(item)

  if (normalizedItem.type === "ellipsis") {
    return (
      <span
        aria-label={normalizedItem.ariaLabel ?? messages.morePagesAriaLabel}
        data-slot="pagination-ellipsis"
        role="separator"
        className={cn(paginationItemVariants({ active: false }))}
      >
        {normalizedItem.label ?? "..."}
      </span>
    )
  }

  const isActive = normalizedItem.value === page

  return (
    <button
      aria-current={isActive ? "page" : undefined}
      aria-label={
        normalizedItem.ariaLabel ?? messages.pageAriaLabel(normalizedItem.value)
      }
      data-page={normalizedItem.value}
      data-slot="pagination-page"
      type="button"
      className={cn(paginationItemVariants({ active: isActive }))}
      onClick={() => onPageChange?.(normalizedItem.value)}
    >
      {normalizedItem.label ?? normalizedItem.value}
    </button>
  )
}

function PaginationArrowIcon({ type }: { type: "previous" | "next" }) {
  const Icon = type === "previous" ? ChevronLeftIcon : ChevronRightIcon

  return (
    <span
      data-slot="pagination-icon"
      className="inline-flex size-[var(--bh-pagination-icon-slot-size)] shrink-0 items-center justify-center"
    >
      <Icon
        aria-hidden="true"
        className="size-[var(--bh-pagination-icon-size)]"
        data-rtl-flip="true"
        focusable="false"
        strokeWidth="var(--bh-icon-stroke-225)"
      />
    </span>
  )
}

function normalizePaginationPage(item: PaginationPage) {
  if (item === "ellipsis") {
    return { type: "ellipsis" as const }
  }

  if (typeof item === "number") {
    return { type: "page" as const, value: item }
  }

  return item
}

function getPaginationPageKey(item: PaginationPage, index: number) {
  const normalizedItem = normalizePaginationPage(item)

  if (normalizedItem.type === "page") {
    return `page-${normalizedItem.value}`
  }

  return `ellipsis-${index}`
}

export {
  arabicPaginationMessages,
  Pagination,
  paginationControlVariants,
  paginationItemVariants,
  paginationVariants,
}
export type {
  PaginationPage,
  PaginationMessages,
  PaginationProps,
  PaginationType,
  PaginationVariant,
}
