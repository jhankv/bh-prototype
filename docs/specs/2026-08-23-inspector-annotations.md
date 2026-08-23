# Inspector annotations
**Status:** proposed · 2026-08-23 **Scope:** `src/frame/inspector/` — one file plus one new module.
## 1. Why
The Inspector names a component. It cannot yet carry an opinion about it.

Today the loop is: notice something wrong, Alt-hover to name it, Alt-click to copy one line, switch to the agent, retype what was wrong from memory. The naming is exact and the rest is lossy.

Agentation was trialled for this and does the annotation half well. Two things rule it out **inside frames**, both measured rather than predicted:

- Annotations are stored per `pathname`, and every frame is `/frame.html`. A note left on one frame appears on all of them. Confirmed in use.
  
- Its `Source:` line reported `toolbar.tsx:622` in a file of 539 lines, and `avatar.tsx:215` for an element declared at 187. The React Compiler inflates the line numbers it reads. A precise wrong answer sends you to the wrong place.
  

It stays mounted in the shell, where none of that applies. This spec covers the frames only.
## 2. What this is for
Not "leave comments on a page". Producing **a defect report that survives leaving this repository**, from the one place that can measure it.

Everything below follows from that. A feature that does not improve the report does not belong here.
## 3. Two axes, not one

**Colour answers the eye: is this a component, or is it layout?**

| | What it is |
| --- | --- |
| **Pink** | A component boundary — Banhaten's, or one of ours |
| **Teal** | Layout and markup that is not a component |

That is the question a designer is actually asking while pointing at a screen,
and it is deliberately not the same as who owns the code.

**The export label answers the agent: whose is it?**

| Label | Where a fix goes |
| --- | --- |
| `BANHATEN` | `banhaten-proposed`, or `findings.md`. **Never** the pristine sandbox |
| `OURS` | `prototypes/*/views/*.tsx`, free to change |

Keeping these apart matters. Collapsing them into the colour was the earlier
draft and it was wrong in one direction; collapsing them into ownership alone
would be wrong in the other. A pink element can be either, and the report has to
say which — this is exactly what Agentation could not do, and why both of its
trial annotations pointed at `sandboxes/banhaten/` for changes that belonged
nowhere near it.

### How each is decided

**Component or layout** comes from the React fiber. The sandbox index cannot
answer it: our own components render plain elements with utility classes, and
nothing in the DOM marks where one begins. Walking `__reactFiber$` to the
nearest named function component does, and it is honest about custom components
we write in a view.

Reading fibers is coupled to a React internal, which is normally a bad trade.
Here it is bounded: this code is dev-only, inside a frame that is itself
dev-only, and if the shape ever changes the Inspector degrades to teal rather
than breaking a prototype.

**Banhaten or ours** comes from the index built from the sandbox's own source —
189 `data-slot` values plus the `ds-*` classes for the four files that carry
none. Exact, because it is read from the code rather than inferred.

The fiber gives structure and a name. The index gives the file and the token
the fiber has no way to know. Neither replaces the other.

### The chain needs trimming at both ends

Measured on a real frame, an avatar reports `Primitive.span · AvatarContext ·
AvatarProvider · Avatar · Avatar · TopBar · SalesConsole · ErrorBoundary ·
ViewFrame · FrameApp`. Agentation's export carries the same noise, unfiltered.

Below the component: context providers, `Primitive.*` wrappers and consecutive
repeats of the same name are implementation detail, not composition.

Above the view: `ErrorBoundary`, `ViewFrame` and `FrameApp` are this tool's own
scaffolding. They are in every chain, so they say nothing about any of them.

What survives is what a person would have written: `SalesConsole › TopBar ›
Avatar`.

## 4. What gets measured
The point of building this instead of using something generic. An annotation carries evidence, not only a description.

- **Box and container.** The element's rendered size and its parent's. Most defects found here so far are about available width — truncation, clipping, bidi — and "1148px inside 1180px, no max-width" is the finding.
  
- **Banhaten tokens in effect.** The `--bh-*` custom properties actually resolved on that element, with their computed values. This is the line no other tool can produce, and the one the design system team can act on without reproducing anything.
  
- **Frame context.** Project, frame id, sandbox, appearance. Already known from the URL, and free. If a defect only appears in `rtl` or only in `banhaten-proposed`, the report says so without anyone remembering to.
  

Deliberately **not** captured: line and column numbers. See §1.
## 5. The export
One markdown block, copied to the clipboard, composed for an agent that does not have this repository open.

```markdown
## sales-console · frame "console" · banhaten · light · blue · default · ltr
### 1 · BANHATEN — ToolbarSearch
components/ui/toolbar.tsx · data-slot="toolbar-search"
in: SalesConsole › DataTable › Toolbar › ToolbarSection
box: 1148×36 in a 1180 container · no max-width
tokens: --bh-input-height 36px · --bh-radius-md 6px
> The search field is too wide, give it a max-width
### 2 · OURS — view markup
prototypes/sales-console/views/SalesConsole.tsx
box: 32×32
> Open a user menu when the avatar is pressed
```

The ancestry chain comes from the fiber, so it includes our own components and not only the design system's — `SalesConsole` appears in it, which no DOM walk could have produced. Each Banhaten link in the chain is then resolved against the index for its file and token.
## 6. Interaction
Additive to what Alt already does; nothing existing changes.

1. Hold **Alt** — highlight and name, as today. Pink or blue per §3.
  
2. **Alt-click** — a small field opens on the element. Type, save.
  
3. The element keeps a numbered marker. Keep selecting; annotations accumulate.
  
4. **Copy all** — the §5 block, and the buffer clears.
5. **Clear** — discard everything without copying. Annotating is exploratory and most of it is meant to be thrown away.
  

Per frame, in memory, never persisted. Reloading a frame loses them, which is correct and confirmed as wanted: they are a draft of a prompt, not a record.
## 7. Boundaries
Two, and both are the point rather than caveats.

**This does not replace** `findings.md`**.** The buffer is ephemeral and exists to compose one prompt. `findings.md` is the durable artifact that survives leaving the repository. If this becomes a second place to record defects there are two truths and neither can be trusted.

**This adds no authoring action.** It reads the DOM and writes to the clipboard. Nothing in the project changes — the same standing the copy button on document frames has, and for the same reason.
## 8. Non-goals
- Persistence across reloads
  
- Sending anywhere — no MCP server, no endpoint, no webhook
  
- Annotating the shell's own UI. Agentation does that better, and once this ships it is unmounted from `src/frame/main.tsx` and mounted in `src/main.tsx` instead: it belongs to the wrapper, not to the prototypes.
  
- Control panels binding prototype variables to sliders. A good idea from elsewhere that solves no problem we currently have
  
- Line and column numbers
  
## 9. Definition of done
1. Alt-hover colours by kind: pink on a Banhaten component, pink on a component of ours, teal on a layout wrapper.
  
2. An annotation carries box, container, and at least one resolved `--bh-*` token.
  
3. The export's header names the project, frame, sandbox and appearance.
  
4. The ancestry chain matches what is actually in the view file, including our own components.
5. Every entry is labelled `BANHATEN` or `OURS`, and the label is right in both cases.
  
6. Annotations in one frame never appear in another. This is what Agentation could not do, so it is the one that has to be checked by driving two frames, not by reading the code.
  
7. One real finding recorded from actually using it, pasted back and acted on. As in v1, this is the item that matters.
