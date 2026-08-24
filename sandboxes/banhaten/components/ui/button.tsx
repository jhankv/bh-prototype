import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type ControlDensity = "compact" | "default" | "comfortable"

const buttonVariants = cva(
  "group/button inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-[var(--bh-control-default)] text-[length:var(--bh-text-button-font-size)] font-[var(--bh-text-button-font-weight)] leading-[var(--bh-text-button-line-height)] tracking-[var(--bh-text-button-letter-spacing)] outline-none transition-[background-color,border-color,color,box-shadow] focus-visible:shadow-[var(--shadow-button-focus)] disabled:pointer-events-none disabled:shadow-none aria-invalid:border-[length:var(--bh-border-width-default)] aria-invalid:border-[var(--bh-border-danger-strong)] aria-invalid:shadow-[var(--shadow-button-danger-focus)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--bh-button-icon-size)] [&_svg:not([class*='size-'])]:m-[calc((var(--bh-button-icon-slot-size)-var(--bh-button-icon-size))/2)] [&_svg[data-icon='inline-start']]:ms-[calc(var(--bh-button-icon-offset)+(var(--bh-button-icon-slot-size)-var(--bh-button-icon-size))/2)] [&_svg[data-icon='inline-end']]:me-[calc(var(--bh-button-icon-offset)+(var(--bh-button-icon-slot-size)-var(--bh-button-icon-size))/2)] rtl:[&_svg[data-rtl-flip='true']]:-scale-x-100",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bh-interactive-brand-default)] text-[var(--bh-content-on-brand)] shadow-[var(--shadow-button-raised)] hover:bg-[var(--bh-interactive-brand-hover)] active:bg-[var(--bh-interactive-brand-pressed)] disabled:bg-[var(--bh-interactive-brand-disabled)] disabled:text-[var(--bh-content-disabled)]",
        danger:
          "bg-[var(--bh-interactive-danger-default)] text-[var(--bh-content-on-color)] shadow-[var(--shadow-button-raised)] hover:bg-[var(--bh-interactive-danger-hover)] active:bg-[var(--bh-interactive-danger-pressed)] focus-visible:shadow-[var(--shadow-button-danger-focus)] disabled:bg-[var(--bh-interactive-danger-disabled)] disabled:text-[var(--bh-content-disabled)]",
        destructive:
          "bg-[var(--bh-interactive-danger-default)] text-[var(--bh-content-on-color)] shadow-[var(--shadow-button-raised)] hover:bg-[var(--bh-interactive-danger-hover)] active:bg-[var(--bh-interactive-danger-pressed)] focus-visible:shadow-[var(--shadow-button-danger-focus)] disabled:bg-[var(--bh-interactive-danger-disabled)] disabled:text-[var(--bh-content-disabled)]",
        success:
          "bg-[var(--bh-interactive-success-default)] text-[var(--bh-content-on-success)] shadow-[var(--shadow-button-raised)] hover:bg-[var(--bh-interactive-success-hover)] active:bg-[var(--bh-interactive-success-pressed)] disabled:bg-[var(--bh-interactive-brand-disabled)] disabled:text-[var(--bh-content-disabled)]",
        warning:
          "bg-[var(--bh-interactive-warning-default)] text-[var(--bh-content-on-warning)] shadow-[var(--shadow-button-raised)] hover:bg-[var(--bh-interactive-warning-hover)] active:bg-[var(--bh-interactive-warning-pressed)] disabled:bg-[var(--bh-interactive-brand-disabled)] disabled:text-[var(--bh-content-disabled)]",
        secondary:
          "bg-[var(--bh-interactive-secondary-default)] text-[var(--bh-content-default)] shadow-[var(--shadow-button-secondary)] [--bh-button-secondary-border:var(--bh-border-default)] hover:bg-[var(--bh-interactive-secondary-hover)] active:bg-[var(--bh-interactive-secondary-pressed)] focus-visible:[--bh-button-secondary-focus-border:var(--bh-border-brand-strong)] focus-visible:shadow-[var(--shadow-button-secondary-focus)] disabled:border-[length:var(--bh-border-width-default)] disabled:border-[var(--bh-border-disabled)] disabled:bg-[var(--bh-interactive-secondary-disabled)] disabled:text-[var(--bh-content-disabled)]",
        soft:
          "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-interactive-soft-default)] text-[var(--bh-content-default)] shadow-[var(--shadow-button-soft)] hover:bg-[var(--bh-interactive-soft-hover)] active:bg-[var(--bh-interactive-soft-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:bg-[var(--bh-interactive-soft-disabled)] disabled:text-[var(--bh-content-disabled)]",
        outline:
          "border-[length:var(--bh-border-width-default)] border-[var(--bh-border-default)] bg-[var(--bh-interactive-outlined-default)] text-[var(--bh-content-default)] hover:bg-[var(--bh-interactive-outlined-hover)] active:bg-[var(--bh-interactive-outlined-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:border-[var(--bh-border-disabled)] disabled:bg-[var(--bh-interactive-outlined-disabled)] disabled:text-[var(--bh-content-disabled)]",
        ghost:
          "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-interactive-ghost-default)] text-[var(--bh-content-default)] hover:bg-[var(--bh-interactive-ghost-hover)] active:bg-[var(--bh-interactive-ghost-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:bg-[var(--bh-interactive-ghost-disabled)] disabled:text-[var(--bh-content-disabled)]",
        "ghost-primary":
          "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-interactive-ghost-default)] text-[var(--bh-content-brand-default)] hover:bg-[var(--bh-interactive-ghost-hover)] active:bg-[var(--bh-interactive-ghost-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:bg-[var(--bh-interactive-ghost-disabled)] disabled:text-[var(--bh-content-disabled)]",
        white:
          "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-bg-always-white)] text-[var(--bh-content-on-light)] focus-visible:border-[var(--bh-border-focus)] disabled:opacity-[var(--bh-opacity-30)]",
        "soft-danger":
          "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-interactive-danger-soft-default)] text-[var(--bh-content-danger-default)] hover:bg-[var(--bh-interactive-danger-soft-hover)] active:bg-[var(--bh-interactive-danger-soft-pressed)] focus-visible:border-[var(--bh-interactive-danger-default)] focus-visible:shadow-[var(--shadow-button-danger-focus)] disabled:bg-[var(--bh-interactive-danger-soft-disabled)] disabled:text-[var(--bh-content-disabled)]",
        "soft-destructive":
          "border-[length:var(--bh-border-width-default)] border-transparent bg-[var(--bh-interactive-danger-soft-default)] text-[var(--bh-content-danger-default)] hover:bg-[var(--bh-interactive-danger-soft-hover)] active:bg-[var(--bh-interactive-danger-soft-pressed)] focus-visible:border-[var(--bh-interactive-danger-default)] focus-visible:shadow-[var(--shadow-button-danger-focus)] disabled:bg-[var(--bh-interactive-danger-soft-disabled)] disabled:text-[var(--bh-content-disabled)]",
        link: "bg-[var(--bh-interactive-ghost-default)] text-[var(--bh-content-brand-default)] hover:bg-[var(--bh-interactive-ghost-hover)] active:bg-[var(--bh-interactive-ghost-pressed)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:text-[var(--bh-content-disabled)]",
      },
      size: {
        xs: "h-[var(--bh-button-xs-height)] gap-[var(--bh-button-gap-xs)] px-[var(--bh-button-xs-padding-x)] py-[var(--bh-button-sm-padding-y)] has-[>svg]:px-[var(--bh-button-xs-padding-x)]",
        sm: "h-[var(--bh-button-sm-height)] gap-[var(--bh-button-gap)] px-[var(--bh-button-sm-padding-x)] py-[var(--bh-button-sm-padding-y)] has-[>svg]:px-[var(--bh-button-sm-padding-x)]",
        default: "h-[var(--bh-button-md-height)] gap-[var(--bh-button-gap)] px-[var(--bh-button-md-padding-x)] py-[var(--bh-button-sm-padding-y)] has-[>svg]:px-[var(--bh-button-md-padding-x)]",
        lg: "h-[var(--bh-button-lg-height)] gap-[var(--bh-button-gap)] px-[var(--bh-button-lg-padding-x)] py-[var(--bh-button-lg-padding-y)] has-[>svg]:px-[var(--bh-button-lg-padding-x)]",
        xl: "h-[var(--bh-button-xl-height)] gap-[var(--bh-button-gap)] px-[var(--bh-button-lg-padding-x)] py-[var(--bh-button-xl-padding-y)] has-[>svg]:px-[var(--bh-button-lg-padding-x)]",
        "icon-xs": "size-[var(--bh-button-xs-height)] gap-[var(--bh-space-none)] p-[var(--bh-space-none)]",
        "icon-sm": "size-[var(--bh-button-sm-height)] gap-[var(--bh-space-none)] p-[var(--bh-space-none)]",
        icon: "size-[var(--bh-button-md-height)] gap-[var(--bh-space-none)] p-[var(--bh-space-none)]",
        "icon-lg": "size-[var(--bh-button-lg-height)] gap-[var(--bh-space-none)] p-[var(--bh-space-none)]",
        "icon-xl": "size-[var(--bh-button-xl-height)] gap-[var(--bh-space-none)] p-[var(--bh-space-none)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    density?: ControlDensity
  }

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  className,
  variant,
  size,
  density,
  asChild = false,
  children,
  ...props
}, ref) {
  const Comp = asChild ? Slot : "button"
  const resolvedSize = resolveButtonSize(density, size)

  return (
    <Comp
      data-density={density}
      data-size={resolvedSize}
      data-slot="button"
      ref={ref}
      className={cn(buttonVariants({ variant, size: resolvedSize, className }))}
      {...props}
    >
      {asChild ? children : <ButtonChildren>{children}</ButtonChildren>}
    </Comp>
  )
})

function ButtonChildren({ children }: { children: React.ReactNode }) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <span data-slot="button-label" dir="auto" className="min-w-0 px-[var(--bh-button-label-padding-x)]">
          {child}
        </span>
      )
    }

    return child
  })
}

function resolveButtonSize(
  density: ControlDensity | undefined,
  size: ButtonSize | null | undefined
): ButtonSize | null | undefined {
  if (!density) return size

  const iconOnly = size?.startsWith("icon") ?? false
  if (density === "compact") return iconOnly ? "icon-xs" : "xs"
  if (density === "default") return iconOnly ? "icon-sm" : "sm"
  return iconOnly ? "icon" : "default"
}

export { Button, buttonVariants }
export type { ButtonProps, ControlDensity }
