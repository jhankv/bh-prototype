import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { XIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type TooltipVariant = "dark" | "default"
type TooltipSize = "sm" | "lg"
type TooltipPointerPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "center-right"
  | "center-left"
  | "none"

const defaultTooltipLabel = "More information"
const defaultTooltipSupportText =
  "You may notice that we've made some updates to our look and feel."
// Radix sideOffset requires numbers; these mirror the tooltip spacing aliases.
const TOOLTIP_POINTER_SIDE_OFFSET_PX = 7
const TOOLTIP_POINTERLESS_SIDE_OFFSET_PX = 6
// Radix collisionPadding requires a number; this mirrors --bh-space-md-8.
const TOOLTIP_COLLISION_PADDING_PX = 8

const tooltipContentVariants = cva(
  [
    "z-[var(--bh-z-overlay)] overflow-visible bg-[var(--bh-tooltip-bg)] text-[var(--bh-tooltip-fg)] shadow-[var(--bh-tooltip-shadow)] outline-none",
    "font-[var(--bh-font-family)] tracking-[var(--bh-text-base-letter-spacing)]",
  ],
  {
    variants: {
      variant: {
        dark:
          "[--bh-tooltip-bg:var(--bh-bg-always-dark)] [--bh-tooltip-border:transparent] [--bh-tooltip-close-fg:var(--bh-content-on-color)] [--bh-tooltip-fg:var(--bh-content-on-color)] [--bh-tooltip-shadow:none] [--bh-tooltip-shortcut-bg:var(--bh-bg-neutral-soft)] [--bh-tooltip-shortcut-border:var(--bh-border-inverse-subtle)]",
        default:
          "[--bh-tooltip-bg:var(--bh-bg-raised)] [--bh-tooltip-border:var(--bh-border-subtle)] [--bh-tooltip-close-fg:var(--bh-content-subtle)] [--bh-tooltip-fg:var(--bh-content-default)] [--bh-tooltip-shadow:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-tooltip-border),var(--shadow-lg)] [--bh-tooltip-shortcut-bg:var(--bh-bg-neutral-subtle)] [--bh-tooltip-shortcut-border:var(--bh-border-subtle)]",
      },
      size: {
        sm:
          "inline-flex max-w-[var(--bh-tooltip-max-width)] items-center gap-[var(--bh-space-xs-4)] rounded-[var(--bh-tooltip-sm-radius)] px-[var(--bh-tooltip-sm-padding-x)] py-[var(--bh-tooltip-sm-padding-y)]",
        lg:
          "flex w-[var(--bh-tooltip-lg-width)] max-w-[var(--bh-tooltip-max-width)] items-start gap-[var(--bh-space-md-8)] rounded-[var(--bh-tooltip-lg-radius)] p-[var(--bh-tooltip-lg-padding)]",
      },
    },
    defaultVariants: {
      variant: "dark",
      size: "sm",
    },
  }
)

type TooltipContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
  "asChild"
> &
  VariantProps<typeof tooltipContentVariants> & {
    closeLabel?: string
    onCloseClick?: React.MouseEventHandler<HTMLButtonElement>
    pointerPosition?: TooltipPointerPosition
    shortcut?: React.ReactNode
    showCloseButton?: boolean
    showPointer?: boolean
    showShortcut?: boolean
    supportText?: React.ReactNode
  }

type TooltipShortcutProps = React.ComponentProps<"span">
type TooltipCloseButtonProps = React.ComponentProps<"button"> & {
  label?: string
}

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipPortal = TooltipPrimitive.Portal

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(function TooltipContent(
  {
    align,
    children,
    className,
    closeLabel,
    collisionPadding = TOOLTIP_COLLISION_PADDING_PX,
    onCloseClick,
    pointerPosition = "top-left",
    shortcut,
    showCloseButton,
    showPointer = true,
    showShortcut,
    side,
    sideOffset,
    size = "sm",
    supportText,
    variant = "dark",
    ...props
  },
  ref
) {
  const resolvedPointerPosition = pointerPosition ?? "top-left"
  const resolvedSize = (size ?? "sm") as TooltipSize
  const resolvedVariant = (variant ?? "dark") as TooltipVariant
  const placement = getTooltipPlacement(resolvedPointerPosition)
  const label = children ?? defaultTooltipLabel
  const renderedSupportText =
    supportText ??
    (children === undefined && resolvedSize === "lg"
      ? defaultTooltipSupportText
      : undefined)
  const shouldShowCloseButton = showCloseButton ?? resolvedSize === "lg"
  const shouldShowShortcut = showShortcut ?? resolvedSize === "sm"
  const shouldShowPointer =
    showPointer && resolvedPointerPosition !== "none"

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-pointer-position={resolvedPointerPosition}
        data-size={resolvedSize}
        data-slot="tooltip-content"
        data-variant={resolvedVariant}
        ref={ref}
        side={side ?? placement.side}
        align={align ?? placement.align}
        collisionPadding={collisionPadding}
        sideOffset={
          sideOffset ??
          (shouldShowPointer
            ? TOOLTIP_POINTER_SIDE_OFFSET_PX
            : TOOLTIP_POINTERLESS_SIDE_OFFSET_PX)
        }
        className={cn(
          tooltipContentVariants({
            variant: resolvedVariant,
            size: resolvedSize,
          }),
          className
        )}
        {...props}
      >
        {resolvedSize === "lg" ? (
          <TooltipLargeContent
            closeLabel={closeLabel}
            onCloseClick={onCloseClick}
            showCloseButton={shouldShowCloseButton}
            supportText={renderedSupportText}
          >
            {label}
          </TooltipLargeContent>
        ) : (
          <TooltipSmallContent
            shortcut={shortcut}
            showShortcut={shouldShowShortcut}
          >
            {label}
          </TooltipSmallContent>
        )}

        {shouldShowPointer ? (
          <TooltipPointer
            pointerPosition={resolvedPointerPosition}
            variant={resolvedVariant}
          />
        ) : null}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})

function TooltipSmallContent({
  children,
  shortcut,
  showShortcut,
}: {
  children: React.ReactNode
  shortcut?: React.ReactNode
  showShortcut: boolean
}) {
  return (
    <>
      <span
        data-slot="tooltip-label"
        dir="auto"
        className="min-w-0 whitespace-nowrap text-start text-[length:var(--bh-text-body-2xs-medium-font-size)] font-[var(--bh-text-body-2xs-medium-font-weight)] leading-[var(--bh-text-body-2xs-medium-line-height)] tracking-[var(--bh-text-body-2xs-medium-letter-spacing)]"
      >
        {children}
      </span>
      {showShortcut ? <TooltipShortcut>{shortcut ?? "/"}</TooltipShortcut> : null}
    </>
  )
}

function TooltipLargeContent({
  children,
  closeLabel,
  onCloseClick,
  showCloseButton,
  supportText,
}: {
  children: React.ReactNode
  closeLabel?: string
  onCloseClick?: React.MouseEventHandler<HTMLButtonElement>
  showCloseButton: boolean
  supportText?: React.ReactNode
}) {
  return (
    <>
      <span
        data-slot="tooltip-text"
        className="flex min-w-0 flex-1 flex-col items-start gap-[var(--bh-space-xs-4)] text-start rtl:items-end rtl:text-right"
      >
        <span
          data-slot="tooltip-label"
          dir="auto"
          className="w-full min-w-0 text-[length:var(--bh-text-body-sm-medium-font-size)] font-[var(--bh-text-body-sm-medium-font-weight)] leading-[var(--bh-text-body-sm-medium-line-height)] tracking-[var(--bh-text-body-sm-medium-letter-spacing)]"
        >
          {children}
        </span>
        {hasRenderableContent(supportText) ? (
          <span
            data-slot="tooltip-support-text"
            dir="auto"
            className="w-full min-w-0 text-[length:var(--bh-text-body-2xs-regular-font-size)] font-[var(--bh-text-body-2xs-regular-font-weight)] leading-[var(--bh-text-body-2xs-regular-line-height)] tracking-[var(--bh-text-body-2xs-regular-letter-spacing)]"
          >
            {supportText}
          </span>
        ) : null}
      </span>
      {showCloseButton ? (
        <TooltipCloseButton label={closeLabel} onClick={onCloseClick} />
      ) : null}
    </>
  )
}

function TooltipShortcut({
  children = "/",
  className,
  ...props
}: TooltipShortcutProps) {
  return (
    <span
      data-slot="tooltip-shortcut"
      className={cn(
        "flex h-[var(--bh-tooltip-shortcut-height)] min-w-[var(--bh-tooltip-shortcut-min-width)] shrink-0 items-center justify-center rounded-[var(--bh-radius-sm-4)] border border-[var(--bh-tooltip-shortcut-border)] bg-[var(--bh-tooltip-shortcut-bg)] px-[var(--bh-space-xs-4)] text-center text-[length:var(--bh-text-body-2xs-medium-font-size)] font-[var(--bh-text-body-2xs-medium-font-weight)] leading-[var(--bh-text-body-2xs-medium-line-height)] tracking-[var(--bh-text-body-2xs-medium-letter-spacing)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

function TooltipCloseButton({
  className,
  label = "Close tooltip",
  type,
  ...props
}: TooltipCloseButtonProps) {
  return (
    <button
      aria-label={label}
      data-slot="tooltip-close"
      type={type || "button"}
      className={cn(
        "inline-flex size-[var(--bh-tooltip-close-size)] shrink-0 items-center justify-center rounded-[var(--bh-radius-full)] border-0 bg-transparent p-0 text-[var(--bh-tooltip-close-fg)] outline-none transition-[background-color,box-shadow] hover:bg-[var(--bh-interactive-ghost-hover)] focus-visible:shadow-[var(--shadow-button-focus)]",
        className
      )}
      {...props}
    >
      <XIcon
        aria-hidden="true"
        className="size-[var(--bh-tooltip-close-icon-size)]"
        strokeWidth="var(--bh-icon-stroke-200)"
      />
    </button>
  )
}

function TooltipPointer({
  pointerPosition,
  variant,
}: {
  pointerPosition: TooltipPointerPosition
  variant: TooltipVariant
}) {
  const side = getPointerSide(pointerPosition)
  if (!side) return null

  return (
    <span
      aria-hidden="true"
      data-pointer-side={side}
      data-slot="tooltip-pointer"
      className={cn(
        "pointer-events-none absolute z-[var(--bh-z-raised)]",
        pointerPlacement[pointerPosition as Exclude<TooltipPointerPosition, "none">]
      )}
    >
      {variant === "default" ? (
        <span className={cn("absolute size-[var(--bh-space-none)]", pointerBorderShape[side])} />
      ) : null}
      <span className={cn("absolute size-[var(--bh-space-none)]", pointerFillShape[side])} />
    </span>
  )
}

function getTooltipPlacement(pointerPosition: TooltipPointerPosition): {
  align: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["align"]
  side: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["side"]
} {
  if (pointerPosition.startsWith("bottom")) {
    return {
      side: "top",
      align: pointerPosition.endsWith("left")
        ? "start"
        : pointerPosition.endsWith("right")
          ? "end"
          : "center",
    }
  }

  if (pointerPosition === "center-left") {
    return { side: "right", align: "center" }
  }

  if (pointerPosition === "center-right") {
    return { side: "left", align: "center" }
  }

  if (pointerPosition === "none") {
    return { side: "top", align: "center" }
  }

  return {
    side: "bottom",
    align: pointerPosition.endsWith("left")
      ? "start"
      : pointerPosition.endsWith("right")
        ? "end"
        : "center",
  }
}

function getPointerSide(pointerPosition: TooltipPointerPosition) {
  if (pointerPosition.startsWith("top")) return "top"
  if (pointerPosition.startsWith("bottom")) return "bottom"
  if (pointerPosition === "center-left") return "left"
  if (pointerPosition === "center-right") return "right"

  return null
}

function hasRenderableContent(content: React.ReactNode) {
  return (
    content !== undefined &&
    content !== null &&
    content !== false &&
    content !== ""
  )
}

const pointerPlacement: Record<Exclude<TooltipPointerPosition, "none">, string> = {
  "top-left":
    "top-[var(--bh-tooltip-pointer-offset)] h-[var(--bh-tooltip-pointer-depth)] w-[var(--bh-tooltip-pointer-width)] [inset-inline-start:var(--bh-tooltip-pointer-inline-offset)]",
  "top-center":
    "top-[var(--bh-tooltip-pointer-offset)] left-1/2 h-[var(--bh-tooltip-pointer-depth)] w-[var(--bh-tooltip-pointer-width)] -translate-x-1/2 rtl:translate-x-1/2",
  "top-right":
    "top-[var(--bh-tooltip-pointer-offset)] h-[var(--bh-tooltip-pointer-depth)] w-[var(--bh-tooltip-pointer-width)] [inset-inline-end:var(--bh-tooltip-pointer-inline-offset)]",
  "bottom-left":
    "bottom-[var(--bh-tooltip-pointer-offset)] h-[var(--bh-tooltip-pointer-depth)] w-[var(--bh-tooltip-pointer-width)] [inset-inline-start:var(--bh-tooltip-pointer-inline-offset)]",
  "bottom-center":
    "bottom-[var(--bh-tooltip-pointer-offset)] left-1/2 h-[var(--bh-tooltip-pointer-depth)] w-[var(--bh-tooltip-pointer-width)] -translate-x-1/2 rtl:translate-x-1/2",
  "bottom-right":
    "bottom-[var(--bh-tooltip-pointer-offset)] h-[var(--bh-tooltip-pointer-depth)] w-[var(--bh-tooltip-pointer-width)] [inset-inline-end:var(--bh-tooltip-pointer-inline-offset)]",
  "center-right":
    "right-[var(--bh-tooltip-pointer-offset)] top-1/2 h-[var(--bh-tooltip-pointer-width)] w-[var(--bh-tooltip-pointer-depth)] -translate-y-1/2",
  "center-left":
    "left-[var(--bh-tooltip-pointer-offset)] top-1/2 h-[var(--bh-tooltip-pointer-width)] w-[var(--bh-tooltip-pointer-depth)] -translate-y-1/2",
}

const pointerFillShape = {
  top:
    "left-0 top-[var(--bh-space-xxxs-1)] border-x-[length:var(--bh-tooltip-pointer-half-width)] border-b-[length:var(--bh-tooltip-pointer-depth)] border-x-[color:transparent] border-b-[color:var(--bh-tooltip-bg)]",
  bottom:
    "bottom-[var(--bh-space-xxxs-1)] left-0 border-x-[length:var(--bh-tooltip-pointer-half-width)] border-t-[length:var(--bh-tooltip-pointer-depth)] border-x-[color:transparent] border-t-[color:var(--bh-tooltip-bg)]",
  right:
    "left-[calc(var(--bh-space-xxxs-1)*-1)] top-0 border-y-[length:var(--bh-tooltip-pointer-half-width)] border-l-[length:var(--bh-tooltip-pointer-depth)] border-y-[color:transparent] border-l-[color:var(--bh-tooltip-bg)]",
  left:
    "right-[calc(var(--bh-space-xxxs-1)*-1)] top-0 border-y-[length:var(--bh-tooltip-pointer-half-width)] border-r-[length:var(--bh-tooltip-pointer-depth)] border-y-[color:transparent] border-r-[color:var(--bh-tooltip-bg)]",
} as const

const pointerBorderShape = {
  top:
    "left-[var(--bh-tooltip-pointer-border-offset)] top-[var(--bh-tooltip-pointer-border-offset)] border-x-[length:var(--bh-tooltip-pointer-border-half-width)] border-b-[length:var(--bh-tooltip-pointer-border-depth)] border-x-[color:transparent] border-b-[color:var(--bh-tooltip-border)]",
  bottom:
    "bottom-[var(--bh-tooltip-pointer-border-offset)] left-[var(--bh-tooltip-pointer-border-offset)] border-x-[length:var(--bh-tooltip-pointer-border-half-width)] border-t-[length:var(--bh-tooltip-pointer-border-depth)] border-x-[color:transparent] border-t-[color:var(--bh-tooltip-border)]",
  right:
    "top-[var(--bh-tooltip-pointer-border-offset)] left-0 border-y-[length:var(--bh-tooltip-pointer-border-half-width)] border-l-[length:var(--bh-tooltip-pointer-border-depth)] border-y-[color:transparent] border-l-[color:var(--bh-tooltip-border)]",
  left:
    "top-[var(--bh-tooltip-pointer-border-offset)] right-0 border-y-[length:var(--bh-tooltip-pointer-border-half-width)] border-r-[length:var(--bh-tooltip-pointer-border-depth)] border-y-[color:transparent] border-r-[color:var(--bh-tooltip-border)]",
} as const

export {
  Tooltip,
  TooltipCloseButton,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipShortcut,
  TooltipTrigger,
  tooltipContentVariants,
}
export type {
  TooltipCloseButtonProps,
  TooltipContentProps,
  TooltipPointerPosition,
  TooltipShortcutProps,
  TooltipSize,
  TooltipVariant,
}
