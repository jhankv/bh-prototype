# Observations — Mercury notification settings

**Phase 1: what is visible on screen.** Every entry here was seen in a running
frame and then measured in the DOM. None of it was read out of component source
— that pass comes last and lands in its own document, because an observation and
a code reading do not carry the same confidence and must never be mistaken for
each other.

**The screen is a faithful reproduction**, not a composition of our own:
[Mercury — Notifications](https://mobbin.com/screens/cd614ddf-6c42-41be-b0ed-1e1a1653e70e).
That matters for every entry below. A prototype assembled from several products
has no control variable, so a defect found on it can always be answered with
"that layout is not real". This one ships.

Components this screen exercises: `toggle` · `badge` · `menu` · `input`
(`kind="shortcut"`) · `avatar` · `button`.

Not on this surface, on purpose: `checkbox`, `segmented-control`,
`button-group`, `select`, `progress`, `spinner`, `toolbar`, `tooltip`,
`table-elements`, `EmptyState`. Each belongs to a different real screen rather
than to a widened version of this one.

---

*No entries yet.*
