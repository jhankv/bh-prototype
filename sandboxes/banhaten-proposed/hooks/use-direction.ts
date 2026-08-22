"use client"

import * as React from "react"

export type Direction = "ltr" | "rtl"

type DirectionStore = {
  listeners: Set<() => void>
  observer?: MutationObserver
}

const DirectionContext = React.createContext<Direction | undefined>(undefined)
const directionStores = new WeakMap<Document, DirectionStore>()
const noop = () => undefined

export type DirectionProviderProps = {
  children: React.ReactNode
  dir: Direction
}

export function DirectionProvider({
  children,
  dir,
}: DirectionProviderProps) {
  return React.createElement(DirectionContext.Provider, { value: dir }, children)
}

export function resolveDirection(
  explicitDirection?: Direction,
  element?: Element | null
): Direction {
  if (explicitDirection) return explicitDirection

  let ancestor = element?.parentElement
  while (ancestor) {
    const inheritedDirection = normalizeDirection(ancestor.getAttribute("dir"))
    if (inheritedDirection) return inheritedDirection
    ancestor = ancestor.parentElement
  }

  const ownerDocument = element?.ownerDocument ?? getBrowserDocument()
  const documentDirection = normalizeDirection(
    ownerDocument?.documentElement.getAttribute("dir")
  )

  return documentDirection ?? "ltr"
}

export function useResolvedDirection<T extends Element>(
  explicitDirection: Direction | undefined,
  elementRef: React.RefObject<T | null>
) {
  const contextDirection = React.useContext(DirectionContext)
  const preferredDirection = explicitDirection ?? contextDirection

  const subscribe = React.useCallback(
    (listener: () => void) => {
      if (preferredDirection) return noop

      const ownerDocument =
        elementRef.current?.ownerDocument ?? getBrowserDocument()

      return ownerDocument
        ? subscribeToDirectionChanges(ownerDocument, listener)
        : noop
    },
    [elementRef, preferredDirection]
  )
  const getSnapshot = React.useCallback(
    () => resolveDirection(preferredDirection, elementRef.current),
    [elementRef, preferredDirection]
  )
  const getServerSnapshot = React.useCallback(
    () => preferredDirection ?? "ltr",
    [preferredDirection]
  )

  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
}

export function useDirection(defaultDirection?: Direction) {
  const contextDirection = React.useContext(DirectionContext)
  const preferredDirection = defaultDirection ?? contextDirection
  const observedDirection = useDocumentDirection(preferredDirection)
  const observedDirectionRef = React.useRef(observedDirection)
  const [directionOverride, setDirectionOverride] = React.useState<
    Direction | undefined
  >(undefined)

  observedDirectionRef.current = observedDirection

  const setDirection = React.useCallback<
    React.Dispatch<React.SetStateAction<Direction>>
  >((nextDirection) => {
    setDirectionOverride((currentDirection) => {
      const selectedDirection =
        currentDirection ?? observedDirectionRef.current

      return typeof nextDirection === "function"
        ? nextDirection(selectedDirection)
        : nextDirection
    })
  }, [])

  React.useEffect(() => {
    if (defaultDirection === undefined && contextDirection) {
      setDirectionOverride(contextDirection)
    }
  }, [contextDirection, defaultDirection])

  return [directionOverride ?? observedDirection, setDirection] as const
}

function useDocumentDirection(preferredDirection?: Direction) {
  const subscribe = React.useCallback(
    (listener: () => void) => {
      if (preferredDirection) return noop

      const ownerDocument = getBrowserDocument()
      return ownerDocument
        ? subscribeToDirectionChanges(ownerDocument, listener)
        : noop
    },
    [preferredDirection]
  )
  const getSnapshot = React.useCallback(
    () => resolveDirection(preferredDirection),
    [preferredDirection]
  )
  const getServerSnapshot = React.useCallback(
    () => preferredDirection ?? "ltr",
    [preferredDirection]
  )

  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
}

function subscribeToDirectionChanges(
  ownerDocument: Document,
  listener: () => void
) {
  const store = getDirectionStore(ownerDocument)
  store.listeners.add(listener)

  if (store.listeners.size === 1) {
    startDirectionObserver(ownerDocument, store)
  }

  return () => {
    store.listeners.delete(listener)

    if (store.listeners.size === 0) {
      store.observer?.disconnect()
      store.observer = undefined
    }
  }
}

function getDirectionStore(ownerDocument: Document) {
  const existingStore = directionStores.get(ownerDocument)
  if (existingStore) return existingStore

  const store: DirectionStore = { listeners: new Set() }
  directionStores.set(ownerDocument, store)
  return store
}

function startDirectionObserver(
  ownerDocument: Document,
  store: DirectionStore
) {
  const MutationObserverConstructor =
    ownerDocument.defaultView?.MutationObserver
  const directionRoot = ownerDocument.documentElement

  if (!MutationObserverConstructor || !directionRoot) return

  store.observer = new MutationObserverConstructor(() => {
    for (const listener of [...store.listeners]) {
      listener()
    }
  })
  store.observer.observe(directionRoot, {
    attributeFilter: ["dir"],
    attributes: true,
    subtree: true,
  })
}

function getBrowserDocument() {
  return typeof document === "undefined" ? undefined : document
}

function normalizeDirection(value?: string | null): Direction | undefined {
  const normalizedValue = value?.trim().toLowerCase()
  return normalizedValue === "ltr" || normalizedValue === "rtl"
    ? normalizedValue
    : undefined
}
