import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type BadgeStyle = "light" | "outline" | "solid"
type BadgeColor =
  | "neutral"
  | "blue"
  | "green"
  | "amber"
  | "danger"
  | "purple"
  | "fuchsia"
  | "rose"
  | "sky"
  | "golden"
type BadgeType =
  | "default"
  | "leading-icon"
  | "trailing-icon"
  | "dot"
  | "flag"
type BadgeSize = "xs" | "sm" | "default" | "lg"
type LegacyBadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "outline"
  | "soft"
  | "soft-success"
  | "soft-warning"
  | "soft-destructive"
  | "ghost"
  | "link"

const legacyVariantMap: Record<
  LegacyBadgeVariant,
  { badgeStyle: BadgeStyle; color: BadgeColor; className?: string }
> = {
  default: { badgeStyle: "solid", color: "blue" },
  secondary: { badgeStyle: "light", color: "neutral" },
  success: { badgeStyle: "solid", color: "green" },
  warning: { badgeStyle: "solid", color: "amber" },
  destructive: { badgeStyle: "solid", color: "danger" },
  outline: { badgeStyle: "outline", color: "neutral" },
  soft: { badgeStyle: "light", color: "blue" },
  "soft-success": { badgeStyle: "light", color: "green" },
  "soft-warning": { badgeStyle: "light", color: "amber" },
  "soft-destructive": { badgeStyle: "light", color: "danger" },
  ghost: {
    badgeStyle: "light",
    color: "neutral",
    className: "bg-[var(--bh-interactive-ghost-default)]",
  },
  link: {
    badgeStyle: "light",
    color: "blue",
    className:
      "bg-[var(--bh-interactive-ghost-default)] px-[var(--bh-space-none)] text-[var(--bh-content-link)] underline-offset-[var(--bh-space-xs-4)] [a&]:hover:underline",
  },
}

const badgeVariants = cva(
  [
    "inline-flex min-w-0 shrink-0 items-center justify-center whitespace-nowrap",
    "rounded-[var(--bh-radius-full)] border border-transparent outline-none",
    "transition-[background-color,border-color,color,box-shadow]",
    "focus-visible:border-[var(--bh-border-focus)] focus-visible:ring-[length:var(--bh-badge-focus-ring-width)] focus-visible:ring-[var(--ring)]",
    "aria-invalid:border-[var(--bh-border-focus-danger)] aria-invalid:ring-[var(--danger-ring)]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "rtl:[&_svg[data-rtl-flip='true']]:-scale-x-100",
  ],
  {
    variants: {
      badgeStyle: {
        light: "border-transparent",
        outline: "border-[length:var(--bh-badge-outline-border-width)] bg-transparent",
        solid: "border-transparent",
      },
      color: {
        neutral: "",
        blue: "",
        green: "",
        amber: "",
        danger: "",
        purple: "",
        fuchsia: "",
        rose: "",
        sky: "",
        golden: "",
      },
      type: {
        default: "gap-[var(--bh-space-none)]",
        "leading-icon": "gap-[var(--bh-space-none)]",
        "trailing-icon": "gap-[var(--bh-space-none)]",
        dot: "gap-[var(--bh-space-xs-4)]",
        flag: "gap-[var(--bh-space-xs-4)]",
      },
      size: {
        xs: [
          "h-[var(--bh-space-5xl-24)]",
          "text-[length:var(--bh-text-body-3xs-medium-font-size)]",
          "font-[var(--bh-text-body-3xs-medium-font-weight)]",
          "leading-[var(--bh-text-body-3xs-medium-line-height)]",
          "tracking-[var(--bh-text-body-3xs-medium-letter-spacing)]",
        ],
        sm: [
          "h-[var(--bh-space-5xl-24)]",
          "text-[length:var(--bh-text-body-3xs-medium-font-size)]",
          "font-[var(--bh-text-body-3xs-medium-font-weight)]",
          "leading-[var(--bh-text-body-3xs-medium-line-height)]",
          "tracking-[var(--bh-text-body-3xs-medium-letter-spacing)]",
        ],
        default: [
          "h-[var(--bh-space-5xl-24)]",
          "text-[length:var(--bh-text-body-3xs-medium-font-size)]",
          "font-[var(--bh-text-body-3xs-medium-font-weight)]",
          "leading-[var(--bh-text-body-3xs-medium-line-height)]",
          "tracking-[var(--bh-text-body-3xs-medium-letter-spacing)]",
        ],
        lg: [
          "h-[calc(var(--bh-space-5xl-24)+var(--bh-space-xs-4))]",
          "text-[length:var(--bh-text-body-2xs-medium-font-size)]",
          "font-[var(--bh-text-body-2xs-medium-font-weight)]",
          "leading-[var(--bh-text-body-2xs-medium-line-height)]",
          "tracking-[var(--bh-text-body-2xs-medium-letter-spacing)]",
        ],
      },
      showNumber: {
        true: "gap-[var(--bh-space-none)] px-[var(--bh-space-xs-4)] text-center",
        false: "",
      },
      splitAction: {
        true:
          "overflow-hidden border-[var(--badge-split-border-color,currentColor)] pe-[var(--bh-space-none)]",
        false: "[&_svg]:size-[var(--bh-space-3xl-16)]",
      },
    },
    compoundVariants: [
      {
        type: "default",
        size: ["xs", "sm", "default"],
        showNumber: false,
        class: "px-[var(--bh-space-md-8)]",
      },
      {
        type: "default",
        size: "lg",
        showNumber: false,
        class: "px-[var(--bh-space-xl-12)]",
      },
      {
        type: ["leading-icon", "trailing-icon", "dot"],
        showNumber: false,
        splitAction: false,
        class: "px-[var(--bh-space-md-8)]",
      },
      {
        type: "trailing-icon",
        showNumber: false,
        splitAction: true,
        class: "ps-[var(--bh-space-md-8)]",
      },
      {
        type: "flag",
        showNumber: false,
        class: "ps-[var(--bh-space-xs-4)] pe-[var(--bh-space-md-8)]",
      },
      {
        size: ["xs", "sm", "default"],
        showNumber: true,
        class:
          "w-[var(--bh-space-5xl-24)] font-[var(--bh-text-body-3xs-semibold-font-weight)]",
      },
      {
        size: "lg",
        showNumber: true,
        class:
          "w-[calc(var(--bh-space-5xl-24)+var(--bh-space-xs-4))] font-[var(--bh-text-body-2xs-semibold-font-weight)]",
      },
      {
        badgeStyle: "light",
        color: "neutral",
        class:
          "bg-[var(--bh-bg-neutral-subtle)] text-[var(--bh-content-default)] [--badge-dot-color:var(--bh-content-muted)] [--badge-split-border-color:var(--bh-border-default)]",
      },
      {
        badgeStyle: "outline",
        color: "neutral",
        class:
          "border-[var(--bh-border-strong)] text-[var(--bh-content-default)] [--badge-dot-color:var(--bh-content-default)] [--badge-split-border-color:var(--bh-border-default)]",
      },
      {
        badgeStyle: "solid",
        color: "neutral",
        class:
          "bg-[var(--bh-bg-neutral-bold)] text-[var(--bh-content-on-neutral)] [--badge-dot-color:var(--bh-content-on-neutral)] [--badge-split-border-color:var(--bh-border-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "blue",
        class:
          "bg-[var(--bh-bg-accent-blue-subtle)] text-[var(--bh-content-accent-blue-strong)] [--badge-dot-color:var(--bh-content-accent-blue-default)] [--badge-split-border-color:var(--bh-border-accent-blue-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "blue",
        class:
          "border-[var(--bh-border-accent-blue-strong)] text-[var(--bh-content-accent-blue-strong)] [--badge-dot-color:var(--bh-content-accent-blue-strong)] [--badge-split-border-color:var(--bh-border-accent-blue-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "blue",
        class:
          "bg-[var(--bh-bg-accent-blue-bold)] text-[var(--bh-content-on-color)] [--badge-dot-color:var(--bh-content-on-color)] [--badge-split-border-color:var(--bh-border-accent-blue-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "green",
        class:
          "bg-[var(--bh-bg-accent-green-subtle)] text-[var(--bh-content-accent-green-strong)] [--badge-dot-color:var(--bh-content-accent-green-default)] [--badge-split-border-color:var(--bh-border-accent-green-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "green",
        class:
          "border-[var(--bh-border-accent-green-strong)] text-[var(--bh-content-accent-green-strong)] [--badge-dot-color:var(--bh-content-accent-green-strong)] [--badge-split-border-color:var(--bh-border-accent-green-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "green",
        class:
          "bg-[var(--bh-bg-accent-green-default)] text-[var(--bh-content-on-light)] [--badge-dot-color:var(--bh-content-on-light)] [--badge-split-border-color:var(--bh-border-accent-green-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "amber",
        class:
          "bg-[var(--bh-bg-accent-amber-subtle)] text-[var(--bh-content-accent-amber-strong)] [--badge-dot-color:var(--bh-content-accent-amber-default)] [--badge-split-border-color:var(--bh-border-accent-amber-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "amber",
        class:
          "border-[var(--bh-border-accent-amber-strong)] text-[var(--bh-content-accent-amber-strong)] [--badge-dot-color:var(--bh-content-accent-amber-strong)] [--badge-split-border-color:var(--bh-border-accent-amber-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "amber",
        class:
          "bg-[var(--bh-bg-accent-amber-default)] text-[var(--bh-content-on-light)] [--badge-dot-color:var(--bh-content-on-light)] [--badge-split-border-color:var(--bh-border-accent-amber-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "danger",
        class:
          "bg-[var(--bh-bg-accent-red-subtle)] text-[var(--bh-content-accent-red-strong)] [--badge-dot-color:var(--bh-content-accent-red-default)] [--badge-split-border-color:var(--bh-border-accent-red-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "danger",
        class:
          "border-[var(--bh-border-accent-red-strong)] text-[var(--bh-content-accent-red-strong)] [--badge-dot-color:var(--bh-content-accent-red-strong)] [--badge-split-border-color:var(--bh-border-accent-red-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "danger",
        class:
          "bg-[var(--bh-bg-accent-red-default)] text-[var(--bh-content-on-color)] [--badge-dot-color:var(--bh-content-on-color)] [--badge-split-border-color:var(--bh-border-accent-red-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "purple",
        class:
          "bg-[var(--bh-bg-accent-purple-subtle)] text-[var(--bh-content-accent-purple-strong)] [--badge-dot-color:var(--bh-content-accent-purple-default)] [--badge-split-border-color:var(--bh-border-accent-purple-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "purple",
        class:
          "border-[var(--bh-border-accent-purple-strong)] text-[var(--bh-content-accent-purple-strong)] [--badge-dot-color:var(--bh-content-accent-purple-strong)] [--badge-split-border-color:var(--bh-border-accent-purple-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "purple",
        class:
          "bg-[var(--bh-bg-accent-purple-default)] text-[var(--bh-content-on-color)] [--badge-dot-color:var(--bh-content-on-color)] [--badge-split-border-color:var(--bh-border-accent-purple-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "fuchsia",
        class:
          "bg-[var(--bh-bg-accent-fuchsia-subtle)] text-[var(--bh-content-accent-fuchsia-strong)] [--badge-dot-color:var(--bh-content-accent-fuchsia-default)] [--badge-split-border-color:var(--bh-border-accent-fuchsia-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "fuchsia",
        class:
          "border-[var(--bh-border-accent-fuchsia-strong)] text-[var(--bh-content-accent-fuchsia-strong)] [--badge-dot-color:var(--bh-content-accent-fuchsia-strong)] [--badge-split-border-color:var(--bh-border-accent-fuchsia-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "fuchsia",
        class:
          "bg-[var(--bh-bg-accent-fuchsia-default)] text-[var(--bh-content-on-light)] [--badge-dot-color:var(--bh-content-on-light)] [--badge-split-border-color:var(--bh-border-accent-fuchsia-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "rose",
        class:
          "bg-[var(--bh-bg-accent-rose-subtle)] text-[var(--bh-content-accent-rose-strong)] [--badge-dot-color:var(--bh-content-accent-rose-default)] [--badge-split-border-color:var(--bh-border-accent-rose-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "rose",
        class:
          "border-[var(--bh-border-accent-rose-strong)] text-[var(--bh-content-accent-rose-strong)] [--badge-dot-color:var(--bh-content-accent-rose-strong)] [--badge-split-border-color:var(--bh-border-accent-rose-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "rose",
        class:
          "bg-[var(--bh-bg-accent-rose-bold)] text-[var(--bh-content-on-color)] [--badge-dot-color:var(--bh-content-on-color)] [--badge-split-border-color:var(--bh-border-accent-rose-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "sky",
        class:
          "bg-[var(--bh-bg-accent-sky-subtle)] text-[var(--bh-content-accent-sky-strong)] [--badge-dot-color:var(--bh-content-accent-sky-default)] [--badge-split-border-color:var(--bh-border-accent-sky-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "sky",
        class:
          "border-[var(--bh-border-accent-sky-strong)] text-[var(--bh-content-accent-sky-strong)] [--badge-dot-color:var(--bh-content-accent-sky-strong)] [--badge-split-border-color:var(--bh-border-accent-sky-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "sky",
        class:
          "bg-[var(--bh-bg-accent-sky-base)] text-[var(--bh-content-on-light)] [--badge-dot-color:var(--bh-content-on-light)] [--badge-split-border-color:var(--bh-border-accent-sky-subtle)]",
      },
      {
        badgeStyle: "light",
        color: "golden",
        class:
          "bg-[var(--bh-bg-accent-golden-subtle)] text-[var(--bh-content-accent-golden-strong)] [--badge-dot-color:var(--bh-content-accent-golden-default)] [--badge-split-border-color:var(--bh-border-accent-golden-subtle)]",
      },
      {
        badgeStyle: "outline",
        color: "golden",
        class:
          "border-[var(--bh-border-accent-golden-strong)] text-[var(--bh-content-accent-golden-strong)] [--badge-dot-color:var(--bh-content-accent-golden-strong)] [--badge-split-border-color:var(--bh-border-accent-golden-subtle)]",
      },
      {
        badgeStyle: "solid",
        color: "golden",
        class:
          "bg-[var(--bh-bg-accent-golden-default)] text-[var(--bh-content-on-light)] [--badge-dot-color:var(--bh-content-on-light)] [--badge-split-border-color:var(--bh-border-accent-golden-subtle)]",
      },
    ],
    defaultVariants: {
      badgeStyle: "light",
      color: "neutral",
      type: "default",
      size: "sm",
      showNumber: false,
      splitAction: false,
    },
  }
)

type BadgeProps = Omit<React.ComponentProps<"span">, "color"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    variant?: LegacyBadgeVariant
    flag?: React.ReactNode
    number?: React.ReactNode
  }

type BadgeContentProps = {
  children: React.ReactNode
  flag?: React.ReactNode
  number?: React.ReactNode
  size: BadgeSize
  showNumber: boolean
  splitAction: boolean
  type: BadgeType
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge({
  className,
  variant,
  badgeStyle,
  color,
  type,
  size,
  showNumber = false,
  splitAction = false,
  number,
  flag,
  asChild = false,
  dir = "auto",
  children,
  ...props
}, ref) {
  const Comp = asChild ? Slot : "span"
  const legacyVariant = variant ? legacyVariantMap[variant] : undefined
  const isNumber = Boolean(showNumber)
  const resolvedBadgeStyle = badgeStyle ?? legacyVariant?.badgeStyle ?? "light"
  const resolvedColor = color ?? legacyVariant?.color ?? "neutral"
  const resolvedType = isNumber ? "default" : type ?? "default"
  const resolvedSize = (size ?? "sm") as BadgeSize
  const resolvedSplitAction =
    !isNumber && resolvedType === "trailing-icon" && Boolean(splitAction)
  const contentProps = {
    flag,
    number,
    size: resolvedSize,
    showNumber: isNumber,
    splitAction: resolvedSplitAction,
    type: resolvedType,
  }

  return (
    <Comp
      data-slot="badge"
      data-variant={
        variant ?? `${resolvedBadgeStyle}-${resolvedColor}-${resolvedType}`
      }
      data-style={resolvedBadgeStyle}
      data-color={resolvedColor}
      data-type={resolvedType}
      data-size={resolvedSize}
      data-show-number={isNumber ? "true" : "false"}
      data-split-action={resolvedSplitAction ? "true" : "false"}
      dir={dir}
      ref={ref}
      className={cn(
        badgeVariants({
          badgeStyle: resolvedBadgeStyle,
          color: resolvedColor,
          type: resolvedType,
          size: resolvedSize,
          showNumber: isNumber,
          splitAction: resolvedSplitAction,
        }),
        legacyVariant?.className,
        className
      )}
      {...props}
    >
      {asChild ? (
        renderBadgeSlotChild(children, contentProps)
      ) : (
        <BadgeContent {...contentProps}>
          {children}
        </BadgeContent>
      )}
    </Comp>
  )
})

function renderBadgeSlotChild(
  children: React.ReactNode,
  contentProps: Omit<BadgeContentProps, "children">
) {
  if (!React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return children
  }

  return React.cloneElement(
    children,
    undefined,
    <BadgeContent {...contentProps}>{children.props.children}</BadgeContent>
  )
}

function BadgeContent({
  children,
  flag,
  number,
  size,
  showNumber,
  splitAction,
  type,
}: BadgeContentProps) {
  const content = showNumber ? number ?? children : children

  return (
    <>
      {!showNumber && type === "dot" ? <BadgeDot /> : null}
      {!showNumber && type === "flag" ? <BadgeFlag>{flag}</BadgeFlag> : null}
      {renderBadgeChildren(content, type, splitAction, size)}
    </>
  )
}

function renderBadgeChildren(
  children: React.ReactNode,
  type: BadgeType,
  splitAction: boolean,
  size: BadgeSize,
  keyPrefix = "badge-label"
): React.ReactNode[] {
  const hasSplitTrailingAction = splitAction && type === "trailing-icon"
  const labelClassName = cn(
    "min-w-0",
    (type === "leading-icon" || type === "trailing-icon") &&
      "px-[var(--bh-space-xs-4)]",
    hasSplitTrailingAction &&
      "ps-[var(--bh-space-xs-4)] pe-[var(--bh-space-md-8)]"
  )
  const renderedChildren: React.ReactNode[] = []

  React.Children.toArray(children).forEach((child, index) => {
    if (
      typeof child === "string" ||
      typeof child === "number" ||
      typeof child === "bigint"
    ) {
      renderedChildren.push(
        <span
          key={`${keyPrefix}-${index}`}
          data-slot="badge-label"
          dir="auto"
          className={labelClassName}
        >
          {child}
        </span>
      )

      return
    }

    if (
      React.isValidElement<{ children?: React.ReactNode }>(child) &&
      child.type === React.Fragment
    ) {
      renderedChildren.push(
        ...renderBadgeChildren(
          child.props.children,
          type,
          false,
          size,
          `${keyPrefix}-${index}`
        )
      )

      return
    }

    renderedChildren.push(child)
  })

  if (!hasSplitTrailingAction || renderedChildren.length < 2) {
    return renderedChildren
  }

  return [
    ...renderedChildren.slice(0, -1),
    <BadgeSplitAction key={`${keyPrefix}-split-action`} size={size}>
      {renderedChildren.at(-1)}
    </BadgeSplitAction>,
  ]
}

function BadgeSplitAction({
  children,
  size,
}: {
  children: React.ReactNode
  size: BadgeSize
}) {
  return (
    <span
      data-slot="badge-split-action"
      className={cn(
        "flex h-full shrink-0 items-center justify-center border-s border-[var(--badge-split-border-color,currentColor)] text-current",
        size === "lg"
          ? "w-[calc(var(--bh-space-5xl-24)+var(--bh-space-xs-4))] [&_svg]:size-[var(--bh-space-2xl-14)]"
          : "w-[var(--bh-space-5xl-24)] [&_svg]:size-[var(--bh-space-xl-12)]"
      )}
    >
      {children}
    </span>
  )
}

function BadgeDot() {
  return (
    <span
      data-slot="badge-dot"
      aria-hidden="true"
      className="flex size-[var(--bh-space-md-8)] shrink-0 items-center justify-center"
    >
      <span className="size-[var(--bh-space-sm-6)] rounded-[var(--bh-radius-full)] bg-[var(--badge-dot-color,currentColor)]" />
    </span>
  )
}

function BadgeFlag({ children }: { children?: React.ReactNode }) {
  return (
    <span
      data-slot="badge-flag"
      aria-hidden={children ? undefined : "true"}
      className="flex size-[var(--bh-space-3xl-16)] shrink-0 items-center justify-center overflow-hidden rounded-[var(--bh-radius-xs-2)]"
    >
      {children ?? (
        <span className="size-full rounded-[var(--bh-radius-xs-2)] bg-[var(--badge-dot-color,currentColor)] opacity-[var(--bh-opacity-35)]" />
      )}
    </span>
  )
}

export {
  Badge,
  badgeVariants,
  type BadgeColor,
  type BadgeProps,
  type BadgeSize,
  type BadgeStyle,
  type BadgeType,
  type LegacyBadgeVariant,
}
