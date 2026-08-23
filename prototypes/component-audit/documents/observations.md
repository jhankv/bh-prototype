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
| Table browser | [Neon](https://mobbin.com/screens/926541e1-1d12-4677-8faf-54193a709b17) | `checkbox` `select` `select-content` `segmented-control` `expanded/Table` |
| Document editor | [Coda](https://mobbin.com/screens/d43c69b1-4c44-461a-8af9-4b9047d0ab0a) | `toolbar` `tooltip` `menu` |
| Bulk import | [PandaDoc](https://mobbin.com/screens/6e7783c1-2ce2-4ba2-832d-bab89ec45f67) | `progress` `spinner` |
| Nothing created yet | [Laravel Cloud](https://mobbin.com/screens/5a0b71b3-f06f-4b14-af43-b862c1550a8f) | `EmptyState` |

Nothing was added to any screen to raise coverage. Where a screen needed
something Banhaten does not ship — navigation lists, prose, page tabs — that is
plain markup, so a defect found on it would be ours and not theirs.

`button-group` and `table-elements` are not covered visually and that is on
purpose. `table-elements` exports structural wrappers with almost no styling —
`TableCell` and `TableBody` add no classes at all — so a screen built on them
would be showing our CSS. Both belong to the code pass.

---

*No entries yet.*
