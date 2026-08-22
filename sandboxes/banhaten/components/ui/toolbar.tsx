import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ChevronDownIcon,
  FilterIcon,
  MoreVerticalIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  KbdShortcut,
  type ShortcutPlatform,
} from "@/components/ui/kbd"

type ControlDensity = "compact" | "default" | "comfortable"

const toolbarVariants = cva(
  "flex w-full max-w-full min-w-0 gap-[var(--bh-space-3xl-16)] text-[var(--bh-content-default)]",
  {
    variants: {
      layout: {
        inline: "items-start",
        split: "items-start justify-between",
        stack: "flex-col items-stretch",
        wrap: "flex-wrap items-center",
      },
      wrap: {
        true: "flex-wrap",
        false: "",
      },
    },
    defaultVariants: {
      layout: "inline",
      wrap: false,
    },
  }
)

const toolbarSectionVariants = cva(
  "flex max-w-full min-w-0 items-center gap-[var(--bh-space-xl-12)]",
  {
    variants: {
      align: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
      },
      grow: {
        true: "flex-[1_1_var(--bh-space-19xl-384)]",
        false: "flex-[0_1_auto]",
      },
      stack: {
        true: "flex-col items-stretch",
        false: "",
      },
      wrap: {
        true: "flex-wrap",
        false: "overflow-x-auto",
      },
    },
    defaultVariants: {
      align: "start",
      grow: false,
      stack: false,
      wrap: true,
    },
  }
)

const toolbarButtonVariants = cva(
  "group/toolbar-button inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-[var(--bh-control-default)] text-[length:var(--bh-text-button-font-size)] font-[var(--bh-text-button-font-weight)] leading-[var(--bh-text-button-line-height)] tracking-[var(--bh-text-button-letter-spacing)] outline-none transition-[background-color,border-color,color,box-shadow] focus-visible:shadow-[var(--shadow-button-focus)] disabled:pointer-events-none disabled:shadow-none aria-invalid:border-[length:var(--bh-border-width-default)] aria-invalid:border-[var(--bh-border-danger-strong)] aria-invalid:shadow-[var(--shadow-button-danger-focus)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--bh-button-icon-size)] [&_svg[data-icon='inline-start']]:ms-[var(--bh-button-icon-offset)] [&_svg[data-icon='inline-end']]:me-[var(--bh-button-icon-offset)] rtl:[&_svg[data-rtl-flip='true']]:-scale-x-100",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bh-interactive-brand-default)] text-[var(--bh-content-on-brand)] shadow-[var(--shadow-button-raised)] hover:bg-[var(--bh-interactive-brand-hover)] active:bg-[var(--bh-interactive-brand-pressed)] disabled:bg-[var(--bh-interactive-brand-disabled)] disabled:text-[var(--bh-content-disabled)]",
        soft: "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-interactive-soft-default)] text-[var(--bh-content-default)] shadow-[var(--shadow-button-soft)] hover:bg-[var(--bh-interactive-soft-hover)] active:bg-[var(--bh-interactive-soft-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:bg-[var(--bh-interactive-soft-disabled)] disabled:text-[var(--bh-content-disabled)]",
        outline:
          "border-[length:var(--bh-border-width-default)] border-[var(--bh-border-default)] bg-[var(--bh-interactive-outlined-default)] text-[var(--bh-content-default)] hover:bg-[var(--bh-interactive-outlined-hover)] active:bg-[var(--bh-interactive-outlined-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:border-[var(--bh-border-disabled)] disabled:bg-[var(--bh-interactive-outlined-disabled)] disabled:text-[var(--bh-content-disabled)]",
        ghost:
          "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-interactive-ghost-default)] text-[var(--bh-content-default)] hover:bg-[var(--bh-interactive-ghost-hover)] active:bg-[var(--bh-interactive-ghost-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:bg-[var(--bh-interactive-ghost-disabled)] disabled:text-[var(--bh-content-disabled)]",
        link: "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-interactive-ghost-default)] text-[var(--bh-content-brand-default)] hover:bg-[var(--bh-interactive-ghost-hover)] active:bg-[var(--bh-interactive-ghost-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:bg-[var(--bh-interactive-ghost-disabled)] disabled:text-[var(--bh-content-disabled)]",
      },
      size: {
        xs: "h-[var(--bh-button-xs-height)] gap-[var(--bh-button-gap-xs)] px-[var(--bh-button-xs-padding-x)] py-[var(--bh-button-sm-padding-y)] has-[>svg]:px-[var(--bh-button-xs-padding-x)]",
        sm: "h-[var(--bh-button-sm-height)] gap-[var(--bh-button-gap)] px-[var(--bh-button-sm-padding-x)] py-[var(--bh-button-sm-padding-y)] has-[>svg]:px-[var(--bh-button-sm-padding-x)]",
        default: "h-[var(--bh-button-md-height)] gap-[var(--bh-button-gap)] px-[var(--bh-button-md-padding-x)] py-[var(--bh-button-sm-padding-y)] has-[>svg]:px-[var(--bh-button-md-padding-x)]",
        "icon-xs": "size-[var(--bh-button-xs-height)] gap-[var(--bh-space-none)] p-[var(--bh-space-none)]",
        "icon-sm": "size-[var(--bh-button-sm-height)] gap-[var(--bh-space-none)] p-[var(--bh-space-none)]",
        icon: "size-[var(--bh-button-md-height)] gap-[var(--bh-space-none)] p-[var(--bh-space-none)]",
      },
    },
    defaultVariants: {
      variant: "soft",
      size: "sm",
    },
  }
)

const toolbarSearchVariants = cva(
  "flex max-w-full min-w-0 items-center gap-[var(--bh-input-content-gap)] rounded-[var(--bh-input-radius)] bg-[var(--bh-interactive-input-default)] text-[var(--bh-content-default)] shadow-[var(--shadow-input)] transition-[background-color,box-shadow] focus-within:shadow-[var(--shadow-input-focus-ring)] data-[disabled=true]:pointer-events-none data-[disabled=true]:bg-[var(--bh-interactive-input-disabled)] data-[disabled=true]:text-[var(--bh-content-disabled)]",
  {
    variants: {
      density: {
        compact: "h-[var(--bh-input-md-height)] px-[var(--bh-input-md-padding-x)]",
        default: "h-[var(--bh-input-lg-height)] px-[var(--bh-input-lg-padding-x)]",
        comfortable: "h-[var(--bh-input-comfortable-height)] px-[var(--bh-input-comfortable-padding-x)]",
      },
      width: {
        compact: "w-[calc(var(--bh-input-width)/2)]",
        default: "w-[var(--bh-input-width)]",
        full: "w-full",
        auto: "w-auto",
      },
    },
    defaultVariants: {
      density: "default",
      width: "default",
    },
  }
)

const toolbarSelectVariants = cva(
  "inline-flex max-w-full min-w-0 items-center justify-between gap-[var(--bh-space-md-8)] rounded-[var(--bh-input-radius)] bg-[var(--bh-interactive-input-default)] px-[var(--bh-select-trigger-padding-x)] text-start text-[length:var(--bh-text-body-md-regular-font-size)] font-[var(--bh-text-body-md-regular-font-weight)] leading-[var(--bh-text-body-md-regular-line-height)] tracking-[var(--bh-text-body-md-regular-letter-spacing)] text-[var(--bh-content-default)] shadow-[var(--shadow-select-trigger)] outline-none transition-[background-color,box-shadow] hover:bg-[var(--bh-bg-default-hover)] focus-visible:shadow-[var(--shadow-input-focus-ring)] disabled:pointer-events-none disabled:bg-[var(--bh-interactive-input-disabled)] disabled:text-[var(--bh-content-disabled)]",
  {
    variants: {
      density: {
        compact: "h-[var(--bh-input-md-height)]",
        default: "h-[var(--bh-input-lg-height)]",
        comfortable: "h-[var(--bh-input-comfortable-height)]",
      },
      width: {
        compact: "w-[calc(var(--bh-select-width)/2)]",
        default: "w-[var(--bh-select-width)]",
        full: "w-full",
        auto: "w-auto",
      },
    },
    defaultVariants: {
      density: "default",
      width: "compact",
    },
  }
)

const toolbarBadgeVariants = cva(
  "inline-flex h-[calc(var(--bh-space-5xl-24)+var(--bh-space-xs-4))] min-w-0 items-center gap-[var(--bh-space-xs-4)] rounded-[var(--bh-radius-full)] px-[var(--bh-space-xl-12)] text-[length:var(--bh-text-body-2xs-medium-font-size)] font-[var(--bh-text-body-2xs-medium-font-weight)] leading-[var(--bh-text-body-2xs-medium-line-height)] tracking-[var(--bh-text-body-2xs-medium-letter-spacing)]",
  {
    variants: {
      variant: {
        neutral:
          "bg-[var(--bh-bg-neutral-subtle)] text-[var(--bh-content-default)]",
        brand:
          "bg-[var(--bh-bg-brand-subtle)] text-[var(--bh-content-brand-default)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

type ToolbarProps = React.ComponentProps<"div"> &
  VariantProps<typeof toolbarVariants>

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { className, layout, wrap, role = "toolbar", ...props },
  ref
) {
  return (
    <div
      data-slot="toolbar"
      ref={ref}
      role={role}
      className={cn(toolbarVariants({ layout, wrap, className }))}
      {...props}
    />
  )
})

type ToolbarSectionProps = React.ComponentProps<"div"> &
  VariantProps<typeof toolbarSectionVariants>

const ToolbarSection = React.forwardRef<HTMLDivElement, ToolbarSectionProps>(
  function ToolbarSection(
    { className, align, grow, stack, wrap, ...props },
    ref
  ) {
    return (
      <div
        data-slot="toolbar-section"
        ref={ref}
        className={cn(
          toolbarSectionVariants({ align, grow, stack, wrap, className })
        )}
        {...props}
      />
    )
  }
)

type ToolbarSpacerProps = React.ComponentProps<"div">

const ToolbarSpacer = React.forwardRef<HTMLDivElement, ToolbarSpacerProps>(
  function ToolbarSpacer({ className, ...props }, ref) {
    return (
      <div
        aria-hidden="true"
        data-slot="toolbar-spacer"
        ref={ref}
        className={cn("min-w-[var(--bh-space-xl-12)] flex-1", className)}
        {...props}
      />
    )
  }
)

type ToolbarButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof toolbarButtonVariants> & {
    asChild?: boolean
    density?: ControlDensity
  }

type ToolbarButtonSize = NonNullable<
  VariantProps<typeof toolbarButtonVariants>["size"]
>

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    {
      asChild = false,
      children,
      className,
      density,
      size,
      type = "button",
      variant,
      ...props
    },
    ref
  ) {
    const Comp = asChild ? Slot : "button"
    const resolvedSize = resolveToolbarButtonSize(density, size)

    return (
      <Comp
        data-density={density}
        data-size={resolvedSize}
        data-slot="toolbar-button"
        ref={ref}
        className={cn(
          toolbarButtonVariants({ variant, size: resolvedSize, className })
        )}
        {...(!asChild ? { type } : {})}
        {...props}
      >
        {asChild ? children : <ToolbarButtonChildren>{children}</ToolbarButtonChildren>}
      </Comp>
    )
  }
)

function ToolbarButtonChildren({ children }: { children: React.ReactNode }) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <span data-slot="toolbar-button-label" dir="auto" className="min-w-0 px-[var(--bh-button-label-padding-x)]">
          {child}
        </span>
      )
    }

    return child
  })
}

type ToolbarIconButtonProps = Omit<ToolbarButtonProps, "children"> & {
  children: React.ReactNode
}

const ToolbarIconButton = React.forwardRef<HTMLButtonElement, ToolbarIconButtonProps>(
  function ToolbarIconButton({ size = "icon-sm", variant = "soft", ...props }, ref) {
    return <ToolbarButton ref={ref} size={size} variant={variant} {...props} />
  }
)

type ToolbarFilterButtonProps = Omit<ToolbarButtonProps, "children"> & {
  label?: string
}

const ToolbarFilterButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarFilterButtonProps
>(function ToolbarFilterButton({ label = "Filters", ...props }, ref) {
  return (
    <ToolbarIconButton aria-label={label} ref={ref} {...props}>
      <FilterIcon />
    </ToolbarIconButton>
  )
})

type ToolbarMoreButtonProps = Omit<ToolbarButtonProps, "children"> & {
  label?: string
}

const ToolbarMoreButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarMoreButtonProps
>(function ToolbarMoreButton(
  { label = "More actions", size = "icon-sm", ...props },
  ref
) {
  return (
    <ToolbarIconButton aria-label={label} ref={ref} size={size} {...props}>
      <MoreVerticalIcon />
    </ToolbarIconButton>
  )
})

type ToolbarSearchProps = Omit<
  React.ComponentProps<"input">,
  "className" | "size" | "width"
> &
  VariantProps<typeof toolbarSearchVariants> & {
    className?: string
    inputClassName?: string
    icon?: React.ReactNode
    shortcutKeys?: readonly string[]
    shortcutPlatform?: ShortcutPlatform
  }

const ToolbarSearch = React.forwardRef<HTMLInputElement, ToolbarSearchProps>(
  function ToolbarSearch(
    {
      className,
      disabled,
      icon,
      inputClassName,
      placeholder = "Search...",
      shortcutKeys,
      shortcutPlatform,
      type = "search",
      density,
      width,
      ...props
    },
    ref
  ) {
    return (
      <div
        data-disabled={disabled ? "true" : undefined}
        data-density={density ?? "default"}
        data-slot="toolbar-search"
        className={cn(toolbarSearchVariants({ density, width, className }))}
      >
        <span
          aria-hidden="true"
          data-slot="toolbar-search-icon"
          className="flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center text-[var(--bh-content-muted)] [&_svg]:size-[var(--bh-select-icon-size)]"
        >
          {icon || <SearchIcon />}
        </span>
        <input
          ref={ref}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-[length:var(--bh-text-body-md-regular-font-size)] font-[var(--bh-text-body-md-regular-font-weight)] leading-[var(--bh-text-body-md-regular-line-height)] tracking-[var(--bh-text-body-md-regular-letter-spacing)] text-[var(--bh-content-default)] outline-none placeholder:text-[var(--bh-content-muted)] disabled:cursor-not-allowed disabled:text-[var(--bh-content-disabled)]",
            inputClassName
          )}
          disabled={disabled}
          placeholder={placeholder}
          type={type}
          {...props}
        />
        {shortcutKeys?.length ? (
          <KbdShortcut
            disabled={disabled}
            keys={shortcutKeys}
            platform={shortcutPlatform}
          />
        ) : null}
      </div>
    )
  }
)

type ToolbarSelectProps = Omit<React.ComponentProps<"button">, "children"> &
  VariantProps<typeof toolbarSelectVariants> & {
    icon?: React.ReactNode | false
    placeholder?: React.ReactNode
    value?: React.ReactNode
  }

const ToolbarSelect = React.forwardRef<HTMLButtonElement, ToolbarSelectProps>(
  function ToolbarSelect(
    {
      className,
      icon,
      placeholder = "Select",
      type = "button",
      value,
      density,
      width,
      ...props
    },
    ref
  ) {
    return (
      <button
        aria-haspopup="listbox"
        data-density={density ?? "default"}
        data-slot="toolbar-select"
        ref={ref}
        type={type}
        className={cn(toolbarSelectVariants({ density, width, className }))}
        {...props}
      >
        <span
          data-slot="toolbar-select-value"
          dir="auto"
          className="min-w-0 flex-1 truncate"
        >
          {value || placeholder}
        </span>
        {icon !== false && (
          <span
            aria-hidden="true"
            data-slot="toolbar-select-icon"
            className="flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center text-[var(--bh-content-muted)] [&_svg]:size-[var(--bh-select-icon-size)]"
          >
            {icon || <ChevronDownIcon />}
          </span>
        )}
      </button>
    )
  }
)

type ToolbarBadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof toolbarBadgeVariants> & {
    asChild?: boolean
  }

const ToolbarBadge = React.forwardRef<HTMLSpanElement, ToolbarBadgeProps>(
  function ToolbarBadge(
    { asChild = false, className, variant, children, ...props },
    ref
  ) {
    const Comp = asChild ? Slot : "span"

    return (
      <Comp
        data-slot="toolbar-badge"
        ref={ref}
        className={cn(toolbarBadgeVariants({ variant, className }))}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <span data-slot="toolbar-badge-label" dir="auto" className="min-w-0 truncate">
            {children}
          </span>
        )}
      </Comp>
    )
  }
)

type ToolbarTextProps = React.ComponentProps<"span"> & {
  density?: ControlDensity
}

const ToolbarText = React.forwardRef<HTMLSpanElement, ToolbarTextProps>(
  function ToolbarText({ className, density = "default", ...props }, ref) {
    return (
      <span
        data-slot="toolbar-text"
        data-density={density}
        ref={ref}
        className={cn(
          "inline-flex min-w-0 items-center text-[length:var(--bh-text-body-md-regular-font-size)] font-[var(--bh-text-body-md-regular-font-weight)] leading-[var(--bh-text-body-md-regular-line-height)] tracking-[var(--bh-text-body-md-regular-letter-spacing)] text-[var(--bh-content-subtle)]",
          density === "compact" && "h-[var(--bh-input-md-height)]",
          density === "default" && "h-[var(--bh-input-lg-height)]",
          density === "comfortable" && "h-[var(--bh-input-comfortable-height)]",
          className
        )}
        {...props}
      />
    )
  }
)

function resolveToolbarButtonSize(
  density: ControlDensity | undefined,
  size: ToolbarButtonSize | null | undefined
): ToolbarButtonSize | null | undefined {
  if (!density) return size
  const iconOnly = size?.startsWith("icon") ?? false
  if (density === "compact") return iconOnly ? "icon-xs" : "xs"
  if (density === "default") return iconOnly ? "icon-sm" : "sm"
  return iconOnly ? "icon" : "default"
}

export {
  Toolbar,
  ToolbarBadge,
  ToolbarButton,
  ToolbarFilterButton,
  ToolbarIconButton,
  ToolbarMoreButton,
  ToolbarSearch,
  ToolbarSection,
  ToolbarSelect,
  ToolbarSpacer,
  ToolbarText,
  toolbarBadgeVariants,
  toolbarButtonVariants,
  toolbarSearchVariants,
  toolbarSectionVariants,
  toolbarSelectVariants,
  toolbarVariants,
}
export type {
  ControlDensity,
  ToolbarBadgeProps,
  ToolbarButtonProps,
  ToolbarFilterButtonProps,
  ToolbarIconButtonProps,
  ToolbarMoreButtonProps,
  ToolbarProps,
  ToolbarSearchProps,
  ToolbarSectionProps,
  ToolbarSelectProps,
  ToolbarSpacerProps,
  ToolbarTextProps,
}
