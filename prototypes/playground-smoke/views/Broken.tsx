/**
 * Deliberately broken. Verifies that a crashing view is contained by its own
 * frame's error boundary and never takes down the canvas around it.
 */
export default function Broken(): React.ReactNode {
  throw new Error('This view throws on purpose — error containment check.')
}
