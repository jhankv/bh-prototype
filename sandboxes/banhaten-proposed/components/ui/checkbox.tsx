"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type CheckboxCheckedState = NonNullable<
  React.ComponentProps<typeof CheckboxPrimitive.Root>["checked"]
>
type CheckboxCardControlPosition = "start" | "end"

const checkboxVariants = cva(
  "peer group/checkbox relative size-[var(--bh-checkbox-root-size)] shrink-0 rounded-[var(--bh-checkbox-control-radius)] outline-none transition-[box-shadow] focus-visible:[&>[data-slot=checkbox-control]]:shadow-[var(--shadow-checkbox-focus)] disabled:pointer-events-none data-[disabled]:pointer-events-none data-[state=checked]:hover:[&>[data-slot=checkbox-control]]:bg-[var(--bh-interactive-checkbox-hover)] data-[state=indeterminate]:hover:[&>[data-slot=checkbox-control]]:bg-[var(--bh-interactive-checkbox-hover)]"
)

const checkboxCardVariants = cva(
  "group/checkbox-card relative flex w-[var(--bh-checkbox-card-width)] max-w-full overflow-hidden rounded-[var(--bh-checkbox-card-radius)] bg-[var(--bh-bg-raised)] p-[var(--bh-checkbox-card-padding)] text-start shadow-[var(--shadow-checkbox-card)] outline-none transition-[background-color,box-shadow] [--bh-checkbox-card-border:var(--bh-border-subtle)] [--bh-checkbox-card-border-width-current:var(--bh-checkbox-card-border-width)] [--shadow-checkbox-card:inset_0px_0px_0px_var(--bh-checkbox-card-border-width-current,var(--bh-border-width-default))_var(--bh-checkbox-card-border,var(--bh-border-subtle)),var(--shadow-component-default)] hover:bg-[var(--bh-bg-raised-hover)] focus-visible:shadow-[var(--shadow-checkbox-card-focus)] data-[checked=true]:bg-[var(--bh-bg-raised)] data-[checked=true]:[--bh-checkbox-card-border:var(--bh-border-brand-strong)] data-[checked=true]:[--bh-checkbox-card-border-width-current:var(--bh-checkbox-card-border-width-active)] disabled:pointer-events-none disabled:bg-[var(--bh-bg-disabled)] disabled:shadow-[inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-border-disabled)] data-[disabled=true]:pointer-events-none data-[disabled=true]:bg-[var(--bh-bg-disabled)] data-[disabled=true]:shadow-[inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-border-disabled)]",
  {
    variants: {
      controlPosition: {
        start: "gap-[var(--bh-checkbox-card-label-gap)]",
        end: "gap-[var(--bh-checkbox-card-gap)]",
      },
      density: {
        default: "items-start",
        compact: "items-center",
      },
    },
    defaultVariants: {
      controlPosition: "end",
      density: "default",
    },
  }
)

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants>

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      ref={ref}
      className={cn(checkboxVariants({ className }))}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="checkbox-control"
        className="pointer-events-none absolute top-1/2 left-1/2 size-[var(--bh-checkbox-control-size)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--bh-checkbox-control-radius)] bg-[var(--bh-bg-default)] shadow-[var(--shadow-checkbox-control)] transition-[background-color,box-shadow] [--bh-checkbox-control-border:var(--bh-border-input)] [--shadow-checkbox-control:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-checkbox-control-border,var(--bh-border-input)),var(--shadow-component-default)] group-data-[state=checked]/checkbox:[--bh-checkbox-control-border:transparent] group-data-[state=checked]/checkbox:bg-[var(--bh-interactive-checkbox-default)] group-data-[state=indeterminate]/checkbox:[--bh-checkbox-control-border:transparent] group-data-[state=indeterminate]/checkbox:bg-[var(--bh-interactive-checkbox-default)] group-data-[disabled]/checkbox:bg-[var(--bh-bg-disabled)] group-data-[disabled]/checkbox:shadow-[inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-border-disabled)]"
      />
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="pointer-events-none absolute top-1/2 left-1/2 flex size-[var(--bh-checkbox-icon-size)] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[var(--bh-content-on-color)] group-data-[disabled]/checkbox:text-[var(--bh-content-disabled)]"
      >
        <CheckIcon
          aria-hidden="true"
          className="size-[var(--bh-checkbox-icon-size)] group-data-[state=indeterminate]/checkbox:hidden"
          focusable="false"
          strokeWidth="var(--bh-icon-stroke-300)"
        />
        <MinusIcon
          aria-hidden="true"
          className="hidden size-[var(--bh-checkbox-icon-size)] group-data-[state=indeterminate]/checkbox:block"
          focusable="false"
          strokeWidth="var(--bh-icon-stroke-300)"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

type CheckboxCardProps = Omit<React.ComponentProps<"button">, "children"> &
  VariantProps<typeof checkboxCardVariants> & {
    checked?: CheckboxCheckedState
    controlPosition?: CheckboxCardControlPosition
    defaultChecked?: boolean
    description?: React.ReactNode
    label: React.ReactNode
    media?: React.ReactNode
    onCheckedChange?: (checked: boolean) => void
  }

const CheckboxCard = React.forwardRef<HTMLButtonElement, CheckboxCardProps>(function CheckboxCard({
  className,
  checked,
  controlPosition = "end",
  defaultChecked = false,
  description,
  disabled,
  label,
  media,
  onCheckedChange,
  onClick,
  type = "button",
  ...props
}, ref) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked)
  const checkedState = checked ?? uncontrolledChecked
  const isControlled = checked !== undefined
  const isChecked = checkedState === true || checkedState === "indeterminate"
  const isDisabled = disabled
  const state = isChecked ? "selected" : "default"
  const density = description || media ? "default" : "compact"
  const control = (
    <CheckboxCardIndicator checked={isChecked} disabled={isDisabled} />
  )
  const content = (
    <CheckboxCardContent description={description} label={label} media={media} />
  )

  return (
    <button
      aria-checked={checkedState === "indeterminate" ? "mixed" : isChecked}
      data-checked={isChecked ? "true" : "false"}
      data-disabled={isDisabled ? "true" : undefined}
      data-slot="checkbox-card"
      data-state={state}
      disabled={isDisabled}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || isDisabled) return

        const nextChecked = !isChecked
        if (!isControlled) setUncontrolledChecked(nextChecked)
        onCheckedChange?.(nextChecked)
      }}
      role="checkbox"
      ref={ref}
      type={type}
      className={cn(
        checkboxCardVariants({ controlPosition, density }),
        className
      )}
      {...props}
    >
      {controlPosition === "start" ? (
        <>
          {control}
          {content}
        </>
      ) : (
        <>
          {content}
          {control}
        </>
      )}
    </button>
  )
})

function CheckboxCardContent({
  description,
  label,
  media,
}: {
  description?: React.ReactNode
  label: React.ReactNode
  media?: React.ReactNode
}) {
  const text = (
    <span
      data-slot="checkbox-card-text"
      className="relative flex min-w-0 flex-1 flex-col items-start gap-[var(--bh-checkbox-card-text-gap)] [word-break:break-word]"
    >
      <span
        data-slot="checkbox-card-label"
        dir="auto"
        className="w-full text-[length:var(--bh-text-body-md-medium-font-size)] leading-[var(--bh-text-body-md-medium-line-height)] font-[var(--bh-text-body-md-medium-font-weight)] tracking-[var(--bh-text-body-md-medium-letter-spacing)] text-[var(--bh-content-default)] group-data-[disabled=true]/checkbox-card:text-[var(--bh-content-disabled)]"
      >
        {label}
      </span>
      {description ? (
        <span
          data-slot="checkbox-card-description"
          dir="auto"
          className="w-full text-[length:var(--bh-text-body-sm-regular-font-size)] leading-[var(--bh-text-body-sm-regular-line-height)] font-[var(--bh-text-body-sm-regular-font-weight)] tracking-[var(--bh-text-body-sm-regular-letter-spacing)] text-[var(--bh-content-subtle)] group-data-[disabled=true]/checkbox-card:text-[var(--bh-content-disabled)]"
        >
          {description}
        </span>
      ) : null}
    </span>
  )

  if (!media) return text

  return (
    <span
      data-slot="checkbox-card-content"
      className="relative flex min-w-0 flex-1 items-start gap-[var(--bh-checkbox-card-content-gap)]"
    >
      <span
        data-slot="checkbox-card-media"
        className="shrink-0 text-[var(--bh-content-subtle)] group-data-[disabled=true]/checkbox-card:text-[var(--bh-content-disabled)] group-data-[disabled=true]/checkbox-card:opacity-[var(--bh-opacity-60)] [&_svg:not([class*='size-'])]:size-[var(--bh-checkbox-card-media-icon-size)]"
      >
        {media}
      </span>
      {text}
    </span>
  )
}

function CheckboxCardIndicator({
  checked,
  disabled,
}: {
  checked: boolean
  disabled?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      data-slot="checkbox-card-indicator"
      className="relative size-[var(--bh-checkbox-root-size)] shrink-0"
    >
      <span
        data-disabled={disabled ? "true" : undefined}
        data-slot="checkbox-control"
        data-state={checked ? "checked" : "unchecked"}
        className="pointer-events-none absolute top-1/2 left-1/2 size-[var(--bh-checkbox-control-size)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--bh-checkbox-control-radius)] bg-[var(--bh-bg-default)] shadow-[var(--shadow-checkbox-control)] [--bh-checkbox-control-border:var(--bh-border-input)] [--shadow-checkbox-control:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-checkbox-control-border,var(--bh-border-input)),var(--shadow-component-default)] data-[state=checked]:[--bh-checkbox-control-border:transparent] data-[state=checked]:bg-[var(--bh-interactive-checkbox-default)] data-[disabled=true]:bg-[var(--bh-bg-disabled)] data-[disabled=true]:shadow-[inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-border-disabled)]"
      />
      {checked ? (
        <CheckIcon
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[var(--bh-checkbox-icon-size)] -translate-x-1/2 -translate-y-1/2 text-[var(--bh-content-on-color)]"
          focusable="false"
          strokeWidth="var(--bh-icon-stroke-300)"
        />
      ) : null}
    </span>
  )
}

export { Checkbox, CheckboxCard, checkboxCardVariants, checkboxVariants }
export type {
  CheckboxCardControlPosition,
  CheckboxCardProps,
  CheckboxCheckedState,
  CheckboxProps,
}
