import { useDS } from '@/ds'

/**
 * The three label states that `input-3` is about, and nothing else.
 *
 * A snippet, not a gallery. The finding is one word inside a parenthesis, and in
 * the full Inputs gallery it sits among twenty other fields where nobody will
 * ever spot it — which is exactly the objection that produced this file. Three
 * fields on one row, stacked against the patched version, and the difference
 * arrives without being pointed at.
 *
 * The asymmetry is the whole point and it only exists when the two booleans are
 * adjacent: `isRequired` alone draws its asterisk, `isOptional` alone draws
 * nothing. Either the flag means something by itself or it should not exist.
 */
export default function InputOptionalCase() {
  const { Input } = useDS()

  return (
    <div className="bg-[var(--background)] p-6 text-[var(--foreground)]">
      <div className="flex flex-wrap items-start gap-4">
        <Field prop="isRequired">
          <Input label="Email" isRequired placeholder="you@example.com" />
        </Field>
        <Field prop="isOptional">
          <Input label="Company" isOptional placeholder="Acme Inc." />
        </Field>
        <Field prop="isOptional + optionalText">
          <Input label="Company" isOptional optionalText="(optional)" placeholder="Acme Inc." />
        </Field>
      </div>
    </div>
  )
}

/** The prop that produced the field, printed above it, so the figure explains itself. */
function Field({ prop, children }: { prop: string; children: React.ReactNode }) {
  return (
    <div className="flex w-[180px] flex-col gap-1.5">
      <span className="font-mono text-[10px] opacity-40">{prop}</span>
      {children}
    </div>
  )
}
