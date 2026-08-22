"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { useResolvedDirection } from "@/hooks/use-direction"

import "./tabs.css"

export type TabsVariant = "underline" | "segment" | "rounded"
export type TabsSize = "md" | "sm" | "xs"

export type TabsItem = {
  content?: React.ReactNode
  disabled?: boolean
  label: React.ReactNode
  value?: string
}

type RadixTabsRootProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Root
>

type TabsRootProps = React.ComponentProps<typeof TabsPrimitive.Root>
type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  fullWidth?: boolean
  size?: TabsSize
  variant?: TabsVariant
}
type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
>
type TabsContentProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
>

type TabsProps = Omit<
  RadixTabsRootProps,
  "defaultValue" | "dir" | "onValueChange" | "value"
> & {
  activeIndex?: number
  ariaLabel?: string
  className?: string
  defaultActiveIndex?: number
  defaultValue?: string
  dir?: "ltr" | "rtl"
  fullWidth?: boolean
  items?: Array<string | TabsItem>
  onActiveIndexChange?: (index: number) => void
  onValueChange?: (value: string) => void
  rootClassName?: string
  size?: TabsSize
  value?: string
  variant?: TabsVariant
}

const TabsRoot = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(function TabsList(
  {
    className,
    dir,
    fullWidth = false,
    size = "md",
    variant = "underline",
    ...props
  },
  ref
) {
  const isRtl = dir === "rtl"

  return (
    <TabsPrimitive.List
      data-size={size}
      data-slot="tabs-list"
      data-variant={variant}
      dir={dir}
      ref={ref}
      className={cn(
        "ds-tabs",
        `ds-tabs--${variant}`,
        `ds-tabs--${size}`,
        fullWidth ? "ds-tabs--full" : "ds-tabs--hug",
        isRtl ? "ds-tabs--rtl" : dir === "ltr" ? "ds-tabs--ltr" : undefined,
        className
      )}
      {...props}
    />
  )
})

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(function TabsTrigger({ children, className, dir = "auto", ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      ref={ref}
      className={cn("ds-tabs__tab", className)}
      {...props}
    >
      <span className="ds-tabs__content">
        <span className="ds-tabs__label" dir={dir}>
          {children}
        </span>
      </span>
    </TabsPrimitive.Trigger>
  )
})

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      ref={ref}
      className={cn("ds-tabs__panel", className)}
      {...props}
    />
  )
})

function Tabs({
  activeIndex,
  ariaLabel,
  children,
  className = "",
  defaultActiveIndex = 0,
  defaultValue,
  dir,
  fullWidth = false,
  items = [],
  onActiveIndexChange,
  onValueChange,
  rootClassName,
  size = "md",
  value,
  variant = "underline",
  ...props
}: TabsProps) {
  const rootRef = React.useRef<React.ElementRef<typeof TabsPrimitive.Root>>(null)
  const resolvedDirection = useResolvedDirection(dir, rootRef)
  const normalizedItems = items.map(normalizeTabsItem)
  const activeValue =
    value ?? (activeIndex === undefined ? undefined : normalizedItems[activeIndex]?.value)
  const uncontrolledDefaultValue =
    defaultValue ??
    normalizedItems[defaultActiveIndex]?.value ??
    normalizedItems[0]?.value

  function handleValueChange(nextValue: string) {
    onValueChange?.(nextValue)

    const nextIndex = normalizedItems.findIndex((item) => item.value === nextValue)
    if (nextIndex >= 0) {
      onActiveIndexChange?.(nextIndex)
    }
  }

  return (
    <TabsRoot
      data-slot="tabs-root"
      defaultValue={activeValue === undefined ? uncontrolledDefaultValue : undefined}
      dir={resolvedDirection}
      ref={rootRef}
      value={activeValue}
      onValueChange={handleValueChange}
      className={rootClassName}
      {...props}
    >
      <TabsList
        aria-label={ariaLabel}
        className={className}
        dir={resolvedDirection}
        fullWidth={fullWidth}
        size={size}
        variant={variant}
      >
        {normalizedItems.map((item) => (
          <TabsTrigger
            disabled={item.disabled}
            key={item.value}
            value={item.value}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {normalizedItems.map((item) => (
        <TabsContent key={`${item.value}-panel`} value={item.value}>
          {item.content ?? null}
        </TabsContent>
      ))}
      {children}
    </TabsRoot>
  )
}

function normalizeTabsItem(item: string | TabsItem, index: number): TabsItem & {
  value: string
} {
  if (typeof item === "string") {
    return {
      label: item,
      value: getTabsItemValue(item, index),
    }
  }

  return {
    ...item,
    value: item.value ?? getTabsItemValue(item.label, index),
  }
}

function getTabsItemValue(label: React.ReactNode, index: number) {
  if (typeof label !== "string") return `tab-${index}`

  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return slug || `tab-${index}`
}

export { Tabs, TabsContent, TabsList, TabsRoot, TabsTrigger }
export type {
  TabsContentProps,
  TabsListProps,
  TabsProps,
  TabsRootProps,
  TabsTriggerProps,
}
