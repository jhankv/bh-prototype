"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const kbdVariants = cva(
  [
    "inline-flex min-w-[var(--bh-space-5xl-24)] items-center justify-center whitespace-nowrap rounded-[var(--bh-radius-md-6)]",
    "border border-[var(--bh-border-default)] bg-[var(--bh-interactive-soft-default)] text-[var(--bh-content-subtle)]",
    "[font-family:var(--bh-font-family)] text-[length:var(--bh-text-body-xs-medium-font-size)] font-[var(--bh-text-body-xs-medium-font-weight)]",
    "leading-[var(--bh-text-body-xs-medium-line-height)] tracking-[var(--bh-text-body-xs-medium-letter-spacing)] shadow-[var(--shadow-button-soft)]",
    "data-[disabled=true]:border-[var(--bh-border-disabled)] data-[disabled=true]:bg-[var(--bh-interactive-soft-disabled)] data-[disabled=true]:text-[var(--bh-content-disabled)] data-[disabled=true]:shadow-none",
  ],
  {
    variants: {
      size: {
        sm: "h-[var(--bh-space-5xl-24)] gap-[var(--bh-space-xxs-2)] px-[var(--bh-space-sm-6)]",
        md: "h-[var(--bh-space-6xl-32)] gap-[var(--bh-space-xs-4)] px-[var(--bh-space-md-8)]",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

const shortcutVariants = cva([
  "inline-flex h-[var(--bh-space-4xl-20)] min-w-[var(--bh-space-4xl-20)] shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--bh-radius-sm-4)] px-[var(--bh-space-xs-4)]",
  "border border-[var(--bh-border-default)] bg-[var(--bh-interactive-soft-default)] text-[var(--bh-content-subtle)]",
  "[font-family:var(--bh-font-family)] text-[length:var(--bh-text-body-2xs-medium-font-size)] font-[var(--bh-text-body-2xs-medium-font-weight)]",
  "leading-[var(--bh-text-body-2xs-medium-line-height)] tracking-[var(--bh-text-body-2xs-medium-letter-spacing)]",
  "data-[disabled=true]:border-[var(--bh-border-disabled)] data-[disabled=true]:bg-[var(--bh-interactive-soft-disabled)] data-[disabled=true]:text-[var(--bh-content-disabled)]",
])

type KbdProps = React.ComponentProps<"kbd"> &
  VariantProps<typeof kbdVariants> & {
    disabled?: boolean
  }

const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, disabled = false, size, ...props },
  ref
) {
  return (
    <kbd
      data-disabled={disabled ? "true" : undefined}
      data-slot="kbd"
      ref={ref}
      className={cn(kbdVariants({ size, className }))}
      {...props}
    />
  )
})

type ShortcutPlatform = "auto" | "mac" | "windows" | "linux"

type ShortcutProps = Omit<React.ComponentProps<"kbd">, "children"> & {
  children?: React.ReactNode
  disabled?: boolean
  keys?: readonly string[]
  platform?: ShortcutPlatform
}

const Shortcut = React.forwardRef<HTMLElement, ShortcutProps>(function Shortcut(
  {
    "aria-label": ariaLabel,
    children,
    className,
    disabled = false,
    keys = [],
    platform = "auto",
    ...props
  },
  ref
) {
  const resolvedPlatform = useShortcutPlatform(platform)
  const resolvedKeys = keys.map((key) =>
    resolveShortcutKey(key, resolvedPlatform)
  )
  const content =
    children ?? formatShortcutKeys(resolvedKeys, resolvedPlatform)
  const accessibleLabel =
    ariaLabel ??
    (resolvedKeys.length > 0
      ? resolvedKeys.map(readableShortcutKey).join(" plus ")
      : typeof children === "string"
        ? readableShortcutText(children)
        : undefined)

  return (
    <kbd
      aria-label={accessibleLabel}
      className={cn(shortcutVariants(), className)}
      data-disabled={disabled ? "true" : undefined}
      data-platform={resolvedPlatform}
      data-slot="shortcut"
      dir="ltr"
      ref={ref}
      {...props}
    >
      {content}
    </kbd>
  )
})

type KbdShortcutProps = Omit<React.ComponentProps<"span">, "children"> & {
  disabled?: boolean
  keys: readonly string[]
  platform?: ShortcutPlatform
  size?: KbdProps["size"]
}

const KbdShortcut = React.forwardRef<HTMLSpanElement, KbdShortcutProps>(
  function KbdShortcut(
    {
      "aria-label": ariaLabel,
      className,
      disabled = false,
      keys,
      platform = "auto",
      size = "sm",
      ...props
    },
    ref
  ) {
    const resolvedPlatform = useShortcutPlatform(platform)

    const resolvedKeys = keys.map((key) =>
      resolveShortcutKey(key, resolvedPlatform)
    )
    const accessibleLabel =
      ariaLabel ?? resolvedKeys.map(readableShortcutKey).join(" plus ")

    return (
      <span
        aria-label={accessibleLabel}
        className={cn(
          "inline-flex shrink-0 items-center gap-[var(--bh-space-xs-4)]",
          className
        )}
        data-disabled={disabled ? "true" : undefined}
        data-platform={resolvedPlatform}
        data-slot="kbd-shortcut"
        dir="ltr"
        ref={ref}
        role="group"
        {...props}
      >
        {resolvedKeys.map((key, index) => (
          <Kbd
            aria-hidden="true"
            disabled={disabled}
            key={`${key}-${index}`}
            size={size}
          >
            {key}
          </Kbd>
        ))}
      </span>
    )
  }
)

function useShortcutPlatform(
  platform: ShortcutPlatform
): Exclude<ShortcutPlatform, "auto"> {
  const [resolvedPlatform, setResolvedPlatform] = React.useState<
    Exclude<ShortcutPlatform, "auto">
  >(platform === "auto" ? "mac" : platform)

  React.useEffect(() => {
    if (platform !== "auto") {
      setResolvedPlatform(platform)
      return
    }

    setResolvedPlatform(detectShortcutPlatform())
  }, [platform])

  return resolvedPlatform
}

function detectShortcutPlatform(): Exclude<ShortcutPlatform, "auto"> {
  if (typeof navigator === "undefined") return "mac"
  const platform = navigator.platform.toLowerCase()
  if (
    platform.includes("mac") ||
    platform.includes("iphone") ||
    platform.includes("ipad")
  ) {
    return "mac"
  }
  if (platform.includes("linux")) return "linux"
  return "windows"
}

function resolveShortcutKey(
  key: string,
  platform: Exclude<ShortcutPlatform, "auto">
) {
  if (key !== "Mod") return key
  return platform === "mac" ? "⌘" : "Ctrl"
}

function readableShortcutKey(key: string) {
  if (key === "⌘") return "Command"
  if (key === "⌥") return "Option"
  if (key === "⇧") return "Shift"
  if (key === "⌃") return "Control"
  return key
}

function formatShortcutKeys(
  keys: readonly string[],
  platform: Exclude<ShortcutPlatform, "auto">
) {
  if (platform === "mac" && keys.slice(0, -1).every(isMacShortcutSymbol)) {
    return keys.join("")
  }

  return keys.join(" ")
}

function isMacShortcutSymbol(key: string) {
  return ["⌘", "⌥", "⇧", "⌃"].includes(key)
}

function readableShortcutText(value: string) {
  return value
    .replaceAll("⌘", "Command ")
    .replaceAll("⌥", "Option ")
    .replaceAll("⇧", "Shift ")
    .replaceAll("⌃", "Control ")
    .trim()
}

export { Kbd, KbdShortcut, Shortcut, kbdVariants, shortcutVariants }
export type {
  KbdProps,
  KbdShortcutProps,
  ShortcutPlatform,
  ShortcutProps,
}
