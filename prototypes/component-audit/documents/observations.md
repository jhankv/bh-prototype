# Observations — component audit

**Phase 1: what is visible on screen.** Every entry here was seen in a running
frame and then measured in the DOM. None of it was read out of component source
— that pass comes last and lands in its own document, because an observation and
a code reading do not carry the same confidence and must never be mistaken for
each other.

**Every screen here is a faithful reproduction**, not a composition of our own.
That is the control variable, and without it a finding can always be answered
with "that layout is not real".

| Surface | Reference | Components |
| --- | --- | --- |
| Notification settings | [Mercury](https://mobbin.com/screens/cd614ddf-6c42-41be-b0ed-1e1a1653e70e) | `toggle` `badge` `menu` `input` `avatar` `button` |
| Table browser | [Neon](https://mobbin.com/screens/926541e1-1d12-4677-8faf-54193a709b17) | `checkbox` `select` `select-content` `segmented-control` `toolbar` `expanded/Table` |
| Document editor | [Coda](https://mobbin.com/screens/d43c69b1-4c44-461a-8af9-4b9047d0ab0a) | `button-group` `tooltip` `menu` `select` |
| Bulk import | [PandaDoc](https://mobbin.com/screens/6e7783c1-2ce2-4ba2-832d-bab89ec45f67) | `progress` `spinner` |
| Nothing created yet | [Laravel Cloud](https://mobbin.com/screens/5a0b71b3-f06f-4b14-af43-b862c1550a8f) | `EmptyState` |

Nothing was added to any screen to raise coverage. Where a screen needed
something Banhaten does not ship — navigation lists, prose, page tabs — that is
plain markup, so a defect found on it would be ours and not theirs.

**`Toolbar` is a list toolbar, and that governs where it appears.** It is
imported by exactly one file in the whole design system — `expanded/Table.tsx` —
and its exports are `ToolbarSearch`, `ToolbarFilterButton`, `ToolbarMoreButton`,
`ToolbarBadge` and `ToolbarText`. Search, filters, more, a count. So it lives on
Neon's table row, not on Coda's formatting bar, where a first attempt did put it
and produced something that looked broken. Forcing a component into a shape it
was not built for manufactures a convincing false defect, which is the worst
thing this playground can make.

Coda's bar therefore uses the components whose contracts match: `ToggleGroup
type="multiple"` for bold/italic/underline/strike, since those are independent
states that can all be on at once, and `ButtonGroup` for link/comment/image/AI,
since those are actions — a toggle group there would tell a screen reader that
"Comment" is currently on. The floating surface under the bar is plain markup;
Banhaten ships no floating-toolbar surface.

`table-elements` is not covered visually and that is on purpose. It exports
structural wrappers with almost no styling — `TableCell` and `TableBody` add no
classes at all — so a screen built on them would be showing our CSS. It belongs
to the code pass.

**A caution for the code pass.** `useDS()` returns components typed as
`ComponentType<Record<string, unknown>>`, so an invalid prop on a design system
component typechecks cleanly inside a prototype. `ToolbarButton variant="brand"`
was written here and silently did nothing — `brand` is not one of its variants.
`tsc` cannot catch misuse in these files; only reading the component can.

---

*No entries yet.*
