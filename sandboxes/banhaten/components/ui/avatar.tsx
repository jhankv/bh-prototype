"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import {
  BadgeCheckIcon,
  BanIcon,
  PencilIcon,
  PlusIcon,
  UserIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const avatarSizeVariants = {
  "2xs":
    "[--bh-avatar-size:var(--bh-avatar-size-2xs)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-2xs)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-2xs)]",
  xs: "[--bh-avatar-size:var(--bh-avatar-size-xs)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-xs)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-xs)]",
  sm: "[--bh-avatar-size:var(--bh-avatar-size-sm)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-sm)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-sm)]",
  md: "[--bh-avatar-size:var(--bh-avatar-size-md)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-md)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-md)]",
  lg: "[--bh-avatar-size:var(--bh-avatar-size-lg)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-lg)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-lg)]",
  default:
    "[--bh-avatar-size:var(--bh-avatar-size-xl)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-xl)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-xl)]",
  xl: "[--bh-avatar-size:var(--bh-avatar-size-xl)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-xl)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-xl)]",
  "2xl":
    "[--bh-avatar-size:var(--bh-avatar-size-2xl)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-2xl)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-2xl)]",
  "3xl":
    "[--bh-avatar-size:var(--bh-avatar-size-3xl)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-3xl)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-3xl)]",
  "4xl":
    "[--bh-avatar-size:var(--bh-avatar-size-4xl)] [--bh-avatar-fallback-size:var(--bh-avatar-fallback-font-size-4xl)] [--bh-avatar-icon-size:var(--bh-avatar-icon-size-4xl)]",
} as const

const avatarVariants = cva(
  "relative flex size-[var(--bh-avatar-size)] shrink-0 items-center justify-center overflow-visible rounded-[var(--bh-avatar-radius)] [--bh-avatar-radius:var(--bh-radius-full)]",
  {
    variants: {
      size: avatarSizeVariants,
      shape: {
        circular: "[--bh-avatar-radius:var(--bh-radius-full)]",
        rounded: "[--bh-avatar-radius:var(--bh-radius-lg-8)]",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circular",
    },
  }
)

const avatarFallbackVariants = cva(
  "flex size-full items-center justify-center rounded-[var(--bh-avatar-radius,var(--bh-radius-full))] bg-[var(--bh-bg-neutral-subtle)] text-[length:var(--bh-avatar-fallback-size,var(--bh-text-body-sm-medium-font-size))] font-[var(--bh-font-weight-semibold)] leading-none text-[var(--bh-content-default)] whitespace-nowrap",
  {
    variants: {
      size: avatarSizeVariants,
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const avatarIconVariants = cva(
  "flex size-full items-center justify-center rounded-[var(--bh-avatar-radius,var(--bh-radius-full))] bg-[var(--bh-bg-neutral-subtle)] text-[var(--bh-content-default)]",
  {
    variants: {
      size: avatarSizeVariants,
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const avatarStatusVariants = cva(
  "absolute end-0 bottom-0 flex size-[var(--bh-avatar-status-size)] items-center justify-center rounded-[var(--bh-radius-full)] border-[var(--bh-avatar-status-ring)] border-[var(--bh-bg-default)] shadow-[var(--shadow-avatar-badge)]",
  {
    variants: {
      size: {
        tiny:
          "[--bh-avatar-status-size:var(--bh-avatar-status-size-tiny)] [--bh-avatar-status-ring:var(--bh-avatar-status-ring-thin)]",
        xsmall:
          "[--bh-avatar-status-size:var(--bh-avatar-status-size-xsmall)] [--bh-avatar-status-ring:var(--bh-avatar-status-ring-thin)]",
        small:
          "[--bh-avatar-status-size:var(--bh-avatar-status-size-small)] [--bh-avatar-status-ring:var(--bh-avatar-status-ring-default)]",
        medium:
          "[--bh-avatar-status-size:var(--bh-avatar-status-size-medium)] [--bh-avatar-status-ring:var(--bh-avatar-status-ring-default)]",
        large:
          "[--bh-avatar-status-size:var(--bh-avatar-status-size-large)] [--bh-avatar-status-ring:var(--bh-avatar-status-ring-default)]",
        xlarge:
          "[--bh-avatar-status-size:var(--bh-avatar-status-size-xlarge)] [--bh-avatar-status-ring:var(--bh-avatar-status-ring-default)]",
      },
      status: {
        offline: "bg-[var(--bh-bg-neutral-medium)]",
        busy: "bg-[var(--bh-bg-accent-red-default)]",
        blocked:
          "bg-[var(--bh-bg-default)] text-[var(--bh-bg-accent-red-default)] ring-[var(--bh-border-width-default)] ring-inset ring-[var(--bh-bg-accent-red-default)]",
        available: "bg-[var(--bh-bg-success-default)]",
        away: "bg-[var(--bh-bg-accent-golden-default)]",
      },
    },
    defaultVariants: {
      size: "medium",
      status: "available",
    },
  }
)

const avatarActionVariants = cva(
  "absolute end-0 top-0 flex size-[var(--bh-avatar-action-size)] translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-[var(--bh-radius-full)] text-[var(--bh-content-on-brand)] rtl:-translate-x-1/4",
  {
    variants: {
      size: {
        tiny:
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-tiny)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-tiny)]",
        xsmall:
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-xsmall)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-xsmall)]",
        small:
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-small)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-small)]",
        medium:
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-medium)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-medium)]",
        large:
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-large)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-large)]",
        xlarge:
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-xlarge)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-xlarge)]",
        "2xl":
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-2xl)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-2xl)]",
        "3xl":
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-3xl)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-3xl)]",
        "4xl":
          "[--bh-avatar-action-size:var(--bh-avatar-action-size-4xl)] [--bh-avatar-action-icon-size:var(--bh-avatar-action-icon-size-4xl)]",
      },
      type: {
        custom: "bg-[var(--bh-bg-neutral-default)]",
        edit: "bg-[var(--bh-interactive-brand-default)]",
        remove: "bg-[var(--bh-interactive-danger-default)]",
        verified:
          "border-0 bg-transparent p-0 text-[var(--bh-bg-accent-sky-base)] shadow-none",
      },
    },
    defaultVariants: {
      size: "medium",
      type: "custom",
    },
  }
)

function Avatar({
  "aria-label": ariaLabel,
  className,
  role,
  size,
  shape,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      aria-label={ariaLabel}
      data-slot="avatar"
      data-size={size ?? "default"}
      data-shape={shape ?? "circular"}
      role={role ?? (ariaLabel ? "img" : undefined)}
      className={cn(avatarVariants({ size, shape, className }))}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "size-full rounded-[var(--bh-avatar-radius,var(--bh-radius-full))] object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> &
  VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(avatarFallbackVariants({ size, className }))}
      {...props}
    />
  )
}

function AvatarIcon({
  className,
  children,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof avatarIconVariants>) {
  return (
    <span
      aria-hidden={props["aria-label"] ? undefined : true}
      data-slot="avatar-icon"
      className={cn(avatarIconVariants({ size, className }))}
      {...props}
    >
      {children ?? (
        <UserIcon
          aria-hidden="true"
          className="size-[var(--bh-avatar-icon-size)]"
          strokeWidth="var(--bh-icon-stroke-210)"
        />
      )}
    </span>
  )
}

function AvatarBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute end-0 bottom-0 flex size-[var(--bh-space-xl-12)] items-center justify-center rounded-[var(--bh-radius-full)] border-[var(--bh-space-xxs-2)] border-[var(--bh-bg-default)] bg-[var(--bh-interactive-brand-default)] text-[var(--bh-content-on-brand)] shadow-[var(--shadow-avatar-badge)]",
        className
      )}
      {...props}
    />
  )
}

function AvatarStatus({
  className,
  size,
  status,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof avatarStatusVariants>) {
  return (
    <span
      aria-hidden={props["aria-label"] ? undefined : true}
      data-slot="avatar-status"
      data-status={status ?? "available"}
      className={cn(avatarStatusVariants({ size, status, className }))}
      {...props}
    >
      {status === "blocked" ? (
        <BanIcon
          aria-hidden="true"
          className="size-full"
          strokeWidth="var(--bh-icon-stroke-240)"
        />
      ) : null}
    </span>
  )
}

function AvatarAction({
  className,
  children,
  size,
  type,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof avatarActionVariants>) {
  const resolvedType = type ?? "custom"

  return (
    <span
      aria-hidden={props["aria-label"] ? undefined : true}
      data-slot="avatar-action"
      data-type={resolvedType}
      className={cn(avatarActionVariants({ size, type, className }))}
      {...props}
    >
      {children ?? <AvatarActionIcon type={resolvedType} />}
    </span>
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "flex items-center [&_[data-slot=avatar]]:-ms-[var(--bh-space-md-8)] [&_[data-slot=avatar]]:ring-[var(--bh-space-xxs-2)] [&_[data-slot=avatar]]:ring-[var(--bh-bg-default)] [&_[data-slot=avatar]:first-child]:ms-[var(--bh-space-none)]",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  children,
  dir,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof avatarVariants>) {
  return (
    <span
      data-slot="avatar-group-count"
      className={cn(
        avatarVariants({ size }),
        "-ms-[var(--bh-space-md-8)] bg-[var(--bh-bg-neutral-subtle)] text-[length:var(--bh-avatar-fallback-size,var(--bh-text-body-sm-medium-font-size))] font-[var(--bh-font-weight-semibold)] leading-none text-[var(--bh-content-default)] ring-[var(--bh-space-xxs-2)] ring-[var(--bh-bg-default)]",
        className
      )}
      {...props}
    >
      <span dir={dir}>{children}</span>
    </span>
  )
}

function AvatarActionIcon({
  type,
}: {
  type: NonNullable<VariantProps<typeof avatarActionVariants>["type"]>
}) {
  if (type === "edit") {
    return (
      <PencilIcon
        aria-hidden="true"
        className="size-[var(--bh-avatar-action-icon-size)]"
        strokeWidth="var(--bh-icon-stroke-260)"
      />
    )
  }

  if (type === "remove") {
    return (
      <XIcon
        aria-hidden="true"
        className="size-[var(--bh-avatar-action-icon-size)]"
        strokeWidth="var(--bh-icon-stroke-280)"
      />
    )
  }

  if (type === "verified") {
    return (
      <BadgeCheckIcon
        aria-hidden="true"
        className="size-[var(--bh-avatar-action-size)] fill-current text-[var(--bh-bg-accent-sky-base)] [stroke:var(--bh-content-on-brand)]"
        strokeWidth="var(--bh-icon-stroke-240)"
      />
    )
  }

  return (
    <PlusIcon
      aria-hidden="true"
      className="size-[var(--bh-avatar-action-icon-size)]"
      strokeWidth="var(--bh-icon-stroke-260)"
    />
  )
}

export {
  Avatar,
  AvatarAction,
  AvatarImage,
  AvatarIcon,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  AvatarStatus,
  avatarActionVariants,
  avatarVariants,
  avatarStatusVariants,
}
