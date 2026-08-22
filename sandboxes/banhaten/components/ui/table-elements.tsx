"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TableRootProps = React.ComponentPropsWithoutRef<"table">
type TableSectionProps = React.ComponentPropsWithoutRef<"thead">
type TableBodyProps = React.ComponentPropsWithoutRef<"tbody">
type TableRowElementProps = React.ComponentPropsWithoutRef<"tr">
type TableHeadProps = React.ComponentPropsWithoutRef<"th">
type TableCellProps = React.ComponentPropsWithoutRef<"td">
type DataTableSurfaceProps = React.ComponentPropsWithoutRef<"div">

const DataTableSurface = React.forwardRef<
  HTMLDivElement,
  DataTableSurfaceProps
>(function DataTableSurface({ className, role = "table", ...props }, ref) {
  return (
    <div
      data-slot="data-table-surface"
      ref={ref}
      role={role}
      className={cn("min-w-0", className)}
      {...props}
    />
  )
})

const TableRoot = React.forwardRef<HTMLTableElement, TableRootProps>(
  function TableRoot({ className, ...props }, ref) {
    return (
      <table
        data-slot="table-root"
        ref={ref}
        className={cn("w-full border-collapse text-start", className)}
        {...props}
      />
    )
  }
)

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableSectionProps
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      data-slot="table-header"
      ref={ref}
      className={cn("text-start", className)}
      {...props}
    />
  )
})

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ className, ...props }, ref) {
    return (
      <tbody
        data-slot="table-body"
        ref={ref}
        className={className}
        {...props}
      />
    )
  }
)

const TableRowElement = React.forwardRef<
  HTMLTableRowElement,
  TableRowElementProps
>(function TableRowElement({ className, ...props }, ref) {
  return (
    <tr
      data-slot="table-row"
      ref={ref}
      className={className}
      {...props}
    />
  )
})

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead({ className, scope = "col", ...props }, ref) {
    return (
      <th
        data-slot="table-head"
        ref={ref}
        className={cn("text-start", className)}
        scope={scope}
        {...props}
      />
    )
  }
)

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ className, ...props }, ref) {
    return (
      <td
        data-slot="table-cell"
        ref={ref}
        className={className}
        {...props}
      />
    )
  }
)

export {
  DataTableSurface,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRowElement,
}
export type {
  DataTableSurfaceProps,
  TableBodyProps,
  TableCellProps,
  TableHeadProps,
  TableRootProps,
  TableRowElementProps,
  TableSectionProps,
}
