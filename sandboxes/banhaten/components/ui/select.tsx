"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  getDefaultSelectItemMedia,
  SelectIcon,
  SelectItemAvatar,
  SelectItemCompanyLogo,
  SelectItemPaymentIcon,
  SelectItemStatusDot,
  type SelectItemType,
  type SelectStatusTone,
} from "./select-content"

type ControlDensity = "compact" | "default" | "comfortable"
type SelectSize = "lg" | "md" | "comfortable"
type SelectVisualState = "default" | "filled" | "error" | "disabled"
type SelectVariant = "default" | "soft"
type SelectSelectionType = "default" | "checkbox"

const selectRoot = cva(
  "relative grid w-[var(--bh-select-width)] max-w-full gap-[var(--bh-select-field-gap)]"
)

const selectTrigger = cva(
  [
    "group/select-trigger relative flex w-full items-center gap-[var(--bh-select-trigger-gap)] rounded-[var(--bh-select-trigger-radius)]",
    "select-none px-[var(--bh-select-trigger-padding-x)] text-start outline-none",
    "transition-[background-color,box-shadow]",
    "[--bh-select-trigger-border-current:var(--bh-select-trigger-border)] [--shadow-select-trigger:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-select-trigger-border-current,var(--bh-select-trigger-border)),var(--shadow-component-default)]",
    "focus-visible:[--bh-select-trigger-border-current:var(--bh-select-trigger-border-focus)] focus-visible:shadow-[var(--shadow-select-focus-ring)]",
    "aria-invalid:[--bh-select-trigger-border-current:var(--bh-select-trigger-border-error)]",
    "disabled:pointer-events-none disabled:bg-[var(--bh-select-trigger-bg-disabled)] disabled:shadow-[inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-select-trigger-border-disabled)]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        comfortable: "py-[var(--bh-select-trigger-padding-y-comfortable)]",
        lg: "py-[var(--bh-select-trigger-padding-y-lg)]",
        md: "py-[var(--bh-select-trigger-padding-y-md)]",
      },
      variant: {
        default:
          "bg-[var(--bh-select-trigger-bg)] shadow-[var(--shadow-select-trigger)]",
        soft:
          "bg-[var(--bh-select-trigger-bg-soft)] shadow-none",
      },
      state: {
        default: "",
        filled: "",
        error:
          "[--bh-select-trigger-border-current:var(--bh-select-trigger-border-error)] shadow-[var(--shadow-select-trigger)] focus-visible:shadow-[var(--shadow-select-danger-focus-ring)]",
        disabled:
          "pointer-events-none bg-[var(--bh-select-trigger-bg-disabled)] shadow-[inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-select-trigger-border-disabled)]",
      },
    },
    defaultVariants: {
      size: "lg",
      variant: "default",
      state: "default",
    },
  }
)

const selectMenu = cva(
  [
    "w-[var(--radix-popper-anchor-width,var(--bh-select-menu-width))] max-w-[var(--radix-popper-available-width,100vw)] overflow-hidden rounded-[var(--bh-select-menu-radius)]",
    "select-none bg-[var(--bh-select-menu-bg)] py-[var(--bh-select-menu-padding-y)]",
    "shadow-[var(--shadow-select-menu)]",
  ].join(" ")
)

const selectMenuList = cva(
  "flex w-full flex-col gap-[var(--bh-select-menu-list-gap)]"
)

const selectMenuItem = cva(
  [
    "group/select-menu-item relative flex min-h-[var(--bh-select-item-min-height)] w-full items-center bg-transparent",
    "select-none px-[var(--bh-select-item-padding-x)] text-start outline-none",
    "disabled:pointer-events-none data-[disabled=true]:pointer-events-none",
    "focus-visible:[&>[data-slot=select-menu-item-content]]:bg-[var(--bh-select-item-hover-bg)]",
  ],
  {
    variants: {
      state: {
        default: "",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

const selectMenuItemContent = cva(
  [
    "relative flex min-w-0 flex-1 items-center gap-[var(--bh-select-item-gap)] rounded-[var(--bh-select-item-radius)]",
    "p-[var(--bh-select-item-content-padding)] transition-colors",
    "group-hover/select-menu-item:bg-[var(--bh-select-item-hover-bg)] group-data-[disabled=true]/select-menu-item:bg-transparent",
  ],
  {
    variants: {
      selected: {
        true: "pe-[var(--bh-select-item-selected-padding-end)]",
        false: "",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

const SelectRadixItemContext = React.createContext(false)

type SelectProps = Omit<React.ComponentProps<"div">, "children" | "dir"> & {
  children?: React.ReactNode
  defaultSelectValue?: string
  density?: ControlDensity
  dir?: "ltr" | "rtl" | "auto"
  errorMessage?: React.ReactNode
  expandIcon?: React.ReactNode | false
  hasHelperIcon?: boolean
  hasHelperText?: boolean
  hasInformationIcon?: boolean
  hasLabel?: boolean
  hasLeadingIcon?: boolean
  hasTrailingIcon?: boolean
  helperText?: React.ReactNode
  isOptional?: boolean
  isRequired?: boolean
  label?: React.ReactNode
  leadingIcon?: React.ReactNode | false
  onOpenChange?: (open: boolean) => void
  onTriggerClick?: React.MouseEventHandler<HTMLButtonElement>
  onValueChange?: (value: string) => void
  open?: boolean
  optionalText?: React.ReactNode
  placeholder?: React.ReactNode
  selectValue?: string
  size?: SelectSize
  state?: SelectVisualState
  triggerClassName?: string
  triggerId?: string
  triggerProps?: Omit<
    SelectTriggerProps,
    | "children"
    | "className"
    | "expandIcon"
    | "leadingIcon"
    | "placeholder"
    | "size"
    | "state"
    | "trailingIcon"
    | "value"
    | "variant"
  >
  trailingIcon?: React.ReactNode | false
  value?: React.ReactNode
  variant?: SelectVariant
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(function Select({
  children,
  className,
  defaultSelectValue,
  density,
  dir,
  errorMessage,
  expandIcon,
  hasHelperIcon = false,
  hasHelperText,
  hasInformationIcon = false,
  hasLabel,
  hasLeadingIcon,
  hasTrailingIcon,
  helperText,
  isOptional = false,
  isRequired = false,
  label,
  leadingIcon,
  onOpenChange,
  onTriggerClick,
  onValueChange,
  open,
  optionalText,
  placeholder,
  selectValue,
  size,
  state = "default",
  triggerClassName,
  triggerId,
  triggerProps,
  trailingIcon,
  value,
  variant = "default",
  ...props
}, ref) {
  const generatedId = React.useId()
  const resolvedSize = resolveSelectSize(density, size)
  const resolvedDir = dir
  const triggerVisualState = triggerProps?.disabled ? "disabled" : state
  const isError = triggerVisualState === "error"
  const selectedValue = value
  const selectedPlaceholder = placeholder
  const selectedLabel = label
  const selectedOptional = optionalText
  const selectedHelper = isError ? errorMessage : helperText
  const shouldRenderLabel = hasLabel ?? hasRenderableContent(selectedLabel)
  const shouldRenderHelperText =
    hasHelperText ?? hasRenderableContent(selectedHelper)
  const shouldShowLeadingIcon =
    leadingIcon !== false &&
    (hasLeadingIcon ?? hasRenderableContent(leadingIcon))
  const shouldShowTrailingIcon =
    trailingIcon !== false &&
    (hasTrailingIcon ?? hasRenderableContent(trailingIcon))
  const shouldRenderMenu = React.Children.count(children) > 0
  const selectId = triggerId || generatedId
  const helperId = `${selectId}-helper`
  const triggerAccessibleLabel = shouldRenderLabel
    ? undefined
    : getAccessibleText(selectedValue) ?? getAccessibleText(selectedPlaceholder)
  const rootOpenProps =
    open === undefined ? { onOpenChange } : { open, onOpenChange }

  return (
    <SelectPrimitive.Root
      defaultValue={defaultSelectValue}
      dir={resolvedDir === "auto" ? undefined : resolvedDir}
      disabled={triggerVisualState === "disabled"}
      onValueChange={onValueChange}
      value={selectValue}
      {...rootOpenProps}
    >
      <SelectRoot
        data-density={density}
        data-size={resolvedSize}
        data-state={triggerVisualState}
        data-variant={variant}
        dir={resolvedDir}
        ref={ref}
        className={className}
        {...props}
      >
        {shouldRenderLabel ? (
          <SelectLabel
            hasInformationIcon={hasInformationIcon}
            htmlFor={selectId}
            isOptional={isOptional}
            isRequired={isRequired}
            optionalText={selectedOptional}
          >
            {selectedLabel}
          </SelectLabel>
        ) : null}

        <div data-slot="select-control" className="relative w-full">
          <SelectPrimitive.Trigger asChild>
            <SelectTrigger
              aria-label={triggerAccessibleLabel}
              aria-describedby={shouldRenderHelperText ? helperId : undefined}
              aria-haspopup="listbox"
              aria-invalid={isError || undefined}
              expandIcon={expandIcon}
              id={selectId}
              leadingIcon={
                shouldShowLeadingIcon
                  ? (leadingIcon ?? <SelectIcon name="user" />)
                  : false
              }
              onClick={onTriggerClick}
              placeholder={selectedPlaceholder}
              size={resolvedSize}
              state={triggerVisualState}
              trailingIcon={
                shouldShowTrailingIcon
                  ? (trailingIcon ?? <SelectIcon name="info" />)
                  : false
              }
              value={selectedValue}
              variant={variant}
              className={triggerClassName}
              {...triggerProps}
            />
          </SelectPrimitive.Trigger>

          {shouldRenderMenu ? (
            <RadixSelectMenuContent forceMount={open === true || undefined}>
              {children}
            </RadixSelectMenuContent>
          ) : null}
        </div>

        {shouldRenderHelperText ? (
          <SelectHelperText
            hasIcon={hasHelperIcon}
            id={helperId}
            type={isError ? "error" : "default"}
          >
            {selectedHelper}
          </SelectHelperText>
        ) : null}
      </SelectRoot>
    </SelectPrimitive.Root>
  )
})

type RadixSelectMenuContentProps = React.ComponentProps<typeof SelectPrimitive.Content>
// Radix sideOffset requires a number; this mirrors --bh-select-menu-offset.
const SELECT_MENU_SIDE_OFFSET_PX = 4
// Radix collisionPadding requires a number; this mirrors --bh-space-md-8.
const SELECT_MENU_COLLISION_PADDING_PX = 8

function RadixSelectMenuContent({
  children,
  className,
  collisionPadding = SELECT_MENU_COLLISION_PADDING_PX,
  position = "popper",
  sideOffset = SELECT_MENU_SIDE_OFFSET_PX,
  ...props
}: RadixSelectMenuContentProps) {
  return (
    <SelectPrimitive.Content
      asChild
      collisionPadding={collisionPadding}
      position={position}
      sideOffset={sideOffset}
      {...props}
    >
      <div
        data-slot="select-menu"
        className={cn(
          selectMenu(),
          "absolute start-0 top-[calc(100%+var(--bh-select-menu-offset))] z-[var(--bh-z-popover)]",
          className
        )}
      >
        <SelectPrimitive.Viewport asChild>
          <div data-slot="select-menu-list" className={selectMenuList()}>
            <SelectRadixItemContext.Provider value>
              {children}
            </SelectRadixItemContext.Provider>
          </div>
        </SelectPrimitive.Viewport>
      </div>
    </SelectPrimitive.Content>
  )
}

type SelectRootProps = React.ComponentProps<"div">

const SelectRoot = React.forwardRef<HTMLDivElement, SelectRootProps>(function SelectRoot(
  { className, ...props },
  ref
) {
  return (
    <div
      data-slot="select-root"
      ref={ref}
      className={cn(selectRoot(), className)}
      {...props}
    />
  )
})

type SelectLabelProps = React.ComponentProps<"label"> & {
  hasInformationIcon?: boolean
  isOptional?: boolean
  isRequired?: boolean
  optionalText?: React.ReactNode
}

function SelectLabel({
  children,
  className,
  hasInformationIcon = false,
  isOptional = false,
  isRequired = false,
  optionalText,
  ...props
}: SelectLabelProps) {
  return (
    <label
      data-slot="select-label"
      className={cn(
        "flex w-full items-center gap-[var(--bh-select-label-gap)] text-start",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-label-text"
        dir="auto"
        className="min-w-0 shrink-0 whitespace-nowrap text-[length:var(--bh-text-body-sm-medium-font-size)] font-[var(--bh-text-body-sm-medium-font-weight)] leading-[var(--bh-text-body-sm-medium-line-height)] tracking-[var(--bh-text-body-sm-medium-letter-spacing)] text-[var(--bh-content-default)] rtl:text-[length:var(--bh-text-body-xs-medium-font-size)] rtl:font-[var(--bh-text-body-xs-medium-font-weight)] rtl:leading-[var(--bh-text-body-xs-medium-line-height)] rtl:tracking-[var(--bh-text-body-xs-medium-letter-spacing)]"
      >
        {children}
      </span>
      {isRequired ? (
        <span
          aria-hidden="true"
          data-slot="select-label-required"
          className="shrink-0 whitespace-nowrap text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)] text-[var(--bh-content-danger-default)]"
        >
          *
        </span>
      ) : null}
      {isOptional && hasRenderableContent(optionalText) ? (
        <span
          data-slot="select-label-optional"
          dir="auto"
          className="min-w-0 shrink-0 whitespace-nowrap text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)] text-[var(--bh-content-subtle)]"
        >
          {optionalText}
        </span>
      ) : null}
      {hasInformationIcon ? (
        <SelectIcon
          name="info"
          className="text-[var(--bh-select-trigger-icon-color)]"
        />
      ) : null}
    </label>
  )
}

function hasRenderableContent(content: React.ReactNode) {
  return (
    content !== undefined &&
    content !== null &&
    content !== false &&
    content !== ""
  )
}

function getAccessibleText(content: React.ReactNode) {
  return typeof content === "string" || typeof content === "number"
    ? String(content)
    : undefined
}

type SelectHelperTextProps = React.ComponentProps<"p"> & {
  hasIcon?: boolean
  type?: "default" | "error"
}

function SelectHelperText({
  children,
  className,
  hasIcon = false,
  type = "default",
  ...props
}: SelectHelperTextProps) {
  const isError = type === "error"

  return (
    <p
      data-slot="select-helper-text"
      data-type={type}
      className={cn(
        "flex w-full items-center gap-[var(--bh-select-label-gap)] text-start text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)]",
        isError
          ? "text-[var(--bh-content-danger-default)]"
          : "text-[var(--bh-content-subtle)]",
        className
      )}
      {...props}
    >
      {hasIcon ? (
        <SelectIcon
          name={isError ? "error" : "info"}
          className={
            isError
              ? "text-[var(--bh-content-danger-default)]"
              : "text-[var(--bh-select-trigger-icon-color)]"
          }
        />
      ) : null}
      <span data-slot="select-helper-label" dir="auto" className="min-w-0 flex-1">
        {children}
      </span>
    </p>
  )
}

type SelectTriggerProps = Omit<
  React.ComponentProps<"button">,
  "children" | "value"
> &
  VariantProps<typeof selectTrigger> & {
    density?: ControlDensity
    expandIcon?: React.ReactNode | false
    leadingIcon?: React.ReactNode | false
    placeholder?: React.ReactNode
    trailingIcon?: React.ReactNode | false
    value?: React.ReactNode
  }

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      className,
      density,
      disabled,
      expandIcon,
      leadingIcon,
      placeholder,
      size,
      state,
      trailingIcon,
      type = "button",
      value,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const resolvedSize = resolveSelectSize(density, size)
    const hasValue = value !== undefined && value !== null && value !== ""
    const visualState = disabled ? "disabled" : state ?? (hasValue ? "filled" : "default")
    const isDisabled = visualState === "disabled"

    return (
      <button
        data-density={density}
        data-size={resolvedSize}
        data-slot="select-trigger"
        data-state={visualState}
        data-variant={variant}
        disabled={isDisabled}
        ref={ref}
        type={type}
        className={cn(
          selectTrigger({ size: resolvedSize, state: visualState, variant }),
          className
        )}
        {...props}
      >
        <span
          data-slot="select-trigger-main"
          className="flex min-w-0 flex-1 items-center gap-[var(--bh-select-content-gap)]"
        >
          {hasRenderableContent(leadingIcon) ? (
            <span
              data-slot="select-leading-icon"
              className="flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center text-[var(--bh-select-trigger-icon-color)] group-data-[state=disabled]/select-trigger:text-[var(--bh-content-disabled)] [&_svg:not([class*='size-'])]:size-[var(--bh-select-icon-size)]"
            >
              {leadingIcon}
            </span>
          ) : null}

          <span
            data-slot="select-value-wrap"
            className="flex min-w-0 flex-1 items-center ps-[var(--bh-select-value-padding-inline)]"
          >
            <span
              data-slot="select-value"
              dir="auto"
              className={cn(
                "min-w-0 flex-1 truncate text-start text-[length:var(--bh-text-body-md-regular-font-size)] font-[var(--bh-text-body-md-regular-font-weight)] leading-[var(--bh-text-body-md-regular-line-height)] tracking-[var(--bh-text-body-md-regular-letter-spacing)]",
                hasValue || visualState === "filled"
                  ? "text-[var(--bh-content-default)]"
                  : "text-[var(--bh-content-subtle)]",
                isDisabled && "text-[var(--bh-content-disabled)]"
              )}
            >
              {hasValue ? value : placeholder}
            </span>
          </span>
        </span>

        {hasRenderableContent(trailingIcon) ? (
          <span
            data-slot="select-trailing-icon"
            className="flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center text-[var(--bh-select-trigger-icon-color)] group-data-[state=disabled]/select-trigger:text-[var(--bh-content-disabled)] [&_svg:not([class*='size-'])]:size-[var(--bh-select-icon-size)]"
          >
            {trailingIcon}
          </span>
        ) : null}

        {expandIcon !== false ? (
          <span
            data-slot="select-expand-icon"
            className="flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center text-[var(--bh-select-trigger-icon-color)] group-data-[state=disabled]/select-trigger:text-[var(--bh-content-disabled)] [&_svg:not([class*='size-'])]:size-[var(--bh-select-icon-size)]"
          >
            {expandIcon ?? <SelectIcon name="chevron-down" />}
          </span>
        ) : null}
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

type SelectMenuProps = React.ComponentProps<"div">

const SelectMenu = React.forwardRef<HTMLDivElement, SelectMenuProps>(function SelectMenu(
  {
    "aria-label": ariaLabel = "Options",
    children,
    className,
    onKeyDown,
    role,
    ...props
  },
  ref
) {
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return

      if (event.key === "Escape") {
        event.currentTarget.blur()
        return
      }

      if (
        event.key !== "ArrowDown" &&
        event.key !== "ArrowUp" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return
      }

      const items = getFocusableSelectItems(event.currentTarget)
      if (items.length === 0) return

      event.preventDefault()

      const activeItem = event.currentTarget.ownerDocument.activeElement
      const currentIndex =
        activeItem instanceof HTMLElement ? items.indexOf(activeItem) : -1
      let nextIndex = currentIndex

      if (event.key === "Home") nextIndex = 0
      if (event.key === "End") nextIndex = items.length - 1
      if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length
      if (event.key === "ArrowUp") {
        nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1
      }

      items[nextIndex]?.focus()
    },
    [onKeyDown]
  )

  return (
    <div
      aria-label={ariaLabel}
      data-slot="select-menu"
      onKeyDown={handleKeyDown}
      ref={ref}
      role={role || "listbox"}
      className={cn(selectMenu(), className)}
      {...props}
    >
      <div
        data-slot="select-menu-list"
        role="presentation"
        className={selectMenuList()}
      >
        {children}
      </div>
    </div>
  )
})

type SelectMenuItemBaseProps = Omit<
  React.ComponentProps<"button">,
  "children" | "type" | "value"
> & {
  addonText?: React.ReactNode
  children?: React.ReactNode
  label?: React.ReactNode
  type?: "button" | "submit" | "reset"
  value?: string
}

type SelectMenuItemMediaProps =
  | { itemType?: "default"; media?: React.ReactNode | false }
  | {
      itemType: Exclude<SelectItemType, "default">
      media?: React.ReactNode | false
    }

type SelectMenuItemSelectionProps =
  | { selected?: boolean; selectionType?: "default" }
  | { selected?: boolean; selectionType: "checkbox" }

type SelectMenuItemDynamicProps = {
  itemType?: SelectItemType
  media?: React.ReactNode | false
  selected?: boolean
  selectionType?: SelectSelectionType
}

type SelectMenuItemProps = SelectMenuItemBaseProps &
  (
    | (SelectMenuItemMediaProps & SelectMenuItemSelectionProps)
    | SelectMenuItemDynamicProps
  )

const SelectMenuItem = React.forwardRef<HTMLButtonElement, SelectMenuItemProps>(function SelectMenuItem({
  addonText,
  "aria-checked": ariaChecked,
  "aria-selected": ariaSelected,
  children,
  className,
  disabled,
  itemType = "default",
  label,
  media,
  role,
  selected = false,
  selectionType = "default",
  type = "button",
  value,
  ...props
}, ref) {
  const inRadixSelect = React.useContext(SelectRadixItemContext)
  const generatedValue = React.useId()
  const isDisabled = disabled
  const selectedWithEndCheck = selected && selectionType === "default"
  const resolvedRole = role || "option"
  const usesCheckedState =
    resolvedRole === "checkbox" ||
    resolvedRole === "menuitemcheckbox" ||
    resolvedRole === "radio" ||
    resolvedRole === "menuitemradio"
  const selectedMedia =
    media === false ? null : media ?? getDefaultSelectItemMedia(itemType)
  const content = label ?? children
  const itemValue =
    value ??
    (typeof content === "string" || typeof content === "number"
      ? String(content)
      : generatedValue)
  const itemTextValue =
    typeof content === "string" || typeof content === "number"
      ? String(content)
      : undefined

  const item = (
    <button
      aria-checked={usesCheckedState ? (ariaChecked ?? Boolean(selected)) : undefined}
      aria-disabled={isDisabled || undefined}
      aria-selected={resolvedRole === "option" ? (ariaSelected ?? Boolean(selected)) : undefined}
      data-disabled={isDisabled ? "true" : undefined}
      data-item-type={itemType}
      data-selected={selected ? "true" : "false"}
      data-selection-type={selectionType}
      data-slot="select-menu-item"
      disabled={isDisabled}
      ref={ref}
      role={resolvedRole}
      type={type}
      className={cn(selectMenuItem(), className)}
      {...props}
    >
      <span
        data-slot="select-menu-item-content"
        className={selectMenuItemContent({
          selected: selectedWithEndCheck,
        })}
      >
        {selectionType === "checkbox" ? (
          <span
            data-slot="select-menu-item-checkbox-wrap"
            className="flex size-[var(--bh-select-icon-slot-size)] shrink-0 items-center justify-center"
          >
            <SelectCheckboxIndicator checked={selected} disabled={isDisabled} />
          </span>
        ) : null}

        {selectedMedia ? (
          <span
            data-slot="select-menu-item-media"
            className="flex shrink-0 items-center ps-[var(--bh-select-media-inset)] text-[var(--bh-content-subtle)] group-data-[disabled=true]/select-menu-item:text-[var(--bh-content-disabled)] group-data-[disabled=true]/select-menu-item:opacity-[var(--bh-opacity-60)] [&_svg:not([class*='size-'])]:size-[var(--bh-icon-size-default)]"
          >
            {selectedMedia}
          </span>
        ) : null}

        <span
          data-slot="select-menu-item-value"
          className="flex min-w-0 items-center px-[var(--bh-select-item-value-padding-x)]"
        >
          <span
            data-slot="select-menu-item-label"
            dir="auto"
            className="min-w-0 truncate text-start text-[length:var(--bh-text-body-md-regular-font-size)] font-[var(--bh-text-body-md-regular-font-weight)] leading-[var(--bh-text-body-md-regular-line-height)] tracking-[var(--bh-text-body-md-regular-letter-spacing)] text-[var(--bh-content-default)] group-data-[disabled=true]/select-menu-item:text-[var(--bh-content-disabled)]"
          >
            {content}
          </span>
        </span>

        {addonText !== undefined && addonText !== null ? (
          <span
            data-slot="select-menu-item-addon"
            dir="auto"
            className="min-w-0 shrink-0 truncate text-start text-[length:var(--bh-text-body-2xs-regular-font-size)] font-[var(--bh-text-body-2xs-regular-font-weight)] leading-[var(--bh-text-body-2xs-regular-line-height)] tracking-[var(--bh-text-body-2xs-regular-letter-spacing)] text-[var(--bh-content-muted)] group-hover/select-menu-item:text-[var(--bh-content-subtle)] group-focus-visible/select-menu-item:text-[var(--bh-content-subtle)] group-data-[disabled=true]/select-menu-item:text-[var(--bh-content-disabled)]"
          >
            {addonText}
          </span>
        ) : null}
      </span>

      {selectedWithEndCheck ? (
        <span
          aria-hidden="true"
          data-slot="select-menu-item-check"
          className="pointer-events-none absolute end-[var(--bh-select-item-check-offset)] top-1/2 flex size-[var(--bh-select-icon-slot-size)] -translate-y-1/2 items-center justify-center text-[var(--bh-select-check-color)]"
        >
          <SelectIcon name="check-line" />
        </span>
      ) : null}
    </button>
  )

  if (!inRadixSelect) return item

  return (
    <SelectPrimitive.Item
      asChild
      disabled={isDisabled}
      textValue={itemTextValue}
      value={itemValue}
    >
      {item}
    </SelectPrimitive.Item>
  )
})

function getFocusableSelectItems(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      '[role="option"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"])'
    )
  ).filter((item) => !item.hasAttribute("disabled"))
}

function resolveSelectSize(
  density: ControlDensity | undefined,
  size: SelectSize | null | undefined
): SelectSize {
  if (density === "compact") return "md"
  if (density === "default") return "lg"
  if (density === "comfortable") return "comfortable"
  return size ?? "lg"
}

type SelectCheckboxIndicatorProps = {
  checked?: boolean
  className?: string
  disabled?: boolean
}

function SelectCheckboxIndicator({
  checked = false,
  className,
  disabled = false,
}: SelectCheckboxIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-checked={checked ? "true" : "false"}
      data-disabled={disabled ? "true" : undefined}
      data-slot="select-checkbox"
      className={cn(
        "relative size-[var(--bh-select-icon-slot-size)] shrink-0 overflow-hidden",
        className
      )}
    >
      <span
        data-slot="select-checkbox-control"
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 size-[var(--bh-select-checkbox-size)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--bh-select-checkbox-radius)] shadow-[var(--shadow-select-checkbox)] [--bh-select-checkbox-border:var(--bh-border-input)] [--shadow-select-checkbox:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-select-checkbox-border,var(--bh-border-input)),var(--shadow-component-default)]",
          checked
            ? "bg-[var(--bh-interactive-checkbox-default)] [--bh-select-checkbox-border:transparent]"
            : "bg-[var(--bh-bg-default)]",
          disabled &&
            "bg-[var(--bh-bg-disabled)] shadow-[inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-border-disabled)]"
        )}
      />
      {checked ? (
        <span className="absolute left-1/2 top-1/2 flex size-[var(--bh-select-checkbox-icon-size)] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[var(--bh-content-on-color)]">
          <SelectIcon name="check-fill" />
        </span>
      ) : null}
    </span>
  )
}

export {
  Select,
  SelectCheckboxIndicator,
  SelectHelperText,
  SelectItemAvatar,
  SelectItemCompanyLogo,
  SelectItemPaymentIcon,
  SelectItemStatusDot,
  SelectLabel,
  SelectMenu,
  SelectMenuItem,
  SelectRoot,
  SelectTrigger,
  selectMenu,
  selectMenuItem,
  selectRoot,
  selectTrigger,
}
export type {
  ControlDensity,
  SelectItemType,
  SelectMenuItemProps,
  SelectProps,
  SelectRootProps,
  SelectSelectionType,
  SelectSize,
  SelectStatusTone,
  SelectTriggerProps,
  SelectVariant,
  SelectVisualState,
}
