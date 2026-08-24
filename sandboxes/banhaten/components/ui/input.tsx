import * as React from "react"
import { cva } from "class-variance-authority"
import {
  AtSignIcon,
  ChevronDownIcon,
  InfoIcon,
  MinusIcon as LucideMinusIcon,
  PlusIcon as LucidePlusIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Shortcut } from "@/components/ui/kbd"
import {
  getInputDefaultValue,
  getInputHelperText,
  getInputPlaceholder,
  getInputTags,
  inputCopy,
  type InputKind,
  type InputTag,
  type InputVisualState,
} from "./input-content"

type ControlDensity = "compact" | "default" | "comfortable"
type InputSize = "md" | "lg" | "comfortable"
type InputVariant = "default" | "soft"

type InputNativeProps = Omit<
  React.ComponentProps<"input">,
  "className" | "dir" | "size"
>

type InputModeRenderProps = {
  buttonLabel?: React.ReactNode
  inlineLeadingAddon?: React.ReactNode
  inlineTagsClassName?: string
  inlineTrailingAddon?: React.ReactNode
  leadingAddon?: React.ReactNode
  quantityLabel?: React.ReactNode
  shortcut?: React.ReactNode
  shortcutKeys?: readonly string[]
  tags?: InputTag[]
  trailingAddon?: React.ReactNode
}

type InputKindSpecificProps = InputModeRenderProps &
  (
    | { kind?: "default" }
    | { kind: "shortcut" }
    | { kind: "add-on" }
    | { kind: "inline-add-on" }
    | { kind: "tags" | "inline-tags" }
    | {
        kind:
          | "leading-dropdown"
          | "trailing-dropdown"
          | "leading-button"
          | "trailing-button"
      }
    | { kind: "quantity" | "quantity-2" }
  )

type InputDynamicKindProps = { kind?: InputKind } & InputModeRenderProps

type InputCommonProps = InputNativeProps & {
  className?: string
  controlClassName?: string
  density?: ControlDensity
  helperClassName?: string
  labelClassName?: string
  surfaceClassName?: string
  errorMessage?: React.ReactNode
  hasHelperText?: boolean
  /** @deprecated Use showInfo or an explicit trailingIcon. */
  hasInformationIcon?: boolean
  /** @deprecated Use showAtSign or an explicit leadingIcon. */
  hasLeadingIcon?: boolean
  hasLabel?: boolean
  isOptional?: boolean
  isRequired?: boolean
  label?: React.ReactNode
  leadingIcon?: React.ReactNode | false
  message?: React.ReactNode
  optionalText?: React.ReactNode
  showAtSign?: boolean
  showInfo?: boolean
  size?: InputSize
  state?: InputVisualState
  trailingIcon?: React.ReactNode | false
  valueText?: string
  variant?: InputVariant
  dir?: "ltr" | "rtl" | "auto"
}

type InputProps = InputCommonProps & (InputKindSpecificProps | InputDynamicKindProps)

const inputRoot = cva("grid w-[var(--bh-input-width)] max-w-full")

const inputSurface = cva(
  [
    "group/input-surface relative flex w-full overflow-hidden rounded-[var(--bh-input-radius)]",
    "transition-[background-color,box-shadow]",
    "[--bh-input-border:var(--bh-border-input)] [--shadow-input:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-input-border,var(--bh-border-input)),var(--shadow-component-default)]",
    "[--shadow-input-surface:var(--shadow-component-default)]",
    "[--shadow-input-overlay:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-input-border,var(--bh-border-input))]",
    "[--shadow-input-focus-surface:var(--shadow-input-focus-ring)]",
    "[--shadow-input-focus-overlay:none]",
    "[--shadow-input-disabled-overlay:inset_0px_0px_0px_var(--bh-border-width-default)_var(--bh-border-disabled)]",
    "after:pointer-events-none after:absolute after:inset-0 after:z-[var(--bh-z-raised)] after:rounded-[inherit] after:[box-shadow:var(--shadow-input-overlay)] after:content-['']",
    "focus-within:shadow-[var(--shadow-input-focus-surface)] focus-within:after:[box-shadow:var(--shadow-input-focus-overlay)]",
  ],
  {
    variants: {
      size: {
        md: "h-[var(--bh-input-md-height)]",
        lg: "h-[var(--bh-input-lg-height)]",
        comfortable: "h-[var(--bh-input-comfortable-height)]",
      },
      variant: {
        default: "bg-[var(--bh-interactive-input-default)]",
        soft: "bg-[var(--bh-interactive-input-soft)]",
      },
      state: {
        default:
          "shadow-[var(--shadow-input-surface)]",
        filled:
          "shadow-[var(--shadow-input-surface)]",
        error:
          "[--bh-input-border:var(--bh-border-danger-strong)] shadow-[var(--shadow-input-surface)] focus-within:shadow-[var(--shadow-input-surface)] focus-within:after:[box-shadow:var(--shadow-input-overlay)]",
        disabled:
          "[--bh-input-border:var(--bh-border-disabled)] bg-[var(--bh-interactive-input-disabled)] shadow-none after:[box-shadow:var(--shadow-input-disabled-overlay)]",
      },
    },
    compoundVariants: [
      {
        variant: "soft",
        state: "disabled",
        class: "bg-[var(--bh-interactive-input-soft-disabled)]",
      },
    ],
    defaultVariants: {
      size: "lg",
      state: "default",
      variant: "default",
    },
  }
)

const inputContent = cva(
  "flex min-w-0 flex-1 items-center gap-[var(--bh-input-content-gap)]",
  {
    variants: {
      size: {
        md: "px-[var(--bh-input-md-padding-x)]",
        lg: "px-[var(--bh-input-lg-padding-x)]",
        comfortable: "px-[var(--bh-input-comfortable-padding-x)]",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
)

const inputControl = cva(
  [
    "min-w-0 flex-1 border-0 bg-transparent p-0 text-start",
    "text-[length:var(--bh-text-body-md-regular-font-size)]",
    "font-[var(--bh-text-body-md-regular-font-weight)]",
    "leading-[var(--bh-text-body-md-regular-line-height)]",
    "tracking-[var(--bh-text-body-md-regular-letter-spacing)]",
    "text-[var(--bh-content-default)] outline-none",
    "placeholder:text-[var(--bh-content-muted)]",
    "disabled:cursor-not-allowed disabled:text-[var(--bh-content-disabled)] disabled:placeholder:text-[var(--bh-content-disabled)]",
  ]
)

const inputTag = cva(
  [
    "inline-flex h-[var(--bh-input-tag-height)] shrink-0 items-center rounded-[var(--bh-control-md)] border border-solid",
    "border-[var(--bh-border-default)] bg-[var(--bh-interactive-secondary-default)] px-[var(--bh-input-tag-padding-x)]",
    "text-[length:var(--bh-text-body-xs-medium-font-size)]",
    "font-[var(--bh-text-body-xs-medium-font-weight)]",
    "leading-[var(--bh-text-body-xs-medium-line-height)]",
    "tracking-[var(--bh-text-body-xs-medium-letter-spacing)]",
    "text-[var(--bh-content-default)]",
  ],
  {
    variants: {
      disabled: {
        true:
          "border-[var(--bh-border-disabled)] bg-[var(--bh-interactive-secondary-disabled)] text-[var(--bh-content-disabled)]",
        false: "",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
)

const inputSegment = cva(
  [
    "inline-flex h-full shrink-0 items-center justify-center gap-[var(--bh-input-segment-gap)]",
    "bg-transparent px-[var(--bh-input-segment-padding-x)]",
    "text-[length:var(--bh-text-body-md-regular-font-size)]",
    "font-[var(--bh-text-body-md-regular-font-weight)]",
    "leading-[var(--bh-text-body-md-regular-line-height)]",
    "tracking-[var(--bh-text-body-md-regular-letter-spacing)]",
    "text-[var(--bh-content-subtle)]",
    "disabled:text-[var(--bh-content-disabled)]",
  ],
  {
    variants: {
      side: {
        leading: "border-e border-[var(--bh-border-input)]",
        trailing: "border-s border-[var(--bh-border-input)]",
      },
      interactive: {
        true:
          "outline-none transition-[background-color,color] hover:bg-[var(--bh-interactive-secondary-hover)] focus-visible:bg-[var(--bh-interactive-secondary-hover)]",
        false: "",
      },
      disabled: {
        true:
          "border-[var(--bh-border-disabled)] text-[var(--bh-content-disabled)]",
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
      side: "leading",
      disabled: false,
    },
  }
)

const inputStepperButton = cva(
  [
    "inline-flex h-full w-[var(--bh-input-stepper-width,var(--bh-input-lg-height))] shrink-0 items-center justify-center",
    "bg-transparent text-[var(--bh-content-subtle)]",
    "outline-none transition-[background-color,color]",
    "hover:bg-[var(--bh-interactive-secondary-hover)] focus-visible:bg-[var(--bh-interactive-secondary-hover)]",
    "disabled:border-[var(--bh-border-disabled)] disabled:bg-transparent disabled:text-[var(--bh-content-disabled)]",
  ],
  {
    variants: {
      side: {
        leading: "border-e border-[var(--bh-border-input)]",
        trailing: "border-s border-[var(--bh-border-input)]",
      },
    },
    defaultVariants: {
      side: "trailing",
    },
  }
)

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      controlClassName,
      helperClassName,
      inlineTagsClassName,
      labelClassName,
      surfaceClassName,
      buttonLabel,
      defaultValue,
      density,
      dir,
      disabled,
      errorMessage,
      hasHelperText,
      hasInformationIcon,
      hasLeadingIcon,
      hasLabel,
      id,
      inlineLeadingAddon,
      inlineTrailingAddon,
      isOptional = false,
      isRequired = false,
      kind = "default",
      label,
      leadingAddon,
      leadingIcon,
      message,
      optionalText,
      placeholder,
      quantityLabel,
      readOnly,
      required,
      shortcut,
      shortcutKeys = inputCopy.shortcutKeys,
      showAtSign = false,
      showInfo = false,
      size,
      state = "default",
      tags,
      trailingAddon,
      trailingIcon,
      value,
      valueText,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const resolvedSize = resolveInputSize(density, size)
    const inputId = id || generatedId
    const helperId = `${inputId}-helper`
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const resolvedDir = dir
    const visualState = disabled ? "disabled" : state
    const isDisabled = visualState === "disabled"
    const isInvalid = visualState === "error" && !isDisabled
    const isTagInput = kind === "tags" || kind === "inline-tags"
    const selectedLabel = label
    const selectedOptionalText = optionalText
    const inferredPlaceholder = getInputPlaceholder({
      placeholder,
    })
    const inferredDefaultValue = getInputDefaultValue({
      defaultValue,
      isTagInput,
      state: visualState,
      value,
      valueText,
    })
    const helperText = getInputHelperText({
      errorMessage,
      isInvalid,
      message,
    })
    const shouldRenderLabel = hasLabel ?? hasRenderableContent(selectedLabel)
    const shouldRenderHelperText =
      hasHelperText ?? hasRenderableContent(helperText)
    const selectedTags = getInputTags({ kind, tags })
    const shouldShowLeadingIcon =
      shouldRenderLeadingIcon(kind) &&
      leadingIcon !== false &&
      (hasRenderableContent(leadingIcon) || showAtSign || Boolean(hasLeadingIcon))
    const shouldShowInformationIcon = shouldRenderInfoIcon(
      kind,
      trailingIcon !== false &&
        (hasRenderableContent(trailingIcon) || showInfo || Boolean(hasInformationIcon))
    )

    function focusInput() {
      if (!isDisabled) inputRef.current?.focus()
    }

    function setInputRef(node: HTMLInputElement | null) {
      inputRef.current = node

      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    return (
      <div
        data-kind={kind}
        data-density={density}
        data-size={resolvedSize}
        data-slot="input-root"
        data-state={visualState}
        data-variant={variant}
        dir={resolvedDir}
        className={cn(inputRoot(), className)}
      >
        {shouldRenderLabel ? (
          <InputLabel
            className={labelClassName}
            htmlFor={inputId}
            isOptional={isOptional}
            isRequired={isRequired || Boolean(required)}
            label={selectedLabel}
            optionalText={selectedOptionalText}
          />
        ) : null}

        <div
          data-slot="input-body"
          className={cn(
            "grid",
            shouldRenderLabel && "mt-[var(--bh-input-label-gap)]",
            selectedTags.inline.length > 0
              ? "gap-[var(--bh-input-inline-tags-gap)]"
              : "gap-[var(--bh-input-helper-gap)]"
          )}
        >
          <div
            aria-disabled={isDisabled || undefined}
            data-slot="input-surface"
            data-state={visualState}
            className={cn(
              inputSurface({
                size: resolvedSize,
                state: visualState,
                variant,
              }),
              surfaceClassName
            )}
            onClick={focusInput}
          >
            {renderLeadingSegment({
              buttonLabel,
              disabled: isDisabled,
              kind,
              leadingAddon,
              quantityLabel,
              size: resolvedSize,
              trailingAddon,
            })}

            <span
              data-slot="input-content"
              className={cn(
                inputContent({ size: resolvedSize }),
                kind === "shortcut" &&
                  resolvedSize === "lg" &&
                  "px-[var(--bh-input-md-padding-x)]"
              )}
            >
              {shouldShowLeadingIcon ? (
                <InputLeadingIcon disabled={isDisabled} icon={leadingIcon} />
              ) : null}

              {kind === "inline-add-on" &&
              hasRenderableContent(inlineLeadingAddon) ? (
                <InputInlineAddon disabled={isDisabled}>
                  {inlineLeadingAddon}
                </InputInlineAddon>
              ) : null}

              {selectedTags.inside.length > 0 ? (
                <InputTagList disabled={isDisabled} tags={selectedTags.inside} />
              ) : null}

              <input
                aria-describedby={shouldRenderHelperText ? helperId : undefined}
                aria-invalid={isInvalid || undefined}
                data-slot="input-control"
                data-state={visualState}
                defaultValue={inferredDefaultValue}
                disabled={isDisabled}
                id={inputId}
                placeholder={inferredPlaceholder}
                readOnly={readOnly}
                ref={setInputRef}
                required={required}
                value={value}
                className={cn(inputControl(), controlClassName)}
                {...props}
              />

              {kind === "inline-add-on" &&
              hasRenderableContent(inlineTrailingAddon) ? (
                <InputInlineAddon disabled={isDisabled}>
                  {inlineTrailingAddon}
                </InputInlineAddon>
              ) : null}

              {shouldShowInformationIcon ? (
                <InputInfoIcon
                  disabled={isDisabled}
                  invalid={isInvalid}
                  icon={trailingIcon}
                />
              ) : null}

              {kind === "shortcut" ? (
                hasRenderableContent(shortcut) ? (
                  <Shortcut disabled={isDisabled}>{shortcut}</Shortcut>
                ) : (
                  <Shortcut disabled={isDisabled} keys={shortcutKeys} />
                )
              ) : null}
            </span>

            {renderTrailingSegment({
              buttonLabel,
              disabled: isDisabled,
              kind,
              leadingAddon,
              quantityLabel,
              size: resolvedSize,
              trailingAddon,
            })}
          </div>

          {selectedTags.inline.length > 0 ? (
            <InputTagList
              className={inlineTagsClassName}
              disabled={isDisabled}
              inline
              tags={selectedTags.inline}
            />
          ) : null}

          {shouldRenderHelperText ? (
            <InputHelperText
              className={helperClassName}
              id={helperId}
              invalid={isInvalid}
            >
              {helperText}
            </InputHelperText>
          ) : null}
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

function InputLabel({
  className,
  htmlFor,
  isOptional,
  isRequired,
  label,
  optionalText,
}: {
  className?: string
  htmlFor: string
  isOptional: boolean
  isRequired: boolean
  label: React.ReactNode
  optionalText: React.ReactNode
}) {
  return (
    <label
      data-slot="input-label"
      htmlFor={htmlFor}
      className={cn(
        "flex w-full items-center gap-[var(--bh-input-inline-gap)] text-start",
        className
      )}
    >
      <span
        data-slot="input-label-text"
        dir="auto"
        className="min-w-0 shrink-0 whitespace-nowrap text-[length:var(--bh-text-body-sm-medium-font-size)] font-[var(--bh-text-body-sm-medium-font-weight)] leading-[var(--bh-text-body-sm-medium-line-height)] tracking-[var(--bh-text-body-sm-medium-letter-spacing)] text-[var(--bh-content-default)]"
      >
        {label}
      </span>
      {isRequired ? (
        <span
          aria-hidden="true"
          data-slot="input-label-required"
          className="shrink-0 whitespace-nowrap text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)] text-[var(--bh-content-danger-default)]"
        >
          *
        </span>
      ) : null}
      {isOptional && hasRenderableContent(optionalText) ? (
        <span
          data-slot="input-label-optional"
          dir="auto"
          className="min-w-0 shrink-0 whitespace-nowrap text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)] text-[var(--bh-content-subtle)]"
        >
          {optionalText}
        </span>
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

function InputHelperText({
  children,
  className,
  id,
  invalid,
}: {
  children: React.ReactNode
  className?: string
  id: string
  invalid: boolean
}) {
  return (
    <p
      data-slot="input-helper-text"
      id={id}
      className={cn(
        "m-0 w-full text-start text-[length:var(--bh-text-body-xs-regular-font-size)]",
        "font-[var(--bh-text-body-xs-regular-font-weight)]",
        "leading-[var(--bh-text-body-xs-regular-line-height)]",
        "tracking-[var(--bh-text-body-xs-regular-letter-spacing)]",
        invalid ? "text-[var(--bh-content-danger-default)]" : "text-[var(--bh-content-subtle)]",
        className
      )}
    >
      <span data-slot="input-helper-label" dir="auto" className="min-w-0">
        {children}
      </span>
    </p>
  )
}

function InputLeadingIcon({
  disabled,
  icon,
}: {
  disabled: boolean
  icon?: React.ReactNode
}) {
  return (
    <span
      aria-hidden="true"
      data-slot="input-leading-icon"
      className={cn(
        "flex size-[var(--bh-input-icon-slot-size)] shrink-0 items-center justify-center text-[var(--bh-content-muted)]",
        "[&>img]:size-[var(--bh-input-icon-size)] [&>img]:shrink-0 [&>img]:object-contain",
        "[&>svg]:size-[var(--bh-input-icon-size)] [&>svg]:shrink-0",
        disabled && "text-[var(--bh-content-disabled)]"
      )}
    >
      {icon ?? (
        <AtSignIcon
          aria-hidden="true"
          className="size-[var(--bh-input-icon-size)]"
          focusable="false"
          strokeWidth="var(--bh-icon-stroke-225)"
        />
      )}
    </span>
  )
}

function InputInfoIcon({
  disabled,
  icon,
  invalid,
}: {
  disabled: boolean
  icon?: React.ReactNode
  invalid: boolean
}) {
  return (
    <span
      aria-hidden="true"
      data-slot="input-info-icon"
      className={cn(
        "flex size-[var(--bh-input-icon-size)] shrink-0 items-center justify-center text-[var(--bh-content-muted)]",
        invalid && "text-[var(--bh-content-danger-default)]",
        disabled && "text-[var(--bh-content-disabled)]"
      )}
    >
      {icon ?? (
        <InfoIcon
          aria-hidden="true"
          className="size-[var(--bh-input-info-icon-size)]"
          focusable="false"
          strokeWidth="var(--bh-icon-stroke-225)"
        />
      )}
    </span>
  )
}

function InputInlineAddon({
  children,
  disabled,
}: {
  children: React.ReactNode
  disabled: boolean
}) {
  return (
    <span
      data-slot="input-inline-addon"
      dir="auto"
      className={cn(
        "shrink-0 whitespace-nowrap text-[var(--bh-content-subtle)]",
        disabled && "text-[var(--bh-content-disabled)]"
      )}
    >
      {children}
    </span>
  )
}

function InputTagList({
  className,
  disabled,
  inline = false,
  tags,
}: {
  className?: string
  disabled: boolean
  inline?: boolean
  tags: InputTag[]
}) {
  return (
    <span
      data-inline={inline ? "true" : undefined}
      data-slot={inline ? "input-inline-tags" : "input-tags"}
      className={cn(
        "flex min-w-0 items-center gap-[var(--bh-input-inline-gap)]",
        inline && "flex-wrap",
        className
      )}
    >
      {tags.map((tag, index) => (
        <span
          key={tag.id || index}
          data-slot="input-tag"
          className={cn(inputTag({ disabled }))}
        >
          <span data-slot="input-tag-label" dir="auto" className="min-w-0 truncate">
            {tag.label}
          </span>
        </span>
      ))}
    </span>
  )
}

function InputSegment({
  children,
  disabled,
  interactive = false,
  side,
}: {
  children: React.ReactNode
  disabled: boolean
  interactive?: boolean
  side: "leading" | "trailing"
}) {
  const Comp = interactive ? "button" : "span"

  return (
    <Comp
      data-slot="input-segment"
      disabled={interactive ? disabled : undefined}
      type={interactive ? "button" : undefined}
      className={cn(inputSegment({ disabled, interactive, side }))}
      onClick={(event) => {
        if (interactive) event.stopPropagation()
      }}
    >
      {children}
    </Comp>
  )
}

function InputStepperButton({
  children,
  disabled,
  label,
  side,
  size,
}: {
  children: React.ReactNode
  disabled: boolean
  label: string
  side: "leading" | "trailing"
  size: InputSize
}) {
  return (
    <button
      aria-label={label}
      data-side={side}
      data-slot="input-stepper-button"
      disabled={disabled}
      type="button"
      className={cn(
        inputStepperButton({ side }),
        size === "md" && "w-[var(--bh-input-md-height)]",
        size === "comfortable" && "w-[var(--bh-input-comfortable-height)]"
      )}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {children}
    </button>
  )
}

type InputSegmentRenderContext = {
  buttonLabel?: React.ReactNode
  disabled: boolean
  kind: InputKind
  leadingAddon?: React.ReactNode
  quantityLabel?: React.ReactNode
  size: InputSize
  trailingAddon?: React.ReactNode
}

type InputSegmentRenderer = (
  context: InputSegmentRenderContext
) => React.ReactNode

const leadingSegmentRenderers: Partial<Record<InputKind, InputSegmentRenderer>> = {
  "add-on": ({ disabled, leadingAddon }) =>
    hasRenderableContent(leadingAddon) ? (
      <InputSegment disabled={disabled} side="leading">
        {leadingAddon}
      </InputSegment>
    ) : null,
  "leading-button": ({ buttonLabel, disabled }) =>
    hasRenderableContent(buttonLabel) ? (
      <InputSegment disabled={disabled} interactive side="leading">
        {buttonLabel}
      </InputSegment>
    ) : null,
  "leading-dropdown": ({ buttonLabel, disabled }) => (
    <InputSegment disabled={disabled} interactive side="leading">
      {buttonLabel}
      <ChevronIcon />
    </InputSegment>
  ),
  quantity: ({ disabled, quantityLabel, size }) => (
    <InputStepperButton
      disabled={disabled}
      label={formatStepperLabel("Decrease", quantityLabel)}
      side="leading"
      size={size}
    >
      <MinusIcon />
    </InputStepperButton>
  ),
  "quantity-2": ({ disabled, quantityLabel, size }) => (
    <InputStepperButton
      disabled={disabled}
      label={formatStepperLabel("Decrease", quantityLabel)}
      side="leading"
      size={size}
    >
      <MinusIcon />
    </InputStepperButton>
  ),
}

const trailingSegmentRenderers: Partial<Record<InputKind, InputSegmentRenderer>> = {
  "add-on": ({ disabled, trailingAddon }) =>
    hasRenderableContent(trailingAddon) ? (
      <InputSegment disabled={disabled} side="trailing">
        {trailingAddon}
      </InputSegment>
    ) : null,
  "trailing-button": ({ buttonLabel, disabled }) =>
    hasRenderableContent(buttonLabel) ? (
      <InputSegment disabled={disabled} interactive side="trailing">
        {buttonLabel}
      </InputSegment>
    ) : null,
  "trailing-dropdown": ({ buttonLabel, disabled }) => (
    <InputSegment disabled={disabled} interactive side="trailing">
      {buttonLabel}
      <ChevronIcon />
    </InputSegment>
  ),
  quantity: ({ disabled, quantityLabel, size }) => (
    <InputStepperButton
      disabled={disabled}
      label={formatStepperLabel("Increase", quantityLabel)}
      side="trailing"
      size={size}
    >
      <PlusIcon />
    </InputStepperButton>
  ),
  "quantity-2": ({ disabled, quantityLabel, size }) => (
    <InputStepperButton
      disabled={disabled}
      label={formatStepperLabel("Increase", quantityLabel)}
      side="trailing"
      size={size}
    >
      <PlusIcon />
    </InputStepperButton>
  ),
}

function renderLeadingSegment(context: InputSegmentRenderContext) {
  return leadingSegmentRenderers[context.kind]?.(context) ?? null
}

function renderTrailingSegment(context: InputSegmentRenderContext) {
  return trailingSegmentRenderers[context.kind]?.(context) ?? null
}

function formatStepperLabel(action: "Decrease" | "Increase", quantityLabel?: React.ReactNode) {
  return typeof quantityLabel === "string" && quantityLabel.trim()
    ? `${action} ${quantityLabel}`
    : action
}

function ChevronIcon() {
  return (
    <ChevronDownIcon
      aria-hidden="true"
      className="size-[var(--bh-input-chevron-size)]"
      focusable="false"
      strokeWidth="var(--bh-icon-stroke-225)"
    />
  )
}

function MinusIcon() {
  return (
    <LucideMinusIcon
      aria-hidden="true"
      className="size-[var(--bh-input-stepper-icon-size)]"
      focusable="false"
      strokeWidth="var(--bh-icon-stroke-225)"
    />
  )
}

function PlusIcon() {
  return (
    <LucidePlusIcon
      aria-hidden="true"
      className="size-[var(--bh-input-stepper-icon-size)]"
      focusable="false"
      strokeWidth="var(--bh-icon-stroke-225)"
    />
  )
}

function shouldRenderLeadingIcon(kind: InputKind) {
  return [
    "default",
    "shortcut",
    "tags",
    "inline-tags",
  ].includes(kind)
}

function shouldRenderInfoIcon(kind: InputKind, hasInformationIcon: boolean) {
  if (!hasInformationIcon) return false

  return ![
    "shortcut",
    "leading-dropdown",
    "leading-button",
    "trailing-dropdown",
    "trailing-button",
    "quantity",
    "quantity-2",
  ].includes(kind)
}

function resolveInputSize(
  density: ControlDensity | undefined,
  size: InputSize | undefined
): InputSize {
  if (density === "compact") return "md"
  if (density === "default") return "lg"
  if (density === "comfortable") return "comfortable"
  return size ?? "lg"
}

export { Input, inputContent, inputControl, inputRoot, inputSurface }
export type {
  ControlDensity,
  InputKind,
  InputProps,
  InputSize,
  InputTag,
  InputVariant,
  InputVisualState,
}
