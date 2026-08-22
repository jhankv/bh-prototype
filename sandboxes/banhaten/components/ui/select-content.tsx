import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertCircleIcon,
  ChartNoAxesCombinedIcon,
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
  PlusIcon,
  UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type SelectItemType =
  | "default"
  | "icon"
  | "avatar"
  | "company"
  | "payment"
  | "dot"
type SelectStatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand"
  | "neutral"
type SelectIconName =
  | "check-fill"
  | "check-line"
  | "chevron-down"
  | "error"
  | "info"
  | "plus"
  | "user"

const selectStatusDot = cva(
  "block size-[var(--bh-select-status-dot-size)] rounded-[var(--bh-radius-full)]",
  {
    variants: {
      tone: {
        success: "bg-[var(--bh-bg-success-default)]",
        warning: "bg-[var(--bh-bg-warning-default)]",
        danger: "bg-[var(--bh-bg-danger-default)]",
        info: "bg-[var(--bh-bg-info-default)]",
        brand: "bg-[var(--bh-bg-brand-default)]",
        neutral: "bg-[var(--bh-bg-neutral-default)]",
      },
    },
    defaultVariants: {
      tone: "success",
    },
  }
)

type SelectItemAvatarProps = React.ComponentProps<"span"> & {
  alt?: string
  fallback?: React.ReactNode
  src?: string
}

function SelectItemAvatar({
  alt = "",
  className,
  fallback,
  src,
  ...props
}: SelectItemAvatarProps) {
  return (
    <span
      data-slot="select-item-avatar"
      className={cn(
        "relative flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center overflow-hidden rounded-[var(--bh-radius-full)] border border-[var(--bh-border-subtle)] bg-[var(--bh-bg-accent-blue-soft)] text-[length:var(--bh-select-avatar-font-size)] font-[var(--bh-font-weight-semibold)] leading-none text-[var(--bh-content-accent-blue-strong)]",
        className
      )}
      {...props}
    >
      {src ? (
        <img alt={alt} className="size-full object-cover" src={src} />
      ) : fallback ? (
        <span aria-hidden={alt ? undefined : "true"}>{fallback}</span>
      ) : null}
    </span>
  )
}

type SelectItemCompanyLogoProps = React.ComponentProps<"span">

function SelectItemCompanyLogo({
  className,
  ...props
}: SelectItemCompanyLogoProps) {
  return (
    <span
      data-slot="select-item-company"
      className={cn(
        "flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center rounded-[var(--bh-radius-full)] bg-[var(--bh-bg-accent-purple-soft)] text-[var(--bh-content-accent-purple-default)]",
        className
      )}
      {...props}
    >
      <ChartNoAxesCombinedIcon
        aria-hidden="true"
        className="size-[var(--bh-select-company-icon-size)]"
        focusable="false"
        strokeWidth="var(--bh-icon-stroke-220)"
      />
    </span>
  )
}

type SelectItemPaymentIconProps = React.ComponentProps<"span">

function SelectItemPaymentIcon({
  className,
  ...props
}: SelectItemPaymentIconProps) {
  return (
    <span
      data-slot="select-item-payment"
      className={cn(
        "relative block h-[var(--bh-select-payment-height)] w-[var(--bh-select-payment-width)] shrink-0 rounded-[var(--bh-select-payment-radius)] border border-[var(--bh-border-subtle)] bg-[var(--bh-bg-always-white)]",
        className
      )}
      {...props}
    >
      <span className="absolute start-[var(--bh-select-payment-mark-offset)] top-1/2 size-[var(--bh-select-payment-mark-size)] -translate-y-1/2 rounded-[var(--bh-radius-full)] bg-[var(--bh-bg-accent-red-default)]" />
      <span className="absolute end-[var(--bh-select-payment-mark-offset)] top-1/2 size-[var(--bh-select-payment-mark-size)] -translate-y-1/2 rounded-[var(--bh-radius-full)] bg-[var(--bh-bg-accent-blue-default)] mix-blend-multiply" />
    </span>
  )
}

type SelectItemStatusDotProps = React.ComponentProps<"span"> &
  VariantProps<typeof selectStatusDot>

function SelectItemStatusDot({
  className,
  tone,
  ...props
}: SelectItemStatusDotProps) {
  return (
    <span
      data-slot="select-item-dot-wrap"
      className="flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center p-[var(--bh-space-xxxs-1)]"
      {...props}
    >
      <span
        data-slot="select-item-dot"
        className={cn(selectStatusDot({ tone }), className)}
      />
    </span>
  )
}

const defaultSelectItemMedia: Partial<Record<SelectItemType, () => React.ReactNode>> = {
  avatar: () => <SelectItemAvatar />,
  company: () => <SelectItemCompanyLogo />,
  dot: () => <SelectItemStatusDot />,
  icon: () => <SelectIcon name="plus" />,
  payment: () => <SelectItemPaymentIcon />,
}

function getDefaultSelectItemMedia(itemType: SelectItemType) {
  return defaultSelectItemMedia[itemType]?.() ?? null
}

function SelectIcon({
  className,
  name,
}: {
  className?: string
  name: SelectIconName
}) {
  const iconClassName = cn("size-[var(--bh-select-icon-size)]", className)
  const iconProps = {
    "aria-hidden": true,
    className: iconClassName,
    focusable: false,
    strokeWidth: "var(--bh-icon-stroke-200)",
  } as const

  if (name === "user") {
    return <UserIcon {...iconProps} />
  }

  if (name === "info") {
    return <InfoIcon {...iconProps} />
  }

  if (name === "error") {
    return <AlertCircleIcon {...iconProps} />
  }

  if (name === "chevron-down") {
    return <ChevronDownIcon {...iconProps} />
  }

  if (name === "plus") {
    return <PlusIcon {...iconProps} />
  }

  if (name === "check-fill" || name === "check-line") {
    return <CheckIcon {...iconProps} />
  }

  return null
}

export {
  getDefaultSelectItemMedia,
  SelectIcon,
  SelectItemAvatar,
  SelectItemCompanyLogo,
  SelectItemPaymentIcon,
  SelectItemStatusDot,
}
export type { SelectIconName, SelectItemType, SelectStatusTone }
