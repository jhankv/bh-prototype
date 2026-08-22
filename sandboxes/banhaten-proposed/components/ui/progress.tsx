"use client"

import * as React from "react"
import { InfoIcon, LoaderCircleIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type ProgressSize = "sm" | "lg"
type ProgressLabelPosition = "top" | "bottom" | "none" | "inline"

const progressVariants = cva(
  [
    "group/progress flex w-full min-w-0 text-[var(--bh-content-default)]",
    "[--bh-progress-track-height-current:var(--bh-space-md-8)]",
    "[--bh-progress-indicator-size:var(--bh-space-3xl-16)]",
    "[--bh-progress-gap:var(--bh-space-sm-6)]",
  ],
  {
    variants: {
      size: {
        sm: "[--bh-progress-track-height-current:var(--bh-space-xs-4)]",
        lg: "[--bh-progress-track-height-current:var(--bh-space-md-8)]",
      },
      labelPosition: {
        top: "flex-col items-start gap-[var(--bh-progress-gap)]",
        bottom: "flex-col items-start gap-[var(--bh-progress-gap)]",
        none: "flex-col items-start gap-[var(--bh-progress-gap)]",
        inline: "items-center gap-[var(--bh-progress-gap)]",
      },
    },
    defaultVariants: {
      size: "lg",
      labelPosition: "top",
    },
  }
)

const progressTrackVariants = cva(
  "relative w-full min-w-0 overflow-hidden rounded-[var(--bh-radius-full)] bg-[var(--bh-bg-neutral-soft)]",
  {
    variants: {
      size: {
        sm: "h-[var(--bh-space-xs-4)]",
        lg: "h-[var(--bh-space-md-8)]",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
)

type ProgressProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> &
  VariantProps<typeof progressVariants> & {
    getValueLabel?: (value: number, percent: number) => string
    helperText?: React.ReactNode
    indicator?: React.ReactNode
    infoLabel?: string
    label?: React.ReactNode
    max?: number
    min?: number
    optional?: React.ReactNode
    showIndicator?: boolean
    showInfo?: boolean
    showSpinner?: boolean
    value?: number
  }

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  getValueLabel,
  helperText,
  indicator,
  infoLabel = "More information",
  label,
  labelPosition,
  max = 100,
  min = 0,
  optional,
  showIndicator,
  showInfo = false,
  showSpinner = false,
  size,
  value = 0,
  ...props
}, ref) {
  const selectedLabelPosition = labelPosition ?? "top"
  const selectedSize = size ?? "lg"
  const labelId = React.useId()
  const helperId = React.useId()
  const { clampedValue, maxValue, minValue, percent } = getProgressValue({
    max,
    min,
    value,
  })
  const roundedPercent = Math.round(percent)
  const valueLabel = getValueLabel?.(clampedValue, percent)
  const shouldShowIndicator =
    showIndicator ?? selectedLabelPosition !== "none"
  const visibleIndicator = indicator ?? `${roundedPercent}%`
  const hasLabel = hasRenderableContent(label)
  const hasOptional = hasRenderableContent(optional)
  const hasHelperText = hasRenderableContent(helperText)
  const hasHeader =
    selectedLabelPosition !== "none" &&
    selectedLabelPosition !== "inline" &&
    (hasLabel || hasOptional || showInfo || shouldShowIndicator)
  const labelledBy =
    ariaLabelledBy ?? (hasLabel && !ariaLabel ? labelId : undefined)
  const describedBy =
    [ariaDescribedBy, hasHelperText ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <div
      data-label-position={selectedLabelPosition}
      data-size={selectedSize}
      data-slot="progress"
      ref={ref}
      className={cn(
        progressVariants({
          labelPosition: selectedLabelPosition,
          size: selectedSize,
        }),
        className
      )}
      {...props}
    >
      {selectedLabelPosition === "top" && hasHeader ? (
        <ProgressHeader
          indicator={visibleIndicator}
          infoLabel={infoLabel}
          label={label}
          labelId={labelId}
          optional={optional}
          showIndicator={shouldShowIndicator}
          showInfo={showInfo}
          showSpinner={showSpinner}
        />
      ) : null}

      <ProgressTrack
        ariaDescribedBy={describedBy}
        ariaLabel={ariaLabel}
        ariaLabelledBy={labelledBy}
        max={maxValue}
        min={minValue}
        percent={percent}
        size={selectedSize}
        value={clampedValue}
        valueLabel={valueLabel}
      />

      {selectedLabelPosition === "bottom" && hasHeader ? (
        <ProgressHeader
          indicator={visibleIndicator}
          infoLabel={infoLabel}
          label={label}
          labelId={labelId}
          optional={optional}
          showIndicator={shouldShowIndicator}
          showInfo={showInfo}
          showSpinner={showSpinner}
        />
      ) : null}

      {selectedLabelPosition === "inline" && shouldShowIndicator ? (
        <ProgressIndicator
          indicator={visibleIndicator}
          showSpinner={showSpinner}
        />
      ) : null}

      {hasHelperText ? (
        <p
          data-slot="progress-helper-text"
          dir="auto"
          id={helperId}
          className="m-0 w-full text-start text-[length:var(--bh-text-body-2xs-regular-font-size)] font-[var(--bh-text-body-2xs-regular-font-weight)] leading-[var(--bh-text-body-2xs-regular-line-height)] tracking-[var(--bh-text-body-2xs-regular-letter-spacing)] text-[var(--bh-content-subtle)]"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

Progress.displayName = "Progress"

function ProgressHeader({
  indicator,
  infoLabel,
  label,
  labelId,
  optional,
  showIndicator,
  showInfo,
  showSpinner,
}: {
  indicator: React.ReactNode
  infoLabel: string
  label: React.ReactNode
  labelId: string
  optional: React.ReactNode
  showIndicator: boolean
  showInfo: boolean
  showSpinner: boolean
}) {
  return (
    <div
      data-slot="progress-header"
      className="flex w-full min-w-0 items-center gap-[var(--bh-space-md-8)]"
    >
      <span
        data-slot="progress-label-group"
        className="flex min-w-0 flex-1 items-center gap-[var(--bh-space-xs-4)]"
      >
        {hasRenderableContent(label) ? (
          <span
            data-slot="progress-label"
            dir="auto"
            id={labelId}
            className="min-w-0 truncate text-start text-[length:var(--bh-text-body-xs-medium-font-size)] font-[var(--bh-text-body-xs-medium-font-weight)] leading-[var(--bh-text-body-xs-medium-line-height)] tracking-[var(--bh-text-body-xs-medium-letter-spacing)] text-[var(--bh-content-default)]"
          >
            {label}
          </span>
        ) : null}
        {hasRenderableContent(optional) ? (
          <span
            data-slot="progress-optional"
            dir="auto"
            className="order-2 min-w-0 truncate text-start text-[length:var(--bh-text-body-xs-regular-font-size)] font-[var(--bh-text-body-xs-regular-font-weight)] leading-[var(--bh-text-body-xs-regular-line-height)] tracking-[var(--bh-text-body-xs-regular-letter-spacing)] text-[var(--bh-content-subtle)] rtl:order-3"
          >
            {optional}
          </span>
        ) : null}
        {showInfo ? (
          <span
            aria-label={infoLabel}
            data-slot="progress-info"
            role="img"
            title={infoLabel}
            className="order-3 inline-flex size-[var(--bh-progress-indicator-size)] shrink-0 items-center justify-center text-[var(--bh-content-muted)] rtl:order-2 [&_svg]:size-[var(--bh-progress-indicator-size)]"
          >
            <InfoIcon aria-hidden="true" />
          </span>
        ) : null}
      </span>

      {showIndicator ? (
        <ProgressIndicator indicator={indicator} showSpinner={showSpinner} />
      ) : null}
    </div>
  )
}

function ProgressTrack({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  max,
  min,
  percent,
  size,
  value,
  valueLabel,
}: {
  ariaDescribedBy?: string
  ariaLabel?: string
  ariaLabelledBy?: string
  max: number
  min: number
  percent: number
  size: ProgressSize
  value: number
  valueLabel?: string
}) {
  return (
    <div
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value}
      aria-valuetext={valueLabel}
      data-slot="progress-track"
      role="progressbar"
      className={progressTrackVariants({ size })}
    >
      <span
        data-slot="progress-fill"
        className="absolute inset-y-0 start-0 block min-w-[var(--bh-progress-track-height-current)] rounded-[var(--bh-radius-full)] bg-[var(--bh-interactive-indicator-default)]"
        style={{ inlineSize: `${percent}%` }}
      />
    </div>
  )
}

function ProgressIndicator({
  indicator,
  showSpinner,
}: {
  indicator: React.ReactNode
  showSpinner: boolean
}) {
  return (
    <span
      aria-hidden="true"
      data-slot="progress-indicator"
      className="flex shrink-0 items-center gap-[var(--bh-space-xxs-2)] text-[length:var(--bh-text-body-2xs-regular-font-size)] font-[var(--bh-text-body-2xs-regular-font-weight)] leading-[var(--bh-text-body-2xs-regular-line-height)] tracking-[var(--bh-text-body-2xs-regular-letter-spacing)] text-[var(--bh-content-subtle)]"
    >
      {hasRenderableContent(indicator) ? (
        <span data-slot="progress-indicator-value" dir="auto">
          {indicator}
        </span>
      ) : null}
      {showSpinner ? (
        <LoaderCircleIcon
          data-slot="progress-indicator-spinner"
          className="size-[var(--bh-progress-indicator-size)] animate-spin"
        />
      ) : null}
    </span>
  )
}

function getProgressValue({
  max,
  min,
  value,
}: {
  max: number
  min: number
  value: number
}) {
  const minValue = Number.isFinite(min) ? Number(min) : 0
  const resolvedMax = Number.isFinite(max) ? Number(max) : 100
  const maxValue = resolvedMax > minValue ? resolvedMax : minValue + 100
  const numericValue = Number.isFinite(value) ? Number(value) : minValue
  const clampedValue = Math.min(maxValue, Math.max(minValue, numericValue))
  const percent = ((clampedValue - minValue) / (maxValue - minValue)) * 100

  return {
    clampedValue,
    maxValue,
    minValue,
    percent: Math.min(100, Math.max(0, percent)),
  }
}

function hasRenderableContent(content: React.ReactNode) {
  return (
    content !== undefined &&
    content !== null &&
    content !== false &&
    content !== ""
  )
}

export { Progress, progressTrackVariants, progressVariants }
export type { ProgressLabelPosition, ProgressProps, ProgressSize }
