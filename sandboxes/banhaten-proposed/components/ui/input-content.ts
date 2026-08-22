import type * as React from "react"

type InputVisualState = "default" | "filled" | "error" | "disabled"
type InputKind =
  | "default"
  | "shortcut"
  | "add-on"
  | "inline-add-on"
  | "tags"
  | "inline-tags"
  | "trailing-dropdown"
  | "leading-dropdown"
  | "quantity"
  | "quantity-2"
  | "trailing-button"
  | "leading-button"

type InputTag = {
  id?: string
  label: React.ReactNode
}

const inputCopy = {
  shortcut: "\u2318K",
  shortcutKeys: ["Mod", "K"] as const,
} as const

function getInputPlaceholder({
  placeholder,
}: {
  placeholder?: string
}) {
  return placeholder
}

function getInputHelperText({
  errorMessage,
  isInvalid,
  message,
}: {
  errorMessage?: React.ReactNode
  isInvalid: boolean
  message?: React.ReactNode
}) {
  if (isInvalid) return errorMessage

  return message
}

function getInputTags({
  kind,
  tags,
}: {
  kind: InputKind
  tags?: InputTag[]
}) {
  const shouldShow = Boolean(tags?.length)

  if (!shouldShow) {
    return { inline: [], inside: [] }
  }

  if (kind === "tags") {
    return {
      inline: [],
      inside: tags ?? [],
    }
  }

  if (kind === "inline-tags") {
    return {
      inline: tags ?? [],
      inside: [],
    }
  }

  return { inline: [], inside: [] }
}

function getInputDefaultValue({
  defaultValue,
  isTagInput,
  state,
  value,
  valueText,
}: {
  defaultValue?: string | number | readonly string[]
  isTagInput: boolean
  state: InputVisualState
  value?: string | number | readonly string[]
  valueText?: string
}) {
  if (value !== undefined || defaultValue !== undefined) return defaultValue
  if (isTagInput) return undefined
  if (state !== "filled") return undefined

  return valueText
}

export {
  getInputDefaultValue,
  getInputHelperText,
  getInputPlaceholder,
  getInputTags,
  inputCopy,
}
export type { InputKind, InputTag, InputVisualState }
