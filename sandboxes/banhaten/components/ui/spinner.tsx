import * as React from "react"

import { cn } from "@/lib/utils"

type SpinnerMotion = "dynamic" | "steady"

type SpinnerProps = React.ComponentProps<"svg">

type DynamicSpinnerProps = SpinnerProps

type SpinnerBaseProps = SpinnerProps & {
  motion: SpinnerMotion
}

function Spinner(props: SpinnerProps) {
  return <SpinnerBase {...props} motion="steady" />
}

function DynamicSpinner(props: DynamicSpinnerProps) {
  return <SpinnerBase {...props} motion="dynamic" />
}

function SpinnerBase({ className, motion, ...props }: SpinnerBaseProps) {
  return (
    <svg
      aria-hidden="true"
      data-motion={motion}
      data-slot="spinner"
      viewBox="0 0 24 24"
      className={cn(
        "size-[var(--bh-spinner-size)] shrink-0 text-current",
        className
      )}
      {...props}
    >
      <circle
        data-slot="spinner-track"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="var(--bh-spinner-stroke-width)"
        opacity="var(--bh-opacity-25)"
      />
      <circle
        data-slot="spinner-arc"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="var(--bh-spinner-stroke-width)"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="30 70"
        style={{
          animationDuration:
            motion === "dynamic"
              ? "var(--bh-spinner-duration-dynamic)"
              : "var(--bh-spinner-duration-steady)",
          animationIterationCount: "infinite",
          animationName:
            motion === "dynamic"
              ? "bh-spinner-dynamic"
              : "bh-spinner-steady",
          animationTimingFunction:
            motion === "dynamic" ? "var(--bh-spinner-easing)" : "linear",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      />
    </svg>
  )
}

export { DynamicSpinner, Spinner }
export type { DynamicSpinnerProps, SpinnerProps }
