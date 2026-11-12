# Taste critique: La Cocha caretaker app (2026-11-11)

Method: `tastemaker` critique mode. Evidence: rendered screens at 375px in light and dark, the
story at 8 scroll depths, measured values (contrast, font sizes, radii), `detect.mjs`.

**Brief.** An offline-first PWA for Spanish-speaking trout caretakers, used outdoors with wet
hands, plus a public scroll story. Register: calm, warm, technical-editorial (the Monad reference
from Refero, user-chosen). Stakes: medium. Ceiling: **Coherent** on the work screens (lists,
forms, counting), **Convicted** on the story and the sign-in card.

## Craft floor (measured)

| Dimension | Before | After |
|---|---|---|
| Spacing | 4px token scale, a few literals (3px chip padding) | unchanged, acceptable |
| Type (CR-102) | 14 distinct sizes, four near-equal small ones | 11; small sizes collapsed to `--text-xs` (heuristic, still over a ~5 cap: 7 tokens + 3 fluid one-offs) |
| Color (CR-201, law) | muted ink 4.03:1 on paper, used at 10.9px | 4.94:1; every chip pair 5.0:1 or more; dark mode 6.1:1 or more |
| Shadow | none (by the reference) | n/a |
| Alignment (CR-403) | radii 16 / 10 / pill / 40 (+28 phone frame) | one system, passes |
| Density | airy cards, dense labels | fine for context |

## Findings

1. **STRENGTH, Convicted (TS-001).** The app decided: paper, serif plus mono, outlines, halos, a
   trout repainted in the palette. Mint and periwinkle light reads as water without a literal lake.
2. **GAP, fixed (TS-003, TR-003 seed).** The lote screen had five equal charcoal pills. Now one
   primary (the counter), the record types are outlines.
3. **GAP, fixed (TS-004).** The title mask replayed on every navigation: motion as texture on a
   tool used all day. It stays only in the story. Motion itself is not evaluable from stills.
4. **GAP, open (TS-011, TR-004 seed).** Tracked uppercase labels at 12px in a muted tone are the
   weak spot for sun and glare. Needs a check outdoors, not a screenshot.
5. **GAP, open (TS-005).** Raw backend text reaches the screen (`ruta no encontrada` on
   Sincronización). The edge case deserves the same care as the full state.
6. **GAP, open (template chrome).** Six `A · B · C` meta strings in rows (`detect.mjs` P2).
7. **DEFENDED (stated intent).** Warm paper plus serif is a known default cluster. It holds because
   it was chosen from a reference and committed to (halos, trout, system diagram), not reached by
   reflex.

## Verdict

Rung reached: story and sign-in **Characterful, near Convicted**; work screens **Coherent**, at
their ceiling. Grade: **Tasteful** for the story and shell; **Competent** overall until the type
scale (1) is consolidated and findings 4 to 6 are closed.

The climb: collapse the three fluid one-off sizes into the token scale, then test legibility in sun.
Protect: the single-primary rule and the system diagram.

*This assesses craft and taste, not whether the app works (usability, accessibility: run a UX
critique) or whether it was worth building. Tasteful is not the same as ready to ship.*
