import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type ButtonGroupSize = "md" | "sm" | "xs"
type ButtonGroupMode = "default" | "iconOnly"
type ButtonGroupItemWidth = "fixed" | "content"
type ControlDensity = "compact" | "default" | "comfortable"
type ToggleGroupType = "single" | "multiple"
type ToggleGroupValue = string | string[]

type ButtonGroupContextValue = {
  itemWidth: ButtonGroupItemWidth
  size: ButtonGroupSize
  mode: ButtonGroupMode
}

const buttonGroupContext = React.createContext<ButtonGroupContextValue>({
  itemWidth: "fixed",
  size: "md",
  mode: "default",
})

type ToggleGroupContextValue = {
  disabled: boolean
  isPressed: (value: string) => boolean
  toggle: (value: string) => void
}

const toggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null)

const buttonGroupVariants = cva(
  "inline-flex w-fit max-w-full items-center overflow-x-auto overflow-y-hidden rounded-[var(--bh-button-group-radius)] bg-[var(--bh-button-group-bg)] text-[var(--bh-button-group-content)] shadow-[var(--shadow-button-group)] outline-none focus-visible:shadow-[var(--shadow-button-group-focus)] [--shadow-button-group:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-button-group-border),var(--shadow-component-default)]",
  {
    variants: {
      size: {
        md: "h-[var(--bh-button-group-md-height)]",
        sm: "h-[var(--bh-button-group-sm-height)]",
        xs: "h-[var(--bh-button-group-xs-height)]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const buttonGroupItemVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap bg-[var(--bh-button-group-item-bg)] text-[length:var(--bh-text-button-font-size)] font-[var(--bh-text-button-font-weight)] leading-[var(--bh-text-button-line-height)] tracking-[var(--bh-text-button-letter-spacing)] text-[var(--bh-button-group-content)] outline-none transition-[background-color,box-shadow,color] before:absolute before:inset-y-0 before:start-0 before:w-[var(--bh-border-width-default)] before:bg-[var(--bh-button-group-divider)] before:content-[''] first:before:hidden hover:bg-[var(--bh-button-group-item-hover-bg)] active:bg-[var(--bh-button-group-item-pressed-bg)] focus-visible:z-[var(--bh-z-raised)] focus-visible:shadow-[var(--shadow-button-group-focus)] aria-[pressed=true]:bg-[var(--bh-button-group-item-active-bg)] aria-[pressed=true]:text-[var(--bh-button-group-content-active)] data-[active=true]:bg-[var(--bh-button-group-item-active-bg)] data-[active=true]:text-[var(--bh-button-group-content-active)] disabled:pointer-events-none disabled:bg-[var(--bh-button-group-item-disabled-bg)] disabled:text-[var(--bh-button-group-content-disabled)] [&_svg]:pointer-events-none [&_svg]:size-[var(--bh-button-group-icon-size)] [&_svg]:shrink-0 rtl:[&_svg[data-rtl-flip='true']]:-scale-x-100",
  {
    variants: {
      size: {
        md: "h-[var(--bh-button-group-md-height)] gap-[var(--bh-button-group-md-gap)]",
        sm: "h-[var(--bh-button-group-sm-height)] gap-[var(--bh-button-group-sm-gap)]",
        xs: "h-[var(--bh-button-group-xs-height)] gap-[var(--bh-button-group-xs-gap)]",
      },
      mode: {
        default: "",
        iconOnly: "",
      },
      itemWidth: {
        fixed: "",
        content: "",
      },
    },
    compoundVariants: [
      {
        size: "md",
        mode: "default",
        itemWidth: "fixed",
        class:
          "w-[var(--bh-button-group-md-item-width)] px-[var(--bh-button-group-md-padding-x)] rtl:w-[var(--bh-button-group-md-item-rtl-width)]",
      },
      {
        size: "sm",
        mode: "default",
        itemWidth: "fixed",
        class:
          "w-[var(--bh-button-group-sm-item-width)] px-[var(--bh-button-group-sm-padding-x)] rtl:w-[var(--bh-button-group-sm-item-rtl-width)]",
      },
      {
        size: "xs",
        mode: "default",
        itemWidth: "fixed",
        class:
          "w-[var(--bh-button-group-xs-item-width)] px-[var(--bh-button-group-xs-padding-x)] rtl:w-[var(--bh-button-group-xs-item-rtl-width)]",
      },
      {
        size: "md",
        mode: "default",
        itemWidth: "content",
        class: "w-auto px-[var(--bh-button-group-md-padding-x)]",
      },
      {
        size: "sm",
        mode: "default",
        itemWidth: "content",
        class: "w-auto px-[var(--bh-button-group-sm-padding-x)]",
      },
      {
        size: "xs",
        mode: "default",
        itemWidth: "content",
        class: "w-auto px-[var(--bh-button-group-xs-padding-x)]",
      },
      {
        size: "md",
        mode: "iconOnly",
        class:
          "w-[var(--bh-button-group-md-height)] px-[var(--bh-button-group-md-icon-padding-x)]",
      },
      {
        size: "sm",
        mode: "iconOnly",
        class:
          "w-[var(--bh-button-group-sm-height)] px-[var(--bh-button-group-sm-icon-padding-x)]",
      },
      {
        size: "xs",
        mode: "iconOnly",
        class:
          "w-[var(--bh-button-group-xs-height)] px-[var(--bh-button-group-xs-icon-padding-x)]",
      },
    ],
    defaultVariants: {
      size: "md",
      mode: "default",
      itemWidth: "fixed",
    },
  }
)

const buttonGroupLabelVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap bg-[var(--bh-button-group-item-bg)] text-[length:var(--bh-text-button-font-size)] font-[var(--bh-text-button-font-weight)] leading-[var(--bh-text-button-line-height)] tracking-[var(--bh-text-button-letter-spacing)] text-[var(--bh-button-group-content)] before:absolute before:inset-y-0 before:start-0 before:w-[var(--bh-border-width-default)] before:bg-[var(--bh-button-group-divider)] before:content-[''] first:before:hidden",
  {
    variants: {
      size: {
        md: "h-[var(--bh-button-group-md-height)]",
        sm: "h-[var(--bh-button-group-sm-height)]",
        xs: "h-[var(--bh-button-group-xs-height)]",
      },
      itemWidth: {
        fixed: "",
        content: "",
      },
    },
    compoundVariants: [
      {
        size: "md",
        itemWidth: "fixed",
        class: "w-[var(--bh-button-group-md-item-width)] px-[var(--bh-button-group-md-padding-x)] rtl:w-[var(--bh-button-group-md-item-rtl-width)]",
      },
      {
        size: "sm",
        itemWidth: "fixed",
        class: "w-[var(--bh-button-group-sm-item-width)] px-[var(--bh-button-group-sm-padding-x)] rtl:w-[var(--bh-button-group-sm-item-rtl-width)]",
      },
      {
        size: "xs",
        itemWidth: "fixed",
        class: "w-[var(--bh-button-group-xs-item-width)] px-[var(--bh-button-group-xs-padding-x)] rtl:w-[var(--bh-button-group-xs-item-rtl-width)]",
      },
      {
        size: "md",
        itemWidth: "content",
        class: "w-auto px-[var(--bh-button-group-md-padding-x)]",
      },
      {
        size: "sm",
        itemWidth: "content",
        class: "w-auto px-[var(--bh-button-group-sm-padding-x)]",
      },
      {
        size: "xs",
        itemWidth: "content",
        class: "w-auto px-[var(--bh-button-group-xs-padding-x)]",
      },
    ],
    defaultVariants: {
      itemWidth: "content",
      size: "sm",
    },
  }
)

type ButtonGroupProps = React.ComponentProps<"div"> &
  VariantProps<typeof buttonGroupVariants> & {
    density?: ControlDensity
    itemWidth?: ButtonGroupItemWidth
    mode?: ButtonGroupMode
  }

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup({
  className,
  density,
  itemWidth = "fixed",
  size,
  mode = "default",
  children,
  role = "group",
  tabIndex = 0,
  ...props
}, ref) {
  const resolvedSize = resolveButtonGroupSize(density, size)
  const contextValue = React.useMemo(
    () => ({
      itemWidth,
      size: resolvedSize,
      mode: mode || "default",
    }),
    [itemWidth, mode, resolvedSize]
  )

  return (
    <buttonGroupContext.Provider value={contextValue}>
      <div
        data-mode={contextValue.mode}
        data-density={density}
        data-item-width={contextValue.itemWidth}
        data-size={contextValue.size}
        data-slot="button-group"
        ref={ref}
        role={role}
        tabIndex={tabIndex}
        className={cn(buttonGroupVariants({ size: contextValue.size }), className)}
        {...props}
      >
        {children}
      </div>
    </buttonGroupContext.Provider>
  )
})

type ButtonGroupItemProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonGroupItemVariants> & {
    asChild?: boolean
  }

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(function ButtonGroupItem({
  className,
  size,
  itemWidth,
  mode,
  asChild = false,
  children,
  type,
  "aria-label": ariaLabel,
  disabled,
  "aria-pressed": ariaPressed,
  onMouseDown,
  ...props
}, ref) {
  const context = React.useContext(buttonGroupContext)
  const selectedSize = (size || context.size) as ButtonGroupSize
  const selectedMode = mode || context.mode
  const selectedItemWidth = itemWidth || context.itemWidth
  const Comp = asChild ? Slot : "button"
  const accessibleLabel =
    selectedMode === "iconOnly" ? ariaLabel || getTextAlternative(children) : ariaLabel
  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseDown?.(event)

      if (!event.defaultPrevented) {
        event.preventDefault()
      }
    },
    [onMouseDown]
  )

  return (
    <Comp
      aria-label={accessibleLabel}
      aria-pressed={ariaPressed}
      data-mode={selectedMode}
      data-item-width={selectedItemWidth}
      data-size={selectedSize}
      data-slot="button-group-item"
      ref={ref}
      className={cn(
        buttonGroupItemVariants({
          size: selectedSize,
          mode: selectedMode,
          itemWidth: selectedItemWidth,
          className,
        })
      )}
      {...(!asChild ? { type: type || "button" } : {})}
      {...(!asChild ? { disabled } : {})}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {asChild ? children : (
        <ButtonGroupItemChildren mode={selectedMode}>{children}</ButtonGroupItemChildren>
      )}
    </Comp>
  )
})

type ButtonGroupLabelProps = React.ComponentProps<"span"> &
  VariantProps<typeof buttonGroupLabelVariants>

const ButtonGroupLabel = React.forwardRef<HTMLSpanElement, ButtonGroupLabelProps>(
  function ButtonGroupLabel(
    { "aria-hidden": ariaHidden = true, className, itemWidth, size, ...props },
    ref
  ) {
    const context = React.useContext(buttonGroupContext)
    const selectedSize = (size || context.size) as ButtonGroupSize
    const selectedItemWidth = itemWidth || context.itemWidth

    return (
      <span
        aria-hidden={ariaHidden}
        className={cn(
          buttonGroupLabelVariants({
            itemWidth: selectedItemWidth,
            size: selectedSize,
          }),
          className
        )}
        data-item-width={selectedItemWidth}
        data-size={selectedSize}
        data-slot="button-group-label"
        dir="auto"
        ref={ref}
        {...props}
      />
    )
  }
)

function ButtonGroupItemChildren({
  children,
  mode,
}: {
  children: React.ReactNode
  mode: ButtonGroupMode
}) {
  if (mode === "iconOnly") {
    return children
  }

  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <span
          data-slot="button-group-item-label"
          dir="auto"
          className="min-w-0 px-[var(--bh-button-group-label-padding-x)]"
        >
          {child}
        </span>
      )
    }

    return child
  })
}

function getTextAlternative(children: React.ReactNode) {
  let text = ""

  React.Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      text += child
      return
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
      text += getTextAlternative(child.props.children) || ""
    }
  })

  return text.trim() || undefined
}

function resolveButtonGroupSize(
  density: ControlDensity | undefined,
  size: ButtonGroupSize | null | undefined
): ButtonGroupSize {
  if (density === "compact") return "xs"
  if (density === "default") return "sm"
  if (density === "comfortable") return "md"
  return size ?? "md"
}

type ToggleGroupProps = Omit<ButtonGroupProps, "onChange"> & {
  defaultValue?: ToggleGroupValue
  disabled?: boolean
  onValueChange?: (value: ToggleGroupValue) => void
  type?: ToggleGroupType
  value?: ToggleGroupValue
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(
    {
      children,
      defaultValue,
      disabled = false,
      onKeyDown,
      onValueChange,
      type = "single",
      value,
      ...props
    },
    ref
  ) {
    const controlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState<ToggleGroupValue>(
      defaultValue ?? (type === "multiple" ? [] : "")
    )
    const selectedValue = normalizeToggleGroupValue(
      controlled ? value : internalValue,
      type
    )

    const updateValue = React.useCallback(
      (nextValue: ToggleGroupValue) => {
        if (!controlled) setInternalValue(nextValue)
        onValueChange?.(nextValue)
      },
      [controlled, onValueChange]
    )

    const context = React.useMemo<ToggleGroupContextValue>(
      () => ({
        disabled,
        isPressed: (itemValue) =>
          Array.isArray(selectedValue)
            ? selectedValue.includes(itemValue)
            : selectedValue === itemValue,
        toggle: (itemValue) => {
          if (disabled) return
          if (type === "multiple") {
            const values = Array.isArray(selectedValue) ? selectedValue : []
            updateValue(
              values.includes(itemValue)
                ? values.filter((entry) => entry !== itemValue)
                : [...values, itemValue]
            )
            return
          }
          updateValue(selectedValue === itemValue ? "" : itemValue)
        },
      }),
      [disabled, selectedValue, type, updateValue]
    )

    return (
      <toggleGroupContext.Provider value={context}>
        <ButtonGroup
          aria-disabled={disabled || undefined}
          data-selection-type={type}
          data-slot="toggle-group"
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (!event.defaultPrevented) moveToggleGroupFocus(event)
          }}
          ref={ref}
          {...props}
        >
          {children}
        </ButtonGroup>
      </toggleGroupContext.Provider>
    )
  }
)

type ToggleGroupItemProps = Omit<ButtonGroupItemProps, "aria-pressed"> & {
  value: string
}

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(function ToggleGroupItem(
  { disabled, onClick, value, ...props },
  ref
) {
  const context = React.useContext(toggleGroupContext)
  if (!context) {
    throw new Error("ToggleGroupItem must be used within ToggleGroup")
  }

  const pressed = context.isPressed(value)
  const isDisabled = disabled || context.disabled

  return (
    <ButtonGroupItem
      aria-pressed={pressed}
      data-slot="toggle-group-item"
      data-value={value}
      disabled={isDisabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) context.toggle(value)
      }}
      ref={ref}
      {...props}
    />
  )
})

function normalizeToggleGroupValue(
  value: ToggleGroupValue,
  type: ToggleGroupType
): ToggleGroupValue {
  if (type === "multiple") return Array.isArray(value) ? value : value ? [value] : []
  return Array.isArray(value) ? value[0] ?? "" : value
}

function moveToggleGroupFocus(event: React.KeyboardEvent<HTMLDivElement>) {
  const horizontalKeys = ["ArrowLeft", "ArrowRight"]
  const verticalKeys = ["ArrowUp", "ArrowDown"]
  if (![...horizontalKeys, ...verticalKeys, "Home", "End"].includes(event.key)) {
    return
  }

  const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>(
    '[data-slot="toggle-group-item"]:not(:disabled)'
  )]
  if (!items.length) return

  const currentIndex = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement))
  const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
  let nextIndex = currentIndex

  if (event.key === "Home") nextIndex = 0
  else if (event.key === "End") nextIndex = items.length - 1
  else if (event.key === "ArrowRight") nextIndex += rtl ? -1 : 1
  else if (event.key === "ArrowLeft") nextIndex += rtl ? 1 : -1
  else if (event.key === "ArrowDown") nextIndex += 1
  else if (event.key === "ArrowUp") nextIndex -= 1

  event.preventDefault()
  items[(nextIndex + items.length) % items.length]?.focus()
}

export {
  ButtonGroup,
  ButtonGroupItem,
  ButtonGroupLabel,
  ToggleGroup,
  ToggleGroupItem,
  buttonGroupVariants,
  buttonGroupItemVariants,
  buttonGroupLabelVariants,
}
export type {
  ButtonGroupLabelProps,
  ButtonGroupItemWidth,
  ButtonGroupItemProps,
  ButtonGroupMode,
  ButtonGroupProps,
  ButtonGroupSize,
  ControlDensity,
  ToggleGroupItemProps,
  ToggleGroupProps,
  ToggleGroupType,
  ToggleGroupValue,
}
