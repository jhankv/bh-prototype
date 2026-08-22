import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PlusIcon, XIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type TagType = "simple" | "dot" | "flag" | "avatar" | "icon"
type TagSize = "xs" | "md" | "lg"
type TagState = "default" | "active" | "disabled"

const tagVariants = cva(
  [
    "relative inline-flex min-w-0 shrink-0 items-center whitespace-nowrap border outline-none",
    "rounded-[var(--bh-control-default)] text-[var(--bh-content-default)]",
    "transition-[background-color,border-color,color,box-shadow]",
    "after:pointer-events-none after:absolute after:inset-[var(--bh-tag-focus-ring-inset)] after:rounded-[inherit] after:border-[length:var(--bh-tag-focus-ring-width)] after:border-transparent after:content-['']",
    "focus-visible:border-[var(--bh-border-brand-strong)] focus-visible:after:border-[var(--bh-border-focus)] focus-visible:after:opacity-[var(--bh-opacity-30)]",
    "rtl:[&_svg[data-rtl-flip='true']]:-scale-x-100",
  ],
  {
    variants: {
      type: {
        simple: "justify-center gap-[var(--bh-space-none)]",
        dot: "justify-start gap-[var(--bh-space-none)]",
        flag: "justify-start gap-[var(--bh-space-xs-4)]",
        avatar: "justify-start gap-[var(--bh-space-xs-4)]",
        icon: "justify-start gap-[var(--bh-space-xs-4)]",
      },
      size: {
        xs: [
          "h-[var(--bh-space-5xl-24)] rounded-[var(--bh-control-md)]",
          "text-[length:var(--bh-text-body-xs-medium-font-size)]",
          "font-[var(--bh-text-body-xs-medium-font-weight)]",
          "leading-[var(--bh-text-body-xs-medium-line-height)]",
          "tracking-[var(--bh-text-body-xs-medium-letter-spacing)]",
        ],
        md: [
          "h-[calc(var(--bh-space-5xl-24)+var(--bh-space-xs-4))]",
          "text-[length:var(--bh-text-body-sm-medium-font-size)]",
          "font-[var(--bh-text-body-sm-medium-font-weight)]",
          "leading-[var(--bh-text-body-sm-medium-line-height)]",
          "tracking-[var(--bh-text-body-sm-medium-letter-spacing)]",
        ],
        lg: [
          "h-[calc(var(--bh-space-5xl-24)+var(--bh-space-xl-12))]",
          "text-[length:var(--bh-text-body-md-medium-font-size)]",
          "font-[var(--bh-text-body-md-medium-font-weight)]",
          "leading-[var(--bh-text-body-md-medium-line-height)]",
          "tracking-[var(--bh-text-body-md-medium-letter-spacing)]",
        ],
      },
      state: {
        default:
          "border-[var(--bh-border-default)] bg-[var(--bh-interactive-secondary-default)] hover:border-transparent hover:bg-[var(--bh-interactive-secondary-hover)]",
        active:
          "border-[length:var(--bh-tag-active-border-width)] border-[var(--bh-border-brand-strong)] bg-[var(--bh-bg-brand-subtle)] text-[var(--bh-content-brand-default)]",
        disabled:
          "pointer-events-none border-[var(--bh-border-disabled)] bg-[var(--bh-interactive-secondary-disabled)] text-[var(--bh-content-disabled)]",
      },
      showCloseButton: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        type: "simple",
        showCloseButton: false,
        size: "xs",
        class: "px-[var(--bh-space-md-8)]",
      },
      {
        type: "simple",
        showCloseButton: false,
        size: ["md", "lg"],
        class: "px-[var(--bh-space-xl-12)]",
      },
      {
        type: "simple",
        showCloseButton: true,
        size: "xs",
        class:
          "gap-[var(--bh-space-xs-4)] ps-[var(--bh-space-md-8)] pe-[var(--bh-space-xs-4)]",
      },
      {
        type: "simple",
        showCloseButton: true,
        size: "md",
        class:
          "gap-[var(--bh-space-xs-4)] ps-[var(--bh-space-lg-10)] pe-[var(--bh-space-md-8)]",
      },
      {
        type: "simple",
        showCloseButton: true,
        size: "lg",
        class:
          "gap-[var(--bh-space-xs-4)] ps-[var(--bh-space-xl-12)] pe-[var(--bh-space-md-8)]",
      },
      {
        type: ["dot", "flag", "avatar", "icon"],
        showCloseButton: false,
        size: "xs",
        class: "ps-[var(--bh-space-sm-6)] pe-[var(--bh-space-md-8)]",
      },
      {
        type: ["dot", "flag", "avatar", "icon"],
        showCloseButton: false,
        size: "md",
        class: "ps-[var(--bh-space-sm-6)] pe-[var(--bh-space-xl-12)]",
      },
      {
        type: ["dot", "flag", "avatar", "icon"],
        showCloseButton: false,
        size: "lg",
        class: "ps-[var(--bh-space-md-8)] pe-[var(--bh-space-xl-12)]",
      },
      {
        type: ["dot", "flag", "avatar", "icon"],
        showCloseButton: true,
        size: ["xs", "md"],
        class: "px-[var(--bh-space-sm-6)]",
      },
      {
        type: ["dot", "flag", "avatar", "icon"],
        showCloseButton: true,
        size: "lg",
        class: "px-[var(--bh-space-md-8)]",
      },
    ],
    defaultVariants: {
      type: "simple",
      size: "md",
      state: "default",
      showCloseButton: false,
    },
  }
)

type TagProps = Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof tagVariants> & {
    asChild?: boolean
    avatar?: React.ReactNode
    children?: React.ReactNode
    closeLabel?: string
    disabled?: boolean
    flag?: React.ReactNode
    icon?: React.ReactNode
    onClose?: React.MouseEventHandler<HTMLButtonElement>
  }

type TagContentProps = {
  avatar?: React.ReactNode
  children: React.ReactNode
  closeLabel?: string
  disabled: boolean
  flag?: React.ReactNode
  icon?: React.ReactNode
  onClose?: React.MouseEventHandler<HTMLButtonElement>
  showCloseButton: boolean
  type: TagType
}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag({
  asChild = false,
  avatar,
  children,
  className,
  closeLabel,
  dir = "auto",
  disabled = false,
  flag,
  icon,
  onClose,
  showCloseButton = false,
  size = "md",
  state = "default",
  type = "simple",
  ...props
}, ref) {
  const Comp = asChild ? Slot : "span"
  const resolvedType = (type || "simple") as TagType
  const isDisabled = disabled || state === "disabled"
  const resolvedState = isDisabled ? "disabled" : ((state || "default") as TagState)

  return (
    <Comp
      aria-disabled={isDisabled || undefined}
      data-disabled={isDisabled ? "true" : undefined}
      data-size={size}
      data-slot="tag"
      data-state={resolvedState}
      data-type={resolvedType}
      dir={dir}
      ref={ref}
      className={cn(
        tagVariants({
          type: resolvedType,
          size,
          state: resolvedState,
          showCloseButton,
        }),
        className
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <TagContent
          avatar={avatar}
          closeLabel={closeLabel}
          disabled={isDisabled}
          flag={flag}
          icon={icon}
          onClose={onClose}
          showCloseButton={Boolean(showCloseButton)}
          type={resolvedType}
        >
          {children}
        </TagContent>
      )}
    </Comp>
  )
})

function TagContent({
  avatar,
  children,
  closeLabel,
  disabled,
  flag,
  icon,
  onClose,
  showCloseButton,
  type,
}: TagContentProps) {
  return (
    <>
      {type === "dot" ? <TagDot /> : null}
      {type === "flag" ? <TagFlag>{flag}</TagFlag> : null}
      {type === "avatar" ? <TagAvatar>{avatar}</TagAvatar> : null}
      {type === "icon" ? <TagIcon>{icon}</TagIcon> : null}
      {renderTagChildren(children)}
      {showCloseButton ? (
        <TagCloseButton
          disabled={disabled}
          label={closeLabel}
          offset={type === "dot"}
          onClick={onClose}
        />
      ) : null}
    </>
  )
}

function renderTagChildren(
  children: React.ReactNode,
  keyPrefix = "tag-label"
): React.ReactNode[] {
  const renderedChildren: React.ReactNode[] = []

  React.Children.toArray(children).forEach((child, index) => {
    if (
      typeof child === "string" ||
      typeof child === "number" ||
      typeof child === "bigint"
    ) {
      renderedChildren.push(
        <span
          key={`${keyPrefix}-${index}`}
          data-slot="tag-label"
          dir="auto"
          className="min-w-0 truncate"
        >
          {child}
        </span>
      )

      return
    }

    if (
      React.isValidElement<{ children?: React.ReactNode }>(child) &&
      child.type === React.Fragment
    ) {
      renderedChildren.push(
        ...renderTagChildren(child.props.children, `${keyPrefix}-${index}`)
      )

      return
    }

    renderedChildren.push(child)
  })

  return renderedChildren
}

function TagDot({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="tag-dot"
      className={cn(
        "flex size-[var(--bh-space-4xl-20)] shrink-0 items-center justify-center",
        className
      )}
      {...props}
    >
      <span className="size-[var(--bh-space-md-8)] rounded-[var(--bh-radius-full)] bg-[var(--bh-bg-accent-green-default)]" />
    </span>
  )
}

function TagFlag({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tag-flag"
      aria-hidden={children ? undefined : "true"}
      className={cn(
        "flex size-[var(--bh-space-4xl-20)] shrink-0 items-center justify-center overflow-hidden rounded-[var(--bh-radius-xs-2)] bg-[var(--bh-bg-neutral-subtle)] text-[var(--bh-content-muted)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="grid size-full grid-rows-3">
          <span className="bg-[var(--bh-bg-danger-default)]" />
          <span className="bg-[var(--bh-bg-always-white)]" />
          <span className="bg-[var(--bh-bg-always-dark)]" />
        </span>
      )}
    </span>
  )
}

function TagAvatar({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tag-avatar"
      className={cn(
        "flex size-[var(--bh-space-4xl-20)] shrink-0 items-center justify-center overflow-hidden rounded-[var(--bh-radius-full)] border border-[var(--bh-border-subtle)] bg-[var(--bh-bg-neutral-bold)] text-[length:var(--bh-text-body-3xs-semibold-font-size)] font-[var(--bh-text-body-3xs-semibold-font-weight)] leading-[var(--bh-text-body-3xs-semibold-line-height)] text-[var(--bh-content-on-neutral)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

function TagIcon({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tag-icon"
      className={cn(
        "flex size-[var(--bh-space-4xl-20)] shrink-0 items-center justify-center text-current [&_svg]:size-[var(--bh-space-4xl-20)] [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children ?? <PlusIcon aria-hidden="true" strokeWidth="var(--bh-icon-stroke-225)" />}
    </span>
  )
}

function TagCloseButton({
  className,
  disabled,
  label,
  offset,
  type,
  ...props
}: React.ComponentProps<"button"> & {
  label?: string
  offset?: boolean
}) {
  return (
    <button
      aria-label={label}
      data-slot="tag-close"
      disabled={disabled}
      type={type || "button"}
      className={cn(
        "relative z-[var(--bh-z-raised)] inline-flex size-[var(--bh-space-3xl-16)] shrink-0 items-center justify-center rounded-[var(--bh-radius-full)] text-current outline-none transition-[background-color,box-shadow]",
        "hover:bg-[var(--bh-interactive-ghost-hover)] focus-visible:shadow-[var(--shadow-button-focus)] disabled:pointer-events-none",
        offset && "ms-[var(--bh-space-xs-4)]",
        className
      )}
      {...props}
    >
      <XIcon
        aria-hidden="true"
        className="size-[var(--bh-space-xl-12)]"
        strokeWidth="var(--bh-icon-stroke-200)"
      />
    </button>
  )
}

export {
  Tag,
  TagAvatar,
  TagCloseButton,
  TagDot,
  TagFlag,
  TagIcon,
  tagVariants,
}
export type { TagProps, TagSize, TagState, TagType }
