"use client"

import * as React from "react"

import {
  ButtonGroupLabel,
  ToggleGroup,
  ToggleGroupItem,
  type ButtonGroupLabelProps,
  type ControlDensity,
  type ToggleGroupItemProps,
  type ToggleGroupProps,
} from "@/components/ui/button-group"

type SegmentedControlProps = Omit<
  ToggleGroupProps,
  "itemWidth" | "mode"
> & {
  "aria-label": string
  density?: ControlDensity
}

const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(
  { density = "default", type = "single", ...props },
  ref
) {
  return (
    <ToggleGroup
      data-slot="segmented-control"
      density={density}
      itemWidth="content"
      mode="default"
      ref={ref}
      type={type}
      {...props}
    />
  )
})

type SegmentedControlItemProps = ToggleGroupItemProps

const SegmentedControlItem = React.forwardRef<
  HTMLButtonElement,
  SegmentedControlItemProps
>(function SegmentedControlItem(props, ref) {
  return (
    <ToggleGroupItem
      data-slot="segmented-control-item"
      itemWidth="content"
      ref={ref}
      {...props}
    />
  )
})

type SegmentedControlLabelProps = Omit<
  ButtonGroupLabelProps,
  "itemWidth"
>

const SegmentedControlLabel = React.forwardRef<
  HTMLSpanElement,
  SegmentedControlLabelProps
>(function SegmentedControlLabel(props, ref) {
  return (
    <ButtonGroupLabel
      data-slot="segmented-control-label"
      itemWidth="content"
      ref={ref}
      {...props}
    />
  )
})

export {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
}
export type {
  SegmentedControlItemProps,
  SegmentedControlLabelProps,
  SegmentedControlProps,
}
