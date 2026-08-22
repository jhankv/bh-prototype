"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ToggleSize = "sm" | "md"
type ToggleFieldControlPosition = "start" | "end"

const toggleVariants = cva(
  [
    "peer group/toggle inline-flex shrink-0 items-center rounded-[var(--bh-radius-full)] bg-[var(--bh-interactive-switch-default)] p-[var(--bh-menu-switch-padding)] outline-none transition-[background-color,box-shadow]",
    "focus-visible:shadow-[var(--shadow-social-button-focus-ring)]",
    "disabled:pointer-events-none data-[disabled]:cursor-not-allowed",
    "data-[state=unchecked]:hover:bg-[var(--bh-interactive-switch-hover)]",
    "data-[state=checked]:bg-[var(--bh-interactive-switch-active)] data-[state=checked]:hover:bg-[var(--bh-interactive-switch-active-hover)]",
    "data-[disabled]:bg-[var(--bh-interactive-switch-disabled)] [&[data-disabled][data-state=checked]]:bg-[var(--bh-interactive-switch-active-disabled)]",
  ],
  {
    variants: {
      size: {
        sm: [
          "h-[var(--bh-menu-switch-height)] w-[var(--bh-menu-switch-width)]",
          "[--bh-toggle-handle-size:var(--bh-menu-switch-handle-size)] [--bh-toggle-offset:var(--bh-space-xl-12)]",
          "[&_[data-slot=toggle-icon]]:size-[var(--bh-toggle-icon-size-sm)]",
        ],
        md: [
          "h-[var(--bh-space-5xl-24)] w-[calc(var(--bh-menu-switch-width)+var(--bh-space-md-8))]",
          "[--bh-toggle-handle-size:calc(var(--bh-space-5xl-24)-var(--bh-space-sm-6))] [--bh-toggle-offset:var(--bh-space-3xl-16)]",
          "[&_[data-slot=toggle-icon]]:size-[var(--bh-toggle-icon-size-md)]",
        ],
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const toggleFieldVariants = cva(
  "group/toggle-field inline-flex min-w-0 max-w-full gap-[var(--bh-space-lg-10)] text-start",
  {
    variants: {
      density: {
        compact: "items-center",
        stacked: "items-start",
      },
      controlPosition: {
        start: "",
        end: "justify-between",
      },
    },
    defaultVariants: {
      controlPosition: "start",
      density: "compact",
    },
  }
)

type ToggleProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    showIcon?: boolean
  }

const Toggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  ToggleProps
>(function Toggle({ className, showIcon = false, size, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      data-slot="toggle"
      ref={ref}
      className={cn(toggleVariants({ size, className }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="toggle-thumb"
        className="pointer-events-none flex size-[var(--bh-toggle-handle-size)] translate-x-0 items-center justify-center rounded-[var(--bh-radius-full)] bg-[var(--bh-interactive-switch-handle)] text-[var(--bh-content-on-light)] shadow-[var(--shadow-md)] transition-[background-color,transform] group-data-[disabled]/toggle:bg-[var(--bh-interactive-switch-handle-disabled)] group-data-[state=checked]/toggle:translate-x-[var(--bh-toggle-offset)] rtl:group-data-[state=checked]/toggle:-translate-x-[var(--bh-toggle-offset)]"
      >
        {showIcon ? (
          <span
            aria-hidden="true"
            data-slot="toggle-icon"
            className="grid place-items-center"
          >
            <ToggleCheckIcon className="hidden size-full group-data-[state=checked]/toggle:block" />
            <ToggleCloseIcon className="block size-full group-data-[state=checked]/toggle:hidden" />
          </span>
        ) : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
})

type ToggleFieldProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children" | "defaultChecked" | "onChange"
> &
  Pick<
    ToggleProps,
    | "checked"
    | "defaultChecked"
    | "disabled"
    | "name"
    | "onCheckedChange"
    | "required"
    | "showIcon"
    | "size"
    | "value"
  > & {
    controlPosition?: ToggleFieldControlPosition
    description?: React.ReactNode
    label: React.ReactNode
    toggleClassName?: string
  }

const ToggleField = React.forwardRef<HTMLDivElement, ToggleFieldProps>(
  function ToggleField({
    checked,
    className,
    controlPosition = "start",
    defaultChecked,
    description,
    disabled,
    id,
    label,
    name,
    onCheckedChange,
    required,
    showIcon,
    size,
    toggleClassName,
    value,
    ...props
  }, ref) {
    const generatedId = React.useId()
    const toggleId = id ?? generatedId
    const labelId = `${toggleId}-label`
    const descriptionId = description ? `${toggleId}-description` : undefined
    const density = description ? "stacked" : "compact"
    const control = (
      <span
        data-slot="toggle-field-control"
        className={cn(
          "inline-flex shrink-0",
          description ? "pt-[var(--bh-space-xxs-2)]" : undefined
        )}
      >
        <Toggle
          aria-describedby={descriptionId}
          aria-labelledby={labelId}
          checked={checked}
          className={toggleClassName}
          defaultChecked={defaultChecked}
          disabled={disabled}
          id={toggleId}
          name={name}
          onCheckedChange={onCheckedChange}
          required={required}
          showIcon={showIcon}
          size={size}
          value={value}
        />
      </span>
    )
    const content = (
      <span
        data-slot="toggle-field-content"
        className="flex min-w-0 flex-1 flex-col items-start"
      >
        <label
          data-slot="toggle-field-label"
          dir="auto"
          htmlFor={toggleId}
          id={labelId}
          className={cn(
            "w-full min-w-0 cursor-pointer break-words text-[length:var(--bh-text-body-md-regular-font-size)] leading-[var(--bh-text-body-md-regular-line-height)] tracking-[var(--bh-text-body-md-regular-letter-spacing)] text-[var(--bh-content-default)] group-data-[disabled=true]/toggle-field:cursor-not-allowed group-data-[disabled=true]/toggle-field:text-[var(--bh-content-disabled)]",
            description
              ? "font-[var(--bh-text-body-md-medium-font-weight)]"
              : "font-[var(--bh-text-body-md-regular-font-weight)]"
          )}
        >
          {label}
        </label>
        {description ? (
          <span
            data-slot="toggle-field-description"
            dir="auto"
            id={descriptionId}
            className="w-full min-w-0 break-words text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)] text-[var(--bh-content-subtle)]"
          >
            {description}
          </span>
        ) : null}
      </span>
    )

    return (
      <div
        data-disabled={disabled ? "true" : undefined}
        data-slot="toggle-field"
        ref={ref}
        className={cn(
          toggleFieldVariants({ controlPosition, density }),
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
      </div>
    )
  }
)

function ToggleCheckIcon({ className }: { className?: string }) {
  return (
    <CheckIcon
      aria-hidden="true"
      className={className}
      focusable="false"
      strokeWidth="var(--bh-icon-stroke-250)"
    />
  )
}

function ToggleCloseIcon({ className }: { className?: string }) {
  return (
    <XIcon
      aria-hidden="true"
      className={className}
      focusable="false"
      strokeWidth="var(--bh-icon-stroke-250)"
    />
  )
}

export { Toggle, ToggleField, toggleFieldVariants, toggleVariants }
export type {
  ToggleFieldControlPosition,
  ToggleFieldProps,
  ToggleProps,
  ToggleSize,
}
