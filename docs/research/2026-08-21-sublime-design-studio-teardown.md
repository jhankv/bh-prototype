# Teardown: Patrick Morgan's Prototyping Environment (Sublime Security)
**Source:** Dive Club interview with Patrick Morgan — [https://youtu.be/628c4YuxAEM](https://youtu.be/628c4YuxAEM)**Transcript:** obtained via `yt-dlp --write-auto-subs --sub-langs en` (~10.5k words) **Date analyzed:** 2026-08-21 **Purpose:** extract the primitives and lessons worth stealing for our own, deliberately smaller, prototype playground.

* * *
## 1. The problem he was solving
Patrick is a product designer at Sublime Security (enterprise email security). In December 2025 he was in Figma 95% of the time. Today he is "almost never in Figma."

He identified three failing options:

| Option | Why it failed |
| --- | --- |
| Claude artifacts | Fast, but disconnected from the product, not persistent, impossible to build on over time |
| Prototyping in production | Too many constraints in a large enterprise security app; laborious, slow, hostile to a design workflow |
| Figma | Static; can't reason about state combinations without running code |

His answer was the **middle ground**: a dedicated prototyping environment, close enough to production to be credible, far enough away to be free.

> "The benefits of giving yourself just enough distance. Even most of my very divergent explorations, I probably don't want those too close to the actual production code in a cyber security company."

Two goals drove it:

1. **Centralize** prototypes so a team compounds value over time.
  
2. **Preserve flexibility** of open-ended prototyping.
  

* * *
## 2. The system primitives
He deliberately invented a small vocabulary and taught it to the agent. This is the single most transferable idea in the whole interview.
### Blueprint
Production-faithful reference screens — snapshots of specific product views, ported (not fully recreated) from the production codebase. They are **starting points**, not a component library.
### Prototype
A named unit of work owned by a contributor. Created by a **script**, not freehand — an agent rule points at the script so every prototype is scaffolded identically.
### View
An actual interactive React screen inside a prototype. Powered by **local mock data shaped like the production data model** — never real production data.
### Canvas
A JSON file that **points at** views and documents and arranges them spatially. Critically:

> "It's not pulling any of the frames into the context of the canvas. It's sort of just pointing at all your other React views that you've built, or the documents."
### Frame / Section / Row
Borrowed straight from Figma, unapologetically. Frames sit in sections; sections stack in rows. Storyboard-style, mirroring how he already organized Figma handoffs.
### Document
Markdown/MDX living alongside prototypes: design critiques, "how might we" lists, handoff docs, design principles, personas.
### Tool
A prototype that "graduated" — same structure under the hood, but promoted to a self-serve internal utility (the brand team ships OG-image generators this way).

* * *
## 3. The workflow loop he demoed
```
blueprint
  └─> prototype (scaffolded by script)
        └─> critique document        ← agent reads design principles from the repo
              └─> scorecard + "How might we…"
                    └─> 5 lo-fi variants laid out on the canvas
                          └─> annotate frames directly (agent harness element picker)
                                └─> pick a direction, iterate
                                      └─> promote to hi-fi in a NEW canvas section
                                            └─> handoff document for the engineer's agent
```

Everything on the canvas is **live and interactive** — not screenshots. That is load-bearing: he annotates real rendered code, and the agent edits the source behind it.

* * *
## 4. Architectural decisions worth copying
### The UI is a rendering surface, nothing more
> "There are no actions that the user takes through this UI. It's designed intentionally to be used in the context of these agent coding harnesses where the primary and exclusive interaction is communicating to the agent."

No editing UI. No drag-and-drop authoring. The agent mutates JSON and TSX; the app renders. This collapses the build cost by an order of magnitude.
### No backend, no user system
Built with Vite as a static site compiler, deployed to Vercel. This is what got it past his own company's security review:

> "There's not really anything to be hacked about it. It's just kind of a website."
### He refused to build commenting
People asked for a comment system immediately. He said no — it needs a backend and it would have eaten the project. He later adopted the **Vercel Toolbar** comment feature, which works on the deployed site _including on the canvas_.

**Lesson: do not build a comment backend. Buy, borrow, or use files.**
### Contributor folders as the guard rail
Every contributor gets their own folder. The agent scopes work to it.

> "You can break your own stuff, but you can't break other people's stuff."

Anything crossing that boundary escalates to a normal dev review workflow.
### Agent rule architecture
```
CLAUDE.md ─┐
.cursorrules ─┼─> AGENTS.md ─> 4 always-loaded rules
copilot-instructions ─┘              │
                                     ├─ routing: product prototype / brand prototype / the environment itself
                                     ├─ conventions for the chosen route
                                     └─ contributor scope
                                     
   "methods" (≈ skills) loaded ON DEMAND:
     design-critique · explorations · handoff
```

He also wrote **a rule whose job is to update the other rules**, because docs going stale silently broke agent behavior.
### Fidelity is a deliberate dial
For months the environment produced **lo-fi only** — handwritten font plus grayscale applied over production-fidelity UI. Not a limitation; a communication decision:

> "I didn't want to mislead people by creating something that was almost production fidelity but not actually production fidelity, and then end up with this big communication gap."
### Production as a sibling repo
The production codebase sits next to the prototype repo, so the agent can cross-reference: _"does this match production?"_ → agent reads production source → corrects the prototype.
### Porting components with an agent loop
He ran a loop over the production component library: read component → reconstruct it for the prototype environment → strip what doesn't serve prototyping (e.g. form validation logic).

**Gotcha he hit:** his first attempt told the agent to _shim_ production components instead of rebuilding them. It produced "a ton of slop" he couldn't use. Rebuilding from scratch worked.
### Duplication is no longer expensive
> "I'm down to duplicate literally everything and just play in frontend land, because the agents are basically able to execute and bring it back over to the production folder system."

Production code and prototype code are two different languages optimized for different jobs. Agents are excellent translators between them.

* * *
## 5. The timeline (this is the most encouraging part)
| When | What |
| --- | --- |
| **Jan 27** | First commit. A scaffold that displayed two existing HTML prototypes. That's it. |
| Feb–Mar | Figma plugin to screenshot prototypes back into Figma for comments (later abandoned) |
| Spring | Noticed repeatable patterns → wrote the prototype-creation script + agent rule |
| —   | Rules going stale → rule that updates rules |
| —   | Design system browser section (so he'd know what he had to work with) |
| Summer | Canvas primitive, documents, deployment, Vercel comments, tools section |
| Aug (today) | The full environment shown in the video |

Six-plus months, incremental, alongside his actual job. His starting scope was literally _"can we get our work to live in one place together?"_

* * *
## 6. His advice for someone starting
1. **Don't equate prototyping with high fidelity.** Lo-fi delivered value for months.
  
2. **Start by centralizing.** Even just "our prototypes live in one place" compounds.
  
3. **Solve your own tensions, one at a time.** Every feature came from a felt friction.
  
4. **Make the agent describe approaches in text before it generates UI.** Faster to reject a bad direction as a sentence than as a screen.
  
5. **Always ask the agent for follow-up questions before it builds.**
  
6. **It's a dev environment built for non-developers** — assume the human never touches the mechanics; the agent does everything on their behalf.
  
7. **It's a product design problem.** Custom to your team, your workflow, your tensions.
  

* * *
## 7. What this means for OUR playground
Our context is deliberately different, and that shrinks the scope a lot.

| Dimension | Sublime | Us  |
| --- | --- | --- |
| Team | Multiple designers + brand team | One person, growing later |
| Production codebase | Exists, ported into blueprints | None — the design system _is_ the subject |
| Subject under test | Their product's screens | The **Banhaten design system** itself |
| Audience | Whole org | Design lead |
| Deployment | Vercel + security review | Local first |
| Feedback mechanism | Vercel Toolbar comments | Files in the repo |
### Steal directly
- **Vocabulary as architecture**: project, canvas, frame, prototype, document. Define them, teach them to the agent in `AGENTS.md`, never let the agent invent its own structure.
  
- **Canvas as a JSON file that points at things.** Never as a stateful editor.
  
- **UI is a rendering surface.** Zero authoring UI in v1. Claude Code edits files; the browser renders.
  
- **Documents live next to prototypes** and are first-class citizens on the canvas.
  
- **Design principles in the repo** so the agent can run a critique against them.
  
- **Interactive, not screenshots.** Non-negotiable.
  
- **No backend. No comment system.** Feedback is markdown/JSON in git.
  
- **Prototype scaffolding via script**, so structure never drifts.
  
### Adapt
- **Blueprints** → we have no production app. Our equivalent is a **design system browser**: every Banhaten component rendered, with its docs (`banhaten docs <component> --json`) and its token modes.
  
- **Critique against principles** → our critique target is the **design system**, not a product screen. Output: component-level findings (missing tokens, hierarchy, text rendering) that become actionable feedback for the Banhaten team, backed by `banhaten diff`.
  
- **Fidelity dial** → less relevant for us. Banhaten gives production fidelity from day one.
  
### Our unique angle he does not have
Banhaten exposes appearance as HTML attributes: `class="dark"`, `data-theme` (7 brands), `data-radius` (3), `dir` (ltr/rtl).

Because every frame is its own iframe, it is its own `<html>`. So one canvas can show:

```
[ login · light · blue · ltr ]   [ login · dark · brown · rtl ]   [ login · sharp · green ]
```

Simultaneously, live, interactive. That is a matrix view of a design system that neither Figma nor Storybook gives you cheaply. **This should be the headline feature of our v1.**

* * *
## 8. Proposed v1 scope (ruthlessly small)
```
prototypes/
  <project>/
    manifest.json        # project name, description
    canvas.json          # frames: id, view, x, y, w, h, theme, mode, radius, dir
    views/*.tsx          # interactive React screens
    documents/*.md       # critiques, notes, findings
src/
  app/                   # dashboard + canvas shell (the "rendering surface")
  frame/                 # iframe entry that mounts one view with one appearance config
sandboxes/
  banhaten/              # PRISTINE — never edited. `banhaten update` is always safe here.
    globals.css          # Tailwind v4 + Banhaten tokens
    components/ui/       # source installed by `npx banhaten add`
  banhaten-proposed/     # OUR FIXES — same install, edited on purpose.
    globals.css          # `npx banhaten diff --cwd sandboxes/banhaten-proposed`
    components/ui/       #   -> that diff IS the proposal sent to the DS team
docs/
  principles.md          # our design principles — the agent reads these
AGENTS.md                # vocabulary + rules
```

**In v1:**

- Dashboard listing projects as cards
  
- Canvas with pan + zoom, frames positioned from `canvas.json`
  
- One iframe per frame, appearance config passed via URL params
  
- Markdown documents renderable as frames on the canvas
  
- `AGENTS.md` defining the vocabulary so Claude Code scaffolds consistently
  

**Explicitly NOT in v1:**

- Comment system of any kind
  
- Contributor folders / multi-user scoping
  
- Deployment
  
- Lo-fi mode
  
- The "tools" section
  
- Any authoring UI
  

* * *
## 9. Decisions (resolved 2026-08-22)

### 9.1 Consume AND fix — in two separate sandboxes

The goal is all three things at once: test the design system, leave notes on what works and what is missing, and demo our proposed fix. Those are not in conflict if the component source is duplicated.

```
sandboxes/banhaten/            <- pristine. What Banhaten ships today.
sandboxes/banhaten-proposed/   <- our edits. What we think it should do.
```

Both are real installs of the same registry. The pristine one is never touched, so `npx banhaten update` never fights us and our demos always show honest current behavior. The proposed one is where we fix spacing tokens, hierarchy, text rendering — whatever we find.

This unlocks the strongest possible artifact for a design review. The same view, twice, side by side on one canvas:

```
[ login  ·  banhaten        ]     [ login  ·  banhaten-proposed ]
   "this is what it does today"      "this is what it should do"
```

…plus the machine-readable proof of exactly what changed:

```bash
npx banhaten diff --cwd sandboxes/banhaten-proposed --json
```

Findings that are NOT worth fixing in code (a missing token, a naming problem, an accessibility gap) stay as notes in `documents/*.md` next to the prototype. Every finding therefore lands in one of two places: a markdown note, or a diff.

**Frames declare which sandbox they render against.** One extra field in `canvas.json`:

```json
{ "id": "login-today", "view": "login", "sandbox": "banhaten", "theme": "blue", "mode": "light" }
{ "id": "login-fixed", "view": "login", "sandbox": "banhaten-proposed", "theme": "blue", "mode": "light" }
```

### 9.2 The design-system browser is just another project

The term was unclear in the first draft. A "design system browser" means a page like Storybook: every Banhaten component rendered live, with its variants, states, and docs, so you can see what you actually have to work with. Patrick built one for exactly that reason.

We do not need a new primitive for it. It is a project like any other:

```
prototypes/design-system/
  canvas.json
  views/button.tsx      # every Button variant, size, and state
  views/input.tsx
  documents/findings.md
```

One frame per component, laid out on a canvas. The primitives we already have cover it completely.

**It is not v1.** Build the canvas first with one real prototype, because the demo for the design lead is a screen, not a component grid. The browser comes right after, and it costs nothing extra by then.

### 9.3 Local first, Vercel when it is useful

Local for now. Vercel later, and it stays cheap because the architecture already earns it: static Vite build, no backend, no user system, no database. That is the same property that got Patrick's tool through a security review at a security company.

Two things to keep true from day one so deployment never becomes a rewrite:

1. **No server-side anything.** Frames resolve through `import.meta.glob`, not through a runtime lookup.
2. **Frame URLs are shareable.** Appearance config lives in URL params, so any frame can be opened standalone by link.

Deployment is not in v1, but v1 must not close the door on it.
