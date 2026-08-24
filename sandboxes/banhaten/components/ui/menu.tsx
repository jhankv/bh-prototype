import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useResolvedDirection } from "@/hooks/use-direction"

type MenuWidth = "menu" | "default" | "multiline" | "action" | "auto"
type MenuItemKind = "default" | "multiline" | "action" | "progress" | "button"
type MenuItemState = "default" | "disabled"
type MenuItemIconPosition = "leading" | "trailing"
type MenuItemAvatarSize = "sm" | "lg"
type MenuCollisionPadding = NonNullable<
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>["collisionPadding"]
>

// Default Radix collisionPadding mirrors --bh-space-md-8.
const MENU_COLLISION_PADDING_PX = 8
// Radix sideOffset is numeric; this mirrors --bh-space-xs-4.
const MENU_SUBCONTENT_SIDE_OFFSET_PX = 4

const menuVariants = cva(
  "flex flex-col items-start gap-[var(--bh-menu-gap)] overflow-hidden rounded-[var(--bh-menu-radius)] bg-[var(--bh-menu-bg)] py-[var(--bh-menu-padding-y)] shadow-[var(--shadow-menu)]",
  {
    variants: {
      width: {
        menu: "w-[var(--bh-menu-width)]",
        default: "w-[var(--bh-menu-item-default-width)]",
        multiline: "w-[var(--bh-menu-item-multiline-width)]",
        action: "w-[var(--bh-menu-item-action-width)]",
        auto: "w-max",
      },
    },
    defaultVariants: {
      width: "menu",
    },
  }
)

const menuItemVariants = cva(
  "group/menu-item relative flex w-full items-center bg-[var(--bh-menu-item-bg)] outline-none transition-colors data-[disabled=true]:pointer-events-none",
  {
    variants: {
      kind: {
        default:
          "h-[var(--bh-menu-item-default-height)] px-[var(--bh-menu-item-padding-x)]",
        multiline:
          "min-h-[var(--bh-menu-item-multiline-height)] px-[var(--bh-menu-item-padding-x)]",
        action:
          "min-h-[var(--bh-menu-item-action-height)] px-[var(--bh-menu-item-padding-x)]",
        progress:
          "h-[var(--bh-menu-item-progress-height)] px-[var(--bh-menu-item-padding-x)]",
        button:
          "h-[var(--bh-menu-item-button-height)] px-[var(--bh-menu-item-padding-x)]",
      },
    },
    defaultVariants: {
      kind: "default",
    },
  }
)

const menuItemContentVariants = cva(
  "flex min-w-0 flex-1 transition-colors group-data-[disabled=true]/menu-item:bg-transparent [&_svg]:shrink-0 rtl:[&_svg[data-rtl-flip='true']]:-scale-x-100",
  {
    variants: {
      kind: {
        default:
          "h-[var(--bh-menu-item-default-height)] items-center gap-[var(--bh-menu-item-gap)] rounded-[var(--bh-menu-item-radius)] p-[var(--bh-menu-item-content-padding)] group-hover/menu-item:bg-[var(--bh-menu-item-hover-bg)]",
        multiline:
          "min-h-[var(--bh-menu-item-multiline-height)] items-center gap-[var(--bh-menu-item-gap)] rounded-[var(--bh-menu-item-radius)] px-[var(--bh-menu-item-content-padding)] py-[var(--bh-menu-item-content-compact-padding-y)] group-hover/menu-item:bg-[var(--bh-menu-item-hover-bg)]",
        action:
          "min-h-[var(--bh-menu-item-action-height)] items-center gap-[var(--bh-menu-item-gap)] rounded-[var(--bh-menu-item-radius)] px-[var(--bh-menu-item-content-padding)] py-[var(--bh-menu-item-content-compact-padding-y)] group-hover/menu-item:bg-[var(--bh-menu-item-hover-bg)]",
        progress:
          "h-[var(--bh-menu-item-progress-height)] flex-col items-start gap-0 px-[var(--bh-menu-item-content-padding)] py-[var(--bh-menu-item-content-compact-padding-y)]",
        button:
          "h-[var(--bh-menu-item-button-height)] flex-col items-start gap-[var(--bh-menu-item-slot-gap)] px-[var(--bh-menu-item-content-padding)] py-[var(--bh-menu-item-content-compact-padding-y)]",
      },
    },
    defaultVariants: {
      kind: "default",
    },
  }
)

const menuItemIconVariants = cva(
  "flex shrink-0 items-center justify-center text-[var(--bh-content-subtle)] group-data-[disabled=true]/menu-item:text-[var(--bh-content-disabled)]",
  {
    variants: {
      position: {
        leading:
          "h-[var(--bh-menu-leading-icon-slot-size)] ps-[var(--bh-menu-icon-padding)] [&_svg]:size-[var(--bh-menu-leading-icon-size)]",
        trailing:
          "size-[var(--bh-menu-trailing-icon-size)] text-[var(--bh-content-muted)] [&_svg]:size-[var(--bh-menu-trailing-icon-size)]",
      },
    },
    defaultVariants: {
      position: "leading",
    },
  }
)

type MenuProps = React.ComponentProps<typeof DropdownMenuPrimitive.Root>

type MenuContentProps = React.ComponentProps<typeof DropdownMenuPrimitive.Content> &
  VariantProps<typeof menuVariants> & {
    asChild?: boolean
  }

type MenuSubContentProps = React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> &
  VariantProps<typeof menuVariants> & {
    asChild?: boolean
  }

const MenuRoot = DropdownMenuPrimitive.Root
const MenuSub = DropdownMenuPrimitive.Sub
const MenuTrigger = DropdownMenuPrimitive.Trigger
const MenuStaticContext = React.createContext(false)

function Menu({ dir, ...props }: MenuProps) {
  const directionBoundaryRef = React.useRef<HTMLSpanElement | null>(null)
  const resolvedDirection = useResolvedDirection(dir, directionBoundaryRef)

  return (
    <span className="contents" data-slot="menu-root-boundary" ref={directionBoundaryRef}>
      <MenuRoot dir={resolvedDirection} {...props} />
    </span>
  )
}

type MenuSurfaceProps = React.ComponentProps<"div"> &
  VariantProps<typeof menuVariants> & {
    asChild?: boolean
  }

const MenuSurface = React.forwardRef<HTMLDivElement, MenuSurfaceProps>(function MenuSurface({
  asChild = false,
  children,
  className,
  role = "menu",
  width,
  ...props
}, ref) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="menu"
      data-width={width ?? "menu"}
      ref={ref}
      role={role}
      className={cn(
        menuVariants({ width }),
        "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})

const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent({
  children,
  className,
  collisionPadding = MENU_COLLISION_PADDING_PX,
  width,
  asChild = false,
  role = "menu",
  ...props
}, ref) {
  return (
    <DropdownMenuPrimitive.Content
      asChild
      collisionPadding={collisionPadding}
      {...props}
    >
      <MenuSurface
        asChild={asChild}
        className={className}
        ref={ref}
        role={role}
        width={width}
      >
        {children}
      </MenuSurface>
    </DropdownMenuPrimitive.Content>
  )
})

const MenuSubContent = React.forwardRef<HTMLDivElement, MenuSubContentProps>(function MenuSubContent({
  children,
  className,
  collisionPadding = MENU_COLLISION_PADDING_PX,
  sideOffset = MENU_SUBCONTENT_SIDE_OFFSET_PX,
  width,
  asChild = false,
  role = "menu",
  ...props
}, ref) {
  return (
    <DropdownMenuPrimitive.SubContent
      asChild
      collisionPadding={collisionPadding}
      sideOffset={sideOffset}
      {...props}
    >
      <MenuSurface
        asChild={asChild}
        className={className}
        ref={ref}
        role={role}
        width={width}
      >
        {children}
      </MenuSurface>
    </DropdownMenuPrimitive.SubContent>
  )
})

type MenuPreviewProps = React.ComponentProps<"div"> &
  VariantProps<typeof menuVariants> & {
    asChild?: boolean
  }

function MenuPreview({
  children,
  className,
  role = "menu",
  width,
  asChild = false,
  ...props
}: MenuPreviewProps) {
  return (
    <MenuStaticContext.Provider value>
      <MenuSurface
        asChild={asChild}
        className={className}
        role={role}
        width={width}
        {...props}
      >
        {children}
      </MenuSurface>
    </MenuStaticContext.Provider>
  )
}

const MenuPortal = DropdownMenuPrimitive.Portal

function getMenuItemTextValue(children: React.ReactNode) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }

  return undefined
}

type MenuItemPrimitiveProps = Pick<
  React.ComponentProps<typeof DropdownMenuPrimitive.Item>,
  "onSelect" | "textValue"
>

type MenuItemProps = React.ComponentProps<"div"> &
  VariantProps<typeof menuItemVariants> &
  MenuItemPrimitiveProps & {
    asChild?: boolean
    disabled?: boolean
  }

type MenuSubTriggerPrimitiveProps = Pick<
  React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>,
  "textValue"
>

type MenuSubTriggerProps = React.ComponentProps<"div"> &
  VariantProps<typeof menuItemVariants> &
  MenuSubTriggerPrimitiveProps & {
    asChild?: boolean
    disabled?: boolean
  }

const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem({
  "aria-checked": ariaChecked,
  className,
  kind = "default",
  disabled = false,
  asChild = false,
  role,
  tabIndex,
  children,
  onSelect,
  textValue,
  ...props
}, ref) {
  const Comp = asChild ? Slot : "div"
  const isStaticMenu = React.useContext(MenuStaticContext)
  const selectedKind: MenuItemKind = kind ?? "default"
  const isDisabled = disabled
  const switchState = findMenuItemSwitchState(children)
  const resolvedRole = role ??
    (switchState === undefined ? "menuitem" : "menuitemcheckbox")
  const resolvedChecked =
    resolvedRole === "menuitemcheckbox"
      ? (ariaChecked ?? switchState ?? false)
      : undefined

  const item = (
    <Comp
      aria-checked={resolvedChecked}
      aria-disabled={isDisabled ? true : undefined}
      data-disabled={isDisabled ? "true" : "false"}
      data-kind={selectedKind}
      data-slot="menu-item"
      ref={ref}
      role={resolvedRole}
      tabIndex={isDisabled ? -1 : (tabIndex ?? 0)}
      className={cn(menuItemVariants({ kind: selectedKind, className }))}
      {...props}
    >
      <MenuItemContent kind={selectedKind}>
        <MenuItemChildren kind={selectedKind}>{children}</MenuItemChildren>
      </MenuItemContent>
    </Comp>
  )

  if (isStaticMenu) return item

  if (switchState !== undefined) {
    return (
      <DropdownMenuPrimitive.CheckboxItem
        asChild
        checked={switchState}
        disabled={isDisabled}
        onSelect={onSelect}
        textValue={textValue ?? getMenuItemTextValue(children)}
      >
        {item}
      </DropdownMenuPrimitive.CheckboxItem>
    )
  }

  return (
    <DropdownMenuPrimitive.Item
      asChild
      disabled={isDisabled}
      onSelect={onSelect}
      textValue={textValue ?? getMenuItemTextValue(children)}
    >
      {item}
    </DropdownMenuPrimitive.Item>
  )
})

MenuItem.displayName = "MenuItem"

function findMenuItemSwitchState(children: React.ReactNode): boolean | undefined {
  let state: boolean | undefined

  React.Children.forEach(children, (child) => {
    if (state !== undefined || !React.isValidElement(child)) return

    const element = child as React.ReactElement<{
      active?: boolean
      children?: React.ReactNode
    }>
    if (element.type === MenuItemSwitch) {
      state = Boolean(element.props.active)
      return
    }

    state = findMenuItemSwitchState(element.props.children)
  })

  return state
}

const MenuSubTrigger = React.forwardRef<HTMLDivElement, MenuSubTriggerProps>(function MenuSubTrigger({
  className,
  kind = "default",
  disabled = false,
  asChild = false,
  role = "menuitem",
  tabIndex,
  children,
  textValue,
  ...props
}, ref) {
  const Comp = asChild ? Slot : "div"
  const isStaticMenu = React.useContext(MenuStaticContext)
  const selectedKind: MenuItemKind = kind ?? "default"
  const isDisabled = disabled

  const item = (
    <Comp
      aria-disabled={isDisabled ? true : undefined}
      data-disabled={isDisabled ? "true" : "false"}
      data-kind={selectedKind}
      data-slot="menu-sub-trigger"
      ref={ref}
      role={role}
      tabIndex={isDisabled ? -1 : (tabIndex ?? 0)}
      className={cn(menuItemVariants({ kind: selectedKind, className }))}
      {...props}
    >
      <MenuItemContent kind={selectedKind}>
        <MenuItemChildren kind={selectedKind}>{children}</MenuItemChildren>
      </MenuItemContent>
    </Comp>
  )

  if (isStaticMenu) return item

  return (
    <DropdownMenuPrimitive.SubTrigger
      asChild
      disabled={isDisabled}
      textValue={textValue ?? getMenuItemTextValue(children)}
    >
      {item}
    </DropdownMenuPrimitive.SubTrigger>
  )
})

MenuSubTrigger.displayName = "MenuSubTrigger"

type MenuItemContentProps = React.ComponentProps<"div"> &
  VariantProps<typeof menuItemContentVariants>

function MenuItemContent({
  className,
  kind,
  ...props
}: MenuItemContentProps) {
  return (
    <div
      data-slot="menu-item-content"
      className={cn(menuItemContentVariants({ kind, className }))}
      {...props}
    />
  )
}

function MenuItemChildren({
  children,
  kind,
}: {
  children: React.ReactNode
  kind: MenuItemKind
}) {
  return React.Children.map(children, (child) => {
    if (kind === "button" && (typeof child === "string" || typeof child === "number")) {
      return <MenuItemAction fullWidth>{child}</MenuItemAction>
    }

    if (typeof child === "string" || typeof child === "number") {
      return (
        <MenuItemText>
          <MenuItemTitle>{child}</MenuItemTitle>
        </MenuItemText>
      )
    }

    return child
  })
}

function MenuItemText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menu-item-text"
      className={cn(
        "flex min-w-0 flex-1 flex-col ps-[var(--bh-space-xs-4)]",
        className
      )}
      {...props}
    />
  )
}

function MenuItemTitle({
  className,
  dir = "auto",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menu-item-title"
      dir={dir}
      className={cn(
        "min-w-0 truncate text-start text-[length:var(--bh-text-body-md-regular-font-size)] font-[var(--bh-text-body-md-regular-font-weight)] leading-[var(--bh-text-body-md-regular-line-height)] tracking-[var(--bh-text-body-md-regular-letter-spacing)] text-[var(--bh-content-default)] group-data-[disabled=true]/menu-item:text-[var(--bh-content-disabled)]",
        className
      )}
      {...props}
    />
  )
}

function MenuItemDescription({
  className,
  dir = "auto",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menu-item-description"
      dir={dir}
      className={cn(
        "min-w-0 truncate text-start text-[length:var(--bh-text-body-2xs-regular-font-size)] font-[var(--bh-text-body-2xs-regular-font-weight)] leading-[var(--bh-text-body-2xs-regular-line-height)] tracking-[var(--bh-text-body-2xs-regular-letter-spacing)] text-[var(--bh-content-subtle)] group-data-[disabled=true]/menu-item:text-[var(--bh-content-disabled)]",
        className
      )}
      {...props}
    />
  )
}

function MenuItemMeta({
  className,
  dir = "auto",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menu-item-meta"
      dir={dir}
      className={cn(
        "shrink-0 whitespace-nowrap text-end text-[length:var(--bh-text-body-2xs-regular-font-size)] font-[var(--bh-text-body-2xs-regular-font-weight)] leading-[var(--bh-text-body-2xs-regular-line-height)] tracking-[var(--bh-text-body-2xs-regular-letter-spacing)] text-[var(--bh-content-subtle)] group-data-[disabled=true]/menu-item:text-[var(--bh-content-disabled)]",
        className
      )}
      {...props}
    />
  )
}

type MenuItemIconProps = React.ComponentProps<"span"> &
  VariantProps<typeof menuItemIconVariants>

function MenuItemIcon({
  className,
  position,
  ...props
}: MenuItemIconProps) {
  return (
    <span
      aria-hidden="true"
      data-position={position ?? "leading"}
      data-slot="menu-item-icon"
      className={cn(menuItemIconVariants({ position, className }))}
      {...props}
    />
  )
}

type MenuItemAvatarProps = React.ComponentProps<"span"> & {
  alt?: string
  size?: MenuItemAvatarSize
  src?: string
}

function MenuItemAvatar({
  alt = "",
  children,
  className,
  size = "sm",
  src,
  ...props
}: MenuItemAvatarProps) {
  return (
    <span
      data-size={size}
      data-slot="menu-item-avatar-wrap"
      className={cn(
        "flex shrink-0 items-center ps-[var(--bh-menu-icon-padding)] group-data-[disabled=true]/menu-item:opacity-[var(--bh-opacity-60)]",
        size === "lg"
          ? "h-[var(--bh-space-7xl-40)]"
          : "h-[var(--bh-space-5xl-24)]",
        className
      )}
      {...props}
    >
      <span
        data-slot="menu-item-avatar"
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--bh-radius-full)] border border-[var(--bh-border-subtle)] bg-[var(--bh-bg-neutral-subtle)] text-[length:var(--bh-text-body-3xs-medium-font-size)] font-[var(--bh-text-body-3xs-medium-font-weight)] leading-[var(--bh-text-body-3xs-medium-line-height)] text-[var(--bh-content-subtle)]",
          size === "lg"
            ? "size-[var(--bh-space-7xl-40)]"
            : "size-[var(--bh-space-5xl-24)]"
        )}
      >
        {src ? (
          <img alt={alt} className="size-full object-cover" src={src} />
        ) : (
          children
        )}
      </span>
    </span>
  )
}

function MenuItemBadge({
  className,
  dir = "auto",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menu-item-badge"
      dir={dir}
      className={cn(
        "inline-flex h-[var(--bh-menu-badge-height)] shrink-0 items-center justify-center rounded-[var(--bh-radius-full)] bg-[var(--bh-bg-neutral-subtle)] px-[var(--bh-menu-badge-padding-x)] text-center text-[length:var(--bh-text-body-3xs-medium-font-size)] font-[var(--bh-text-body-3xs-medium-font-weight)] leading-[var(--bh-text-body-3xs-medium-line-height)] tracking-[var(--bh-text-body-3xs-medium-letter-spacing)] text-[var(--bh-content-default)] group-data-[disabled=true]/menu-item:opacity-[var(--bh-opacity-60)]",
        className
      )}
      {...props}
    />
  )
}

type MenuItemSwitchProps = Omit<
  React.ComponentProps<"span">,
  "aria-checked" | "aria-label" | "aria-labelledby" | "role"
> & {
  active?: boolean
  disabled?: boolean
}

function MenuItemSwitch({
  active = false,
  className,
  disabled = false,
  ...props
}: MenuItemSwitchProps) {
  return (
    <span
      aria-hidden="true"
      data-active={active ? "true" : "false"}
      data-disabled={disabled ? "true" : "false"}
      data-slot="menu-item-switch"
      className={cn(
        "flex h-[var(--bh-menu-switch-height)] w-[var(--bh-menu-switch-width)] shrink-0 items-center rounded-[var(--bh-radius-full)] p-[var(--bh-menu-switch-padding)] group-data-[disabled=true]/menu-item:bg-[var(--bh-interactive-switch-disabled)]",
        active
          ? "justify-end bg-[var(--bh-interactive-switch-active)]"
          : "bg-[var(--bh-interactive-switch-default)]",
        disabled && "bg-[var(--bh-interactive-switch-disabled)]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="menu-item-switch-handle"
        className="size-[var(--bh-menu-switch-handle-size)] rounded-[var(--bh-radius-full)] bg-[var(--bh-interactive-switch-handle)] group-data-[disabled=true]/menu-item:bg-[var(--bh-interactive-switch-handle-disabled)]"
      />
    </span>
  )
}

type MenuItemActionProps = React.ComponentProps<"button"> & {
  asChild?: boolean
  fullWidth?: boolean
}

function MenuItemAction({
  className,
  asChild = false,
  fullWidth = false,
  type,
  children,
  ...props
}: MenuItemActionProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="menu-item-action"
      className={cn(
        "inline-flex h-[var(--bh-menu-action-height)] shrink-0 items-center justify-center gap-[var(--bh-menu-action-gap)] rounded-[var(--bh-control-default)] border border-[var(--bh-border-default)] bg-[var(--bh-interactive-outlined-default)] px-[var(--bh-menu-action-padding-x)] py-[var(--bh-space-md-8)] text-[length:var(--bh-text-body-md-medium-font-size)] font-[var(--bh-text-body-md-medium-font-weight)] leading-[var(--bh-text-body-md-medium-line-height)] tracking-[var(--bh-text-body-md-medium-letter-spacing)] text-[var(--bh-content-default)] outline-none transition-[background-color,border-color,box-shadow] hover:bg-[var(--bh-interactive-outlined-hover)] focus-visible:border-[var(--bh-border-brand-strong)] disabled:pointer-events-none disabled:text-[var(--bh-content-disabled)] rtl:[&_svg[data-rtl-flip='true']]:-scale-x-100",
        fullWidth && "w-full",
        className
      )}
      {...(!asChild ? { type: type || "button" } : {})}
      {...props}
    >
      {asChild ? children : <MenuItemActionChildren>{children}</MenuItemActionChildren>}
    </Comp>
  )
}

function MenuItemActionChildren({ children }: { children: React.ReactNode }) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <span data-slot="menu-item-action-label" dir="auto" className="min-w-0 px-[var(--bh-space-xs-4)]">
          {child}
        </span>
      )
    }

    return child
  })
}

type MenuProgressProps = React.ComponentProps<"div"> & {
  indicator?: React.ReactNode
  label?: React.ReactNode
  optional?: React.ReactNode
  showSpinner?: boolean
  value?: number
}

function MenuProgress({
  className,
  indicator,
  label,
  optional,
  showSpinner = true,
  value = 50,
  ...props
}: MenuProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const labelId = React.useId()
  const hasLabel = hasRenderableContent(label)

  return (
    <div
      data-slot="menu-progress"
      className={cn(
        "flex w-full flex-col gap-[var(--bh-menu-progress-gap)]",
        className
      )}
      {...props}
    >
      <div
        aria-label={hasLabel ? undefined : "Progress"}
        aria-labelledby={hasLabel ? labelId : undefined}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={clampedValue}
        data-slot="menu-progress-track"
        role="progressbar"
        className="h-[var(--bh-menu-progress-height)] w-full overflow-hidden rounded-[var(--bh-radius-full)] bg-[var(--bh-bg-neutral-soft)]"
      >
        <span
          data-slot="menu-progress-fill"
          className="block h-full rounded-[var(--bh-radius-full)] bg-[var(--bh-interactive-indicator-default)]"
          style={{ inlineSize: `${clampedValue}%` }}
        />
      </div>

      {hasRenderableContent(label) ||
      hasRenderableContent(optional) ||
      hasRenderableContent(indicator) ||
      showSpinner ? (
        <div
          data-slot="menu-progress-row"
          className="flex min-w-0 items-center gap-[var(--bh-menu-item-slot-gap)]"
        >
          {hasRenderableContent(label) || hasRenderableContent(optional) ? (
            <span
              data-slot="menu-progress-label"
              className="flex min-w-0 flex-1 items-center gap-[var(--bh-space-xs-4)]"
            >
              {hasRenderableContent(label) ? (
                <span
                  id={labelId}
                  data-slot="menu-progress-label-text"
                  dir="auto"
                  className="truncate text-[length:var(--bh-text-body-xs-medium-font-size)] font-[var(--bh-text-body-xs-medium-font-weight)] leading-[var(--bh-text-body-xs-medium-line-height)] tracking-[var(--bh-text-body-xs-medium-letter-spacing)] text-[var(--bh-content-default)]"
                >
                  {label}
                </span>
              ) : null}
              {hasRenderableContent(optional) ? (
                <span
                  data-slot="menu-progress-optional"
                  dir="auto"
                  className="truncate text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)] text-[var(--bh-content-subtle)]"
                >
                  {optional}
                </span>
              ) : null}
            </span>
          ) : null}

          <span
            data-slot="menu-progress-indicator"
            className="flex shrink-0 items-center gap-[var(--bh-space-xxs-2)] text-[length:var(--bh-text-body-2xs-regular-font-size)] font-[var(--bh-text-body-2xs-regular-font-weight)] leading-[var(--bh-text-body-2xs-regular-line-height)] tracking-[var(--bh-text-body-2xs-regular-letter-spacing)] text-[var(--bh-content-subtle)]"
          >
            {hasRenderableContent(indicator) ? (
              <span dir="auto">{indicator}</span>
            ) : null}
            {showSpinner ? <MenuProgressSpinner /> : null}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function MenuProgressSpinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="menu-progress-spinner"
      viewBox="0 0 24 24"
      className={cn("size-[var(--bh-menu-trailing-icon-size)] animate-spin", className)}
    >
      <path
        d="M12 3a9 9 0 1 1-6.36 2.64"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="var(--bh-icon-stroke-300)"
      />
    </svg>
  )
}

type MenuLabelProps = React.ComponentProps<"div"> & {
  caption?: React.ReactNode
  label?: React.ReactNode
}

function MenuLabel({
  caption,
  children,
  className,
  label,
  role = "presentation",
  ...props
}: MenuLabelProps) {
  const isStaticMenu = React.useContext(MenuStaticContext)
  const labelContent = (
    <div
      data-slot="menu-label"
      role={role}
      className={cn(
        "flex h-[var(--bh-menu-item-label-height)] w-full items-center gap-0 bg-[var(--bh-menu-item-bg)] px-[var(--bh-menu-label-padding-x)] py-[var(--bh-space-xs-4)] text-[length:var(--bh-text-body-xs-regular-font-size)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {hasRenderableContent(label) ? (
            <span
              data-slot="menu-label-primary"
              dir="auto"
              className="min-w-0 flex-1 truncate text-start font-[var(--bh-text-body-xs-medium-font-weight)] text-[var(--bh-content-default)]"
            >
              {label}
            </span>
          ) : null}
          {hasRenderableContent(caption) ? (
            <span
              data-slot="menu-label-caption"
              dir="auto"
              className="shrink-0 whitespace-nowrap text-end font-[var(--bh-text-body-xs-regular-font-weight)] text-[var(--bh-content-subtle)]"
            >
              {caption}
            </span>
          ) : null}
        </>
      )}
    </div>
  )

  if (isStaticMenu) return labelContent

  return <DropdownMenuPrimitive.Label asChild>{labelContent}</DropdownMenuPrimitive.Label>
}

function hasRenderableContent(content: React.ReactNode) {
  return (
    content !== undefined &&
    content !== null &&
    content !== false &&
    content !== ""
  )
}

function MenuCaption({
  className,
  dir = "auto",
  role = "presentation",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="menu-caption"
      role={role}
      className="flex h-[var(--bh-menu-item-caption-height)] w-full items-center px-[var(--bh-menu-item-padding-x)]"
    >
      <span
        dir={dir}
        className={cn(
          "flex h-full min-w-0 flex-1 items-center justify-center px-[var(--bh-menu-item-content-padding)] py-[var(--bh-menu-item-content-compact-padding-y)] text-center text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)] text-[var(--bh-content-subtle)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function MenuSeparator({
  className,
  role = "separator",
  ...props
}: React.ComponentProps<"div">) {
  const isStaticMenu = React.useContext(MenuStaticContext)
  const separator = (
    <div
      data-slot="menu-separator"
      role={role}
      className={cn(
        "flex h-[var(--bh-menu-item-divider-height)] w-full items-center py-[var(--bh-menu-divider-padding-y)]",
        className
      )}
      {...props}
    >
      <span className="block w-full border-t border-[var(--bh-border-subtle)]" />
    </div>
  )

  if (isStaticMenu) return separator

  return <DropdownMenuPrimitive.Separator asChild>{separator}</DropdownMenuPrimitive.Separator>
}

export {
  Menu,
  MenuCaption,
  MenuContent,
  MenuItem,
  MenuItemAction,
  MenuItemAvatar,
  MenuItemBadge,
  MenuItemContent,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemMeta,
  MenuItemSwitch,
  MenuItemText,
  MenuItemTitle,
  MenuLabel,
  MenuProgress,
  MenuPreview,
  MenuPortal,
  MenuRoot,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuSurface,
  MenuTrigger,
  menuItemContentVariants,
  menuItemIconVariants,
  menuItemVariants,
  menuVariants,
}
export type {
  MenuItemAvatarSize,
  MenuItemAvatarProps,
  MenuItemActionProps,
  MenuContentProps,
  MenuItemContentProps,
  MenuItemIconPosition,
  MenuItemIconProps,
  MenuItemKind,
  MenuItemProps,
  MenuSubContentProps,
  MenuSubTriggerProps,
  MenuItemSwitchProps,
  MenuItemState,
  MenuLabelProps,
  MenuProgressProps,
  MenuProps,
  MenuPreviewProps,
  MenuSurfaceProps,
  MenuWidth,
}
