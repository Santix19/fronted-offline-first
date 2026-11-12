# Design decisions (newest first)

Read before editing UI. Tokens live in `src/styles/tokens.css`; a value that is not a token is a
new decision and gets a line here.

## 2026-11-12: loud restyle to `design.md` (whole app; supersedes the Monad direction below)

- **Why:** the team found the app too quiet; Nico chose a whole-app restyle to `design.md` ("cutout kinetic optimism") and asked for it "really really loud".
- **Type:** Oswald 700 (stand-in for GrotzecCondensedLatin, per design.md) for headings and numbers; Inter for everything else. Caslon and Plex Mono removed.
- **Colour:** canvas `#f5f5f5`, flat white cards with no border or shadow, near-black pills; lime / cornflower / peach as object and card colours, never full-page bands. One black chapter per flow: the home trend, the batch summary, the story's sync scene.
- **Kept against the map:** status colours (ok / warn / danger) stay coloured, not black; the focus ring stays ink (cornflower is 2.4:1 on the canvas) with a blue halo; taps keep 180ms feedback.
- **Supersedes "UI motion under 300ms" and "screen titles appear instantly":** every screen title rises word by word (`MaskedText`), cards rise from a tilt with a 0.08s stagger capped at 6, objects drop in with a bounce. Reduced motion turns all of it off (checked: 0 moving elements).
- **Signature pieces** (`src/shared/ui`): `Backdrop` (drifting chamfered gradients, pointer parallax), `CapsuleRibbon` (60s marquee of real records), `GlossyObject` (layered SVG with an extruded edge; Canva was not connected for rendered 3D).
- **Detector:** the violet-to-blue gradient, bounce easing and count-ups are marked `avoid-ai-design-ignore`: the brief chose them.

## 2026-11-11: craft audit against `checking-project-decisions/craft.md`

- **Muted ink is `#6b6968`**, not the reference's `#797776`: 4.03:1 on paper fails small text; this is 4.94:1.
- **Focus ring is charcoal** (`--focus: var(--ink)`), not the reference's `#9c9998` (about 2.5:1).
- **UI motion stays under 300ms**: a screen's entrance is 240ms with a 40ms stagger capped at 5 items; tab pill 240ms. Slower motion (ripple, leap, breathing dots) is rare or ambient and reads from tokens.
- **Screen titles appear instantly.** The word mask belongs to the story only (a tool used all day must not replay choreography on every tap).
- **Three easings at most**: `--ease-water` (arrivals), `--ease-loop` (things that breathe), and the matching GSAP curves in `presets.ts`; scrubbed timelines use the same `fluid` curve.
- **KPIs are one outlined strip with hairlines**, not four identical bordered cards.
- **Story copy only claims what the app does**: no "four record types" (there are five), no "nothing is ever lost"; example data is labelled.
- **Backend sentences are shown on purpose** (they are written for the caretaker); only the generic "ruta no encontrada" is mapped to plain words.
- **Accepted, not fixed:** the `A · B · C` meta strings across older screens (`detect.mjs` P2). Preserve mode: not touched in this pass.

## 2026-11-11: visual direction

- **Monad style from Refero** (user-chosen reference): warm paper `#f6f3f1`, charcoal ink, Libre Caslon Text (headlines) and IBM Plex Mono (body), 1px outlines, pill buttons, pastel halos as light behind content. Cobalt `#3155c5` is defined but unused until there is one small nav action for it.
- **Light is the default theme** (outdoor use); dark is the same system on warm charcoal.
- **The story comes before sign-in** the first time on a phone, then never again (`storySeen` in the phone's database).
