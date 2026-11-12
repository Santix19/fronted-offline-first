# MetaMask — cutout kinetic optimism

## Overview

A punchy consumer-product style that makes complex tools feel tangible and energetic. Condensed poster headlines and plain grotesk copy sit on a pale grey canvas, interrupted by candy-coloured objects, clipped gradient shapes and occasional black chapters. Oversized interface fragments, polished three-dimensional symbols and sunny low-angle portraits keep the spacious layouts playful rather than institutional.

### Essentials

- Poster-sized verbs, not polite software headings: GrotzecCondensedLatin at 180px/0.82, weight 400 and -0.02em tracking leads the default marketing opening; section titles use 72px/0.94.
- The opening is a collision of copy and product: a three-line headline fills the left half while an oversized black interface occupies the right half, backed by a diagonal-cut colour shape; the 64px black pill action remains above the 900px fold.
- Colour lives in objects and bounded stages: #f5f5f5 carries most of the default page, white cards structure details, and lime, blue and peach fill individual capability cards. A black feature chapter creates a deliberate full-width interruption rather than an all-dark site.
- Soft controls meet hard diagonals: buttons have 100px radii, ordinary cards use 8px–17px corners, but hero artwork and closing panels have conspicuous chamfered cuts. Include this diagonal device on every new page, using a clipped CSS gradient if bespoke art is unavailable.
- Product proof feels touchable: black interface enlargements mingle with glossy coins, shields, keys or equivalent product metaphors. Keep at least one sculptural object treatment; a layered SVG with a shaded bevel is the minimum alternative to three-dimensional rendering.
- A lively horizontal strip and a monumental closing stage balance the grid: white rounded activity capsules drift across the canvas, and a 124px/0.91 closing headline sits in a diagonal gradient frame over sunny photography. Substitute meaningful activity and a strongly lit product-in-use scene for unrelated financial imagery.

## Colors

### Accent

| Name | Value | Token | Roles | Use |
| --- | --- | --- | --- | --- |
| Electric green badge | `#baf24a` | `--color-badge` | surface, accent | Small NEW markers beside navigation links. |
| Cornflower | `#73a6ff` | `--color-blue` | surface, accent | Capability cards and the cool end of clipped gradient panels. |
| Gradient violet | `#c66ef5` | `--color-gradient-purple` | accent, background | Violet end of the blue-to-purple conversion panel; match the soft colour blend rather than introducing glow. |
| Lime card | `#e3ff89` | `--color-lime` | surface, accent | A capability-card backing; let the object provide contrast rather than adding a border. |
| Peach | `#ffc0a5` | `--color-peach` | surface | Capability cards and the newsletter module. |

### Neutral

| Name | Value | Token | Roles | Use |
| --- | --- | --- | --- | --- |
| Near black | `#0a0a0a` | `--color-ink` | text, background, action | Default text, pill actions and the high-contrast feature chapter. |
| Charcoal | `#393d46` | `--color-muted` | text | Secondary footer utilities. |
| Soft grey caption | `#6c6c6c` | `--color-caption` | text | Visible result of near-black text at 0.6 opacity over white in proof cards. |
| Slate on black | `#a1a8b7` | `--color-dark-muted` | text | Supporting copy and captions in the black feature chapter. |
| Cool hairline | `#e9edf6` | `--color-rule` | border, surface | Footer separators and social-button backing. |
| Pale grey | `#f5f5f5` | `--color-canvas` | background, surface | Dominant marketing canvas and inset benefit cards. |
| White | `#ffffff` | `--color-white` | text, surface, background | Cards, footer, activity capsules and reversed action labels. |

### Page-type variants

| Only for | Name | Value | Token | Roles | Use |
| --- | --- | --- | --- | --- | --- |
| prediction-style educational product campaigns | Bright orchid | `#d075ff` | `--color-purple-type` | text | Oversized display text on aubergine. |
| immersive block-letter campaigns | Warm coral peach | `#ffa680` | `--color-legacy-peach` | background, surface | Full security scene and selected tiles. |
| immersive block-letter campaigns | Electric midnight | `#190066` | `--color-legacy-indigo` | background, text, surface | Money-themed sculptural stages and contrasting text. |
| prediction-style educational product campaigns | Deep aubergine | `#3d065f` | `--color-purple` | background, text | Full explanatory chapter and dark purple campaign surfaces. |
| prediction-style educational product campaigns | Lilac card | `#e1a9ff` | `--color-lilac` | surface | Benefit-card backings paired with near-black copy. |
| immersive block-letter campaigns | Pale lavender | `#eac2ff` | `--color-legacy-lilac` | text, background, surface | Alternates with aubergine in the block-letter campaign treatment. |
| immersive block-letter campaigns | Ice blue | `#cce7ff` | `--color-legacy-blue` | text, surface | Block headline fill and pale feature stages. |
| immersive block-letter campaigns | Deep forest | `#013330` | `--color-legacy-green` | background, surface, text | Opening stage and dark feature tiles. |

## Typography

- **GrotzecCondensedLatin** — Default marketing headlines, card titles and prominent numbers. Very narrow, heavy-looking grotesk with tall vertical strokes; regular weight has a dense poster silhouette. If unavailable, use **Oswald**. Use 700 for comparable darkness; preserve narrow line lengths and tune wrapping. Font stack: "GrotzecCondensedLatin", "Oswald", "Arial Narrow", "Helvetica Neue Condensed", Arial, sans-serif.
- **Inter** — Default paragraphs, navigation and actions. Direct utilitarian grotesk; slightly tightened paragraph tracking and medium-weight pill labels. Font stack: "Inter", Arial, "Helvetica Neue", Helvetica, sans-serif.
- **MMPolyVariable** (only for immersive block-letter campaigns) — Graphic word sculptures and campaign headlines. Extremely broad, nearly solid uppercase letterforms with small counters and softened polygonal shoulders. If unavailable, use **Dela Gothic One**. Use 400; compress line spacing and keep words as dense graphic blocks. Font stack: "MMPolyVariable", "Dela Gothic One", "Arial Black", Arial, sans-serif.
- **MMSansVariable** (only for immersive block-letter campaigns) — Campaign section headings and feature labels. Wide rounded contemporary sans with a softer geometric rhythm than the default condensed display. If unavailable, use **Space Grotesk**. Font stack: "MMSansVariable", "Space Grotesk", Arial, "Helvetica Neue", Helvetica, sans-serif.
- **MMEuclidCircularB** (only for immersive block-letter campaigns) — Campaign supporting copy and navigation. Round geometric sans with open counters and easygoing proportions. If unavailable, use **DM Sans**. Font stack: "MMEuclidCircularB", "DM Sans", Arial, "Helvetica Neue", Helvetica, sans-serif.

| Recipe | Font | Weight | Size | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- | --- |
| display | GrotzecCondensedLatin | 400 | 180px | 0.82 | -0.02em | Default three-line marketing hero headline. |
| closing-display | GrotzecCondensedLatin | 400 | 124px | 0.91 | -0.02em | Monumental closing conversion statement. |
| chapter-heading | GrotzecCondensedLatin | 400 | 76px | 0.9 | -0.01em | Editorial feature and trust chapter leads. |
| heading | GrotzecCondensedLatin | 400 | 72px | 0.94 | normal | Main section leads, frequently centred over grids. |
| feature-stat | GrotzecCondensedLatin | 400 | 58px | 0.92 | -0.01em | Large numerals in the black technical chapter. |
| card-heading | GrotzecCondensedLatin | 400 | 42px | 0.9 | normal | Capability cards and alternating tutorial rows. |
| compact-heading | GrotzecCondensedLatin | 400 | 32px | 1 | normal | Smaller benefit-card titles. |
| stat | GrotzecCondensedLatin | 400 | 32px | 0.92 | -0.01em | Numbers in compact proof tiles. |
| lead | Inter | 600 | 26px | 1.2 | normal | Bold support paragraph immediately below the default hero. |
| hero-button | Inter | 500 | 24px | 1 | -0.02em | Large conversion action in the default opening. |
| body-lg | Inter | 400 | 20px | 1.3 | -0.02em | Section introductions and product-page hero support. |
| article-heading | Inter | 500 | 20px | 1.24 | -0.02em | Related reading titles; deliberately not condensed display. |
| body | Inter | 400 | 16px | 1.3 | -0.02em | Card descriptions and explanatory details. |
| section-button | Inter | 500 | 16px | 1 | normal | Closing and benefit-section actions. |
| nav | Inter | 400 | 16px | 1.24 | normal | Navigation and footer links. |
| form-heading | Inter | 600 | 16px | 1.3 | -0.02em | Compact newsletter invitation. |
| caption | Inter | 400 | 14px | 1.3 | -0.02em | Metric explanations and compact trust-card details. |
| button | Inter | 500 | 14px | 1 | normal | Header conversion action and newsletter submission. |

### Page-type variants

| Only for | Recipe | Font | Weight | Size | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| dedicated product landing pages | product-display | GrotzecCondensedLatin | 400 | 132px | 0.94 | normal | Split hero and major educational statement. |
| immersive block-letter campaigns | campaign-display | MMPolyVariable | 400 | 120px | 1 | normal | Dense centred word sculpture in the opening. |
| immersive block-letter campaigns | campaign-chapter | MMPolyVariable | 400 | 104px | 1 | normal | Full-stage campaign transitions and closing calls. |
| immersive block-letter product campaigns | campaign-product-display | MMPolyVariable | 400 | 66px | 1 | normal | Left-aligned three-line campaign product hero. |
| immersive block-letter product campaigns | campaign-heading | MMSansVariable | 400 | 48px | 1.16 | normal | Explanatory and question-section headings. |
| immersive block-letter product campaigns | campaign-grid-heading | MMSansVariable | 400 | 40px | 1.2 | normal | Centred benefit and onboarding headings. |
| educational product pages | question | Inter | 400 | 30px | 1.1 | -0.02em | Large question labels in the wide accordion. |
| immersive block-letter product campaigns | campaign-body | MMEuclidCircularB | 400 | 20px | 1.4 | normal | Campaign hero support. |

**Notes:**

- The condensed display face looks bold at weight 400; do not simulate its silhouette by stretching Inter.
- The default hero uses -0.02em tracking and unusually tight 0.82 line height. Section leads loosen to 0.94 and normal tracking.
- Keep paragraph tracking at -0.02em in the default system. Navigation is normal-tracked; default headings remain sentence case.
- The block-letter system is a separate art direction, not an extra display face to mix into ordinary condensed layouts.

## Layout

**Density:** Airy stages with compact internal copy: broad vertical pauses separate large objects, while cards and footer navigation remain efficient.

### Spacing

| Value | Use |
| --- | --- |
| 8px | Title-to-description gaps in editorial cards and icon-label spacing. |
| 10px | Inline link and action grouping. |
| 16px | Default grid gutters and footer link separation. |
| 20px | Capability-card row gutter. |
| 24px | Proof-tile padding and generous inline groups. |
| 32px | Horizontal feature-card padding and heading/support stacks. |
| 39px | Default opening headline-to-support spacing. |
| 50px | Default hero support-to-action spacing. |
| 80px | Common major-section top padding. |
| 120px | Capability-section bottom padding and benefit-section top padding. |
| 155px | Deep benefit-section bottom breathing room. |

### Containers and grids

- **outer-container**: max width 1920px · side padding 24px. Centred site-wide container; at desktop the usable width is 1392px.
- **editorial-content**: max width 1216px. Inset educational sections, article rows and feature grids; centred within the outer container.
- **capability-grid**: 4 columns · gap 20px. Four upright coloured cards across the default marketing page.
- **benefit-grid**: 3 columns · gap 23px. Three large cards over a full-bleed lifestyle image.
- **wide-feature-grid**: 2 columns · gap 16px. 600px-wide horizontal cards, allowing an incomplete final row instead of stretching the last item.
- **article-grid**: 3 columns · gap 16px. Three equal editorial cards with 394px-wide landscape thumbnails.
- **structural-grid**: 16 columns · gap 16px. Underlying alignment system for split product heroes and footer columns.

## Corner radius

| Only for | Element | Radius |
| --- | --- | --- |
|  | pill-actions | 100px |
|  | capability-cards | 17px |
|  | proof-cards | 16px |
|  | feature-cards | 8px |
|  | social-controls | 4px |
| immersive block-letter campaigns | campaign-bento | 40px |

## Surfaces and depth

### Surfaces

#### Pale canvas · level 0

**Use:** Default marketing page backing.

**CSS:** `background: #f5f5f5; color: #0a0a0a`

**Observed:** An uninterrupted light field across multiple sections, not alternating grey stripes.

**Transfer:** Let content and objects change the rhythm rather than tinting every section differently.

#### Flat white card · level 1

**Use:** Trust and detailed-benefit content.

**CSS:** `background: #ffffff; border-radius: 16px; box-shadow: none`

**Observed:** White against pale grey gives enough separation; selected trust cards have a clipped upper corner.

**Transfer:** Use the same flat contrast and one chamfer rather than elevation effects.

#### Black chapter · level 0

**Use:** A focused advanced-capability chapter.

**CSS:** `background: #0a0a0a; color: #ffffff`

**Observed:** Full-width black stage with muted slate support copy and enlarged product art escaping its upper edge.

**Transfer:** Reserve for one strong technical story rather than turning every section dark.

#### Clipped conversion panel · level 1

**Use:** Conversion emphasis and geometric art backing.

**CSS:** `background: linear-gradient(198.8deg, #c66ef5 32%, #73a6ff 87%); border-radius: 8px; clip-path: polygon(74px 0px, 100% 0px, 100% calc(100% - 74px), calc(100% - 74px) 100%, 0px 100%, 0px 74px)`

**Observed:** The blue-violet conversion variant cuts opposing corners; photo-backed marketing closers use a wider diagonal aperture and a warm-to-purple blend.

**Transfer:** Preserve the flat polygon silhouette. Match the soft gradient blend; exact stops are not essential for the warm photographic variant.

#### White utility ending · level 0

**Use:** Footer and breadcrumb bands.

**CSS:** `background: #ffffff; border-top: 1px solid #e9edf6`

**Observed:** A quiet utility ending after high-energy conversion artwork.

**Transfer:** Use thin cool rules, not a dark footer or another promotional gradient.

#### Purple education stage · level 0

**Only for:** prediction-style educational product campaigns

**Use:** Long-form explanation with one oversized illustrative object.

**CSS:** `background: #3d065f; color: #d075ff; padding: 80px 0px`

**Observed:** Headline, panoramic illustration and paragraph stack inside the inset editorial width.

**Transfer:** Keep the colour pair coherent across the educational chapter.

## Components

### Fixed navigation

**Use:** Persistent brand and conversion controls.

**CSS:** `position: fixed; height: 98px; width: 100%; z-index: 100`

**Observed:** Wordmark at left; a black Header pill and black circular menu toggle at right. The menu contains two thin white horizontal strokes; navigation links are not spread across the visible bar.

**Transfer:** Use a compact wordmark for the new product and keep the right cluster sparse.

### Primary button

**Use:** Main conversion action in the opening.

**CSS:** `display: flex; align-items: center; justify-content: center; height: 64px; padding: 0px 34px; background: #0a0a0a; color: #ffffff; border-radius: 100px`

**Text style:** `hero-button` — Inter 500 · 24px/1 · tracking -0.02em

**Observed:** Single concise label. Section actions shrink to 56px high with the section-button recipe; the header uses Header pill.

**States:** Declared: hover text-decoration none; focus-visible outline rgb(99, 154, 249) inset 3px, outline-offset 3px and opacity 1; active background #0a0a0a.

### Header pill

**Use:** Persistent conversion and compact newsletter submission.

**CSS:** `display: flex; align-items: center; justify-content: center; height: 42px; background: #0a0a0a; color: #ffffff; border-radius: 100px`

**Text style:** `button` — Inter 500 · 14px/1

**Observed:** A compact, self-contained action paired with the circular menu control. Newsletter submission uses the same dark pill.

**States:** Declared: hover text-decoration none; focus-visible outline rgb(99, 154, 249) inset 3px and outline-offset 3px; active background #0a0a0a.

### Capability card

**Use:** Product breadth presented as a family of tangible capabilities.

**CSS:** `display: flex; flex-direction: column; width: 318px; background: #e3ff89; border-radius: 17px; overflow: clip`

**Text style:** `card-heading` — GrotzecCondensedLatin 400 · 42px/0.9

**Observed:** Large isolated object occupies the top half; title, short body and small black action sit below. Siblings use blue, peach and white rather than variations of one tint. The body is inset 17px horizontally.

**Transfer:** Assign one tangible metaphor and one clear outcome to each capability.

### Horizontal feature card

**Use:** Compact benefit explanation beside an oversized object.

**CSS:** `background: #ffffff; border-radius: 8px; padding: 32px; position: relative`

**Text style:** `compact-heading` — GrotzecCondensedLatin 400 · 32px/1

**Observed:** Text occupies a narrow left column of about 259px while a glossy symbol or interface fragment fills the right, often clipped by the edge. Educational variants use lilac backing.

**Transfer:** Pair an operational benefit with one large symbol; retain text contrast.

### Proof tile

**Use:** Ratings, reach and trust proof beneath feature cards.

**CSS:** `background: #ffffff; border-radius: 16px; padding: 24px`

**Text style:** `stat` — GrotzecCondensedLatin 400 · 32px/0.92 · tracking -0.01em

**Observed:** Compact number first, caption below with an 8px gap. Five tiles form a low horizontal band; caption uses near-black at 0.6 opacity on white.

**Transfer:** Use verified proof and short captions. In an immersive campaign, expand proof into tall coloured illustration cards instead of reusing this compact row.

### Newsletter card

**Use:** Subscription invitation in the footer's left column.

**CSS:** `background: #ffc0a5; border-radius: 8px; padding: 12px; max-width: 329px`

**Text style:** `form-heading` — Inter 600 · 16px/1.3 · tracking -0.02em

**Observed:** Bold invitation, small preference checkboxes, then a white rounded email entry with a dark submit pill attached at the right. Privacy copy sits separately below.

**Transfer:** Keep it a small peach utility module, not a full-width final sales section.

### Article card

**Use:** Related educational reading near the ending.

**CSS:** `display: flex; flex-direction: column; gap: 24px`

**Text style:** `article-heading` — Inter 500 · 20px/1.24 · tracking -0.02em

**Observed:** Landscape thumbnail above title and short description. A small black category badge sits at the thumbnail's upper-right corner; image panels use diagonal cuts. Title-to-description gap is 8px, and the row's All articles link sits above at the right.

**Transfer:** Make thumbnails small versions of the same object-and-colour visual language.

### Social square

**Use:** Footer social destinations.

**CSS:** `display: flex; justify-content: center; align-items: center; width: 42px; height: 42px; background: #e9edf6; border-radius: 4px`

**Observed:** Black filled platform symbols sit in a tightly spaced horizontal row with 4px gaps.

**States:** Declared: hover text-decoration underline 0.1rem with text-underline-offset 0.4rem; focus-visible outline rgb(99, 154, 249) inset 3px and outline-offset 3px.

### New badge

**Use:** Small status marker next to selected navigation links.

**CSS:** `display: flex; align-items: center; justify-content: center; background: #baf24a; border-radius: 4px; height: 26px; padding: 0px 8px`

**Observed:** Small uppercase Inter label, 12px/19.8px at weight 600; kept adjacent to the link rather than floated to the far edge.

### Footer link column

**Use:** Grouped product and company navigation.

**CSS:** `display: flex; flex-direction: column`

**Text style:** `nav` — Inter 400 · 16px/1.24

**Observed:** Semibold category lead above regular links with 16px separation. Multiple columns align beside the wordmark and Newsletter card; a second directory tier uses smaller text below a fine rule.

**States:** Declared: hover text-decoration underline 0.1rem with text-underline-offset 0.4rem; focus-visible outline rgb(99, 154, 249) inset 3px and outline-offset 3px.

### Question row

**Only for:** educational product pages

**Use:** Objection handling in a wide accordion.

**CSS:** `display: flex; justify-content: space-between; align-items: center; gap: 24px`

**Text style:** `question` — Inter 400 · 30px/1.1 · tracking -0.02em

**Observed:** Question label is capped at 800px while a thin plus sits at the far right of a 1216px row. Items have 24px bottom space and 24px between them; fine rules sit beneath the text portion. The block-letter campaign variant instead uses a narrow right column with a left-side section heading.

**States:** Declared: focus-visible outline rgb(99, 154, 249) inset 3px, outline-offset 3px and opacity 1.

## Imagery and graphics

### Oversized interface cutout

**Use:** Default opening and major product demonstrations.

**Observed:** A huge black app surface with rounded upper corners rises on the right over a vivid polygon backing. The opening shows only a meaningful fragment, not a miniature full device; a diagonal foreground cut removes its lower-left portion. Large numerals and few controls remain readable.

**Transfer:** Enlarge the new product's most recognisable task screen. If no interface exists, build a dark editorial task card with one outcome and three controls, then stage it at the same scale.

**Build:** Use a black rounded panel layered above a broad SVG polygon, with a second canvas-coloured polygon covering the lower-left on a roughly 45-degree diagonal. Keep the cut parallel to the backing's chamfers. Use violet-to-warm colour on the backing, not on the interface.

### Glossy object metaphors

**Use:** Capability cards, benefit tiles and technical chapter accents.

**Observed:** Coins, shields, keys, a padlock, a dollar sculpture and a faceted diamond float without photographic backgrounds. Materials alternate satin plastic, chrome and translucent glass; saturated lime, lavender, sky blue and orange make them toy-like but polished. Objects occupy roughly half of cards and may spill past an edge.

**Transfer:** Translate capabilities into a few concrete objects with thick extruded edges and a single soft studio light. Minimum acceptable art is a large SVG silhouette with a shaded bevel and a restrained highlight, not a stock line icon.

**Build:** Construct a thick SVG silhouette with a translated darker duplicate behind it for extrusion, an inset lighter front face and one soft white highlight at the upper-left. Tilt the object slightly, place it on a flat coloured card, and clip at the card boundary. Use one hero object rather than a cloud of small ornaments.

### Sunny human closing scene

**Use:** Default closing conversion stage and lifestyle-backed benefits.

**Observed:** Smiling young adults are photographed from below against a bright blue sky, in warm orange or textured blue clothing. The person fills much of the frame; wind, hair and outstretched limbs create a spontaneous feeling. A gradient frame overlaps the photograph and opens a diagonal window onto the face.

**Transfer:** Use a candid product-in-use portrait with sky and strong daylight, framed close enough to feel energetic. Without suitable photography, use a strongly lit physical product scene through the same diagonal aperture rather than a generic office portrait.

**Build:** Place a full-bleed cover image under an inset rounded SVG frame. Cut an asymmetric window through the right half with one long diagonal lower edge; keep solid gradient area behind copy on the left. Anchor the pill at the lower-left and a small white QR tile near the lower centre.

### Activity capsule ribbon

**Use:** A continuous lively proof strip around capability content.

**Observed:** White capsules contain small asset or category symbols, short labels, compact values and occasional dark action pills. The strip bleeds beyond both viewport edges rather than fitting inside the text container.

**Transfer:** Populate it with real examples of work, destinations or outcomes appropriate to the new product. Preserve the lightweight capsule silhouette and mixed lengths.

**Build:** Build two duplicated inline-flex tracks of white capsules with 100px radii and 10px internal gaps; include small dark circular symbols and terse text. Translate the repeated track continuously so the strip has no visible ending.

### Campaign word sculpture

**Only for:** immersive block-letter campaigns

**Use:** Full-screen transitions, opening and closing call.

**Observed:** Broad pale letters form tightly packed uppercase stacks against forest, indigo or aubergine fields. Coins, a faceted mascot or a device move through the typographic stage; later a central phone is flanked by four rounded coloured benefit tiles. The ending places a large three-line block statement between a floating card and a purple hand holding a phone.

**Transfer:** Treat a short promise as a designed word object. Replace the central character with a product-specific sculptural emblem, or a simple extruded geometric token, while preserving type density and the full-colour stage.

**Build:** Set a short phrase in the block family at 120px/1, centred as a near-solid rectangle. Layer a few bevelled product tokens above and below the letters, then transition to a central tall dark panel with two 40px-radius tiles on either side. Keep contrasting pale text on each saturated field.

### Icons

**Observed:** Functional symbols are small and mostly filled black or white, commonly 20px; proof cards use 32px glyphs in 40px black rounded squares. Social controls use recognisable solid silhouettes. Accordion plus signs are thin and oversized relative to ordinary link arrows.

**Transfer:** Use simple functional silhouettes for controls, reserving dimensional illustration for benefits. Avoid putting colourful outline icons beside every paragraph.

## Section recipes

How recurring sections are built.

### First screen: Oversized cutout opening

**Observed:** Pale canvas behind all layers, Fixed navigation above. The headline forms three heavy condensed lines across the left half at 180px/0.82, with a 655px-wide semibold supporting line 39px below and Primary button another 50px below. On the right, an oversized black interface rises nearly to the header and reaches close to the fold, backed by a vivid chamfered shape. A pale diagonal cut in front of the lower-left interface keeps the copy area clear. Within the first 900px the complete headline, support, action and most of the primary interface object are visible; the following capability section begins below.

**Transfer:** Use a short verb-led promise that wraps into similarly dense lines and give the product object approximately half the first screen. A dark outcome card over a clipped gradient can replace bespoke interface art. Dedicated product pages use product-display at 132px/0.94, a narrower left text block, and an approximately 702px-wide right illustration; mobile-first tools can replace the main action with a small QR tile. Immersive campaigns instead use the scoped centred block-letter stage.

**Avoid:** Do not shrink the main interface into a centred laptop mockup, or place two equal small buttons beneath a modest headline.

**Text style:** `display` — GrotzecCondensedLatin 400 · 180px/0.82 · tracking -0.02em

### Capability family and moving ribbon

**Observed:** A 72px section lead and 20px support introduce four Capability cards with 20px gutters. Each has a different flat backing and a large glossy object. Activity capsule ribbon bleeds horizontally nearby; it adds movement without enclosing the entire section.

**Transfer:** Show the product's breadth as a visually related family, then let short live examples provide proof of everyday use.

**Text style:** `heading` — GrotzecCondensedLatin 400 · 72px/0.94

### Lifestyle benefit trio

**Observed:** A full-bleed sunny photograph backs a centred 72px title and three pale benefit cards, each about 379px wide with 21px padding and 15px corners. White image wells frame product crops and isolated objects above compact headings, body and actions. Fine print occupies a quiet line below the row.

**Transfer:** Use one warm photographic scene to unite distinct everyday benefits; keep the cards opaque enough that reading stays effortless.

**Text style:** `heading` — GrotzecCondensedLatin 400 · 72px/0.94

### Black advanced chapter

**Observed:** Black chapter carries a left-aligned chapter-heading with muted body-lg support. A tall black interface dominates the right and escapes above the section, with a glossy diamond-like object overlapping its inner edge. Three feature-stat values sit along the lower-left with small captions and 24px gaps.

**Transfer:** Create one high-contrast chapter for demanding users, combining a real task view and a compact quantified proof strip.

**Text style:** `chapter-heading` — GrotzecCondensedLatin 400 · 76px/0.9 · tracking -0.01em

### Trust and compact proof

**Observed:** A left-aligned chapter-heading and short support are balanced by a glossy key object at the upper-right. Three Flat white cards have a notched corner, a dark icon tile, a condensed title and short caption. A second low row of Proof tiles supplies ratings and scale without giant standalone numbers.

**Transfer:** Pair assurances with verified short proof rather than an undifferentiated logo wall.

**Text style:** `chapter-heading` — GrotzecCondensedLatin 400 · 76px/0.9 · tracking -0.01em

### Product education and tutorial

**Observed:** Dedicated product pages use a centred heading over either two-column Horizontal feature cards or three tall white demonstration cards. Tutorials alternate 628px-wide interface illustrations with text across three rows, separated by about 110px. A purple educational chapter can interrupt this light canvas with a 132px title, panoramic sculpture and support beneath.

**Transfer:** Explain the unfamiliar concept first, then show concrete steps in alternating image/text rows; keep the purple variant scoped to a coherent campaign rather than scattering it.

**Text style:** `product-display` — GrotzecCondensedLatin 400 · 132px/0.94

### Monumental photographic close

**Observed:** A bright sky portrait fills a wide stage behind an inset diagonal gradient frame. The 124px closing-display occupies the solid left portion, with body-lg support beneath. A black section action anchors the lower-left; a small white QR label sits lower near the centre. The person's face remains clear in the angular right aperture. A related product variant splits the gradient message and photograph into two offset diagonal panels.

**Transfer:** Close with an emotionally warmer restatement of the main promise, retaining the angular frame and a single direct action. Use a strongly lit product-in-use scene if a portrait is not appropriate.

**Text style:** `closing-display` — GrotzecCondensedLatin 400 · 124px/0.91 · tracking -0.02em

### Questions and editorial exit

**Observed:** Educational product pages follow their conversion stage with wide Question rows, then a three-column Article card row. Related-reading title aligns left and the All articles arrow link right. Thumbnail category labels sit in black rectangles. A slim white breadcrumb strip separates the editorial ending from the footer.

**Transfer:** Answer the audience's remaining doubts, then offer useful next reading without turning it into another large sales pitch.

**Text style:** `question` — Inter 400 · 30px/1.1 · tracking -0.02em

### White directory footer

**Observed:** White utility ending has 82px top and 65px bottom main padding. Wordmark and peach Newsletter card sit left of multiple Footer link columns. A fine rule introduces a second directory tier; language control and a tight row of Social squares sit lower-left, followed by a final fine rule and small legal links with copyright aligned right.

**Transfer:** Retain the two-tier directory hierarchy and peach subscription module while reducing link count to fit the new product. The immersive campaign variant places its large subscription/learning cards before this otherwise similar white footer.

**Text style:** `nav` — Inter 400 · 16px/1.24

### Immersive campaign stage

**Only for:** immersive block-letter campaigns

**Observed:** Centred campaign-display fills a forest opening with pale blue chunky uppercase letters, a small white pill and a sculptural emblem. Sticky full-viewport scenes shift to indigo and peach, revealing a tall central device flanked by rounded bento cards. Four tall coloured proof cards lead to a dark illustrated closing banner. Purple product campaigns alternate pale lavender and aubergine, finishing with a large block-letter promise and QR tile before narrow-column questions, articles and the white directory ending.

**Transfer:** Use this system only when the experience is conceived as a sequence of art-led stages; maintain coherent block lettering and flat saturated fields throughout.

**Text style:** `campaign-display` — MMPolyVariable 400 · 120px/1

## Page flow

**Storyline:** Bold promise → tangible product proof → capability breadth → everyday benefits → technical depth or explanation → trust and objections → warm conversion → useful reading and directory.

### Broad consumer-product marketing landing page

1. **Promise** — Oversized left headline collides with an enlarged dark product interface.
2. **Capability breadth** — Coloured object-led cards plus a moving capsule ribbon.
3. **Everyday benefits** — Three benefit cards over sunny lifestyle photography.
4. **Technical depth** — Black advanced chapter, interface enlargement and compact statistics.
5. **Trust** — Notched assurance cards and low proof tiles.
6. **Closing call** — Monumental line in a diagonal gradient frame over a portrait.
7. **Utility ending** — Legal clarification, breadcrumb, peach subscription card and white two-tier directory.

**Transfer:** Use breadth for a multi-capability product and let art, proof and darker technical content provide changes of pace.

### Focused transactional product page

1. **Promise** — Split product hero, short outcome copy, direct action and a compact compatibility grid.
2. **Ecosystem proof** — Two horizontal rows of monochrome provider logos in white tiles.
3. **Product demonstration** — Three tall white cards show steps through enlarged interface fragments.
4. **Capability detail** — Two-column white feature cards with glossy symbols.
5. **Closing call** — Offset diagonal gradient message and sunny portrait.
6. **Education and utility** — Related articles, breadcrumb, subscription module and shared white footer.

**Transfer:** Use compatibility and ecosystem proof only when meaningful; prioritise the task demonstration over broad lifestyle benefits.

### Educational landing page for an unfamiliar capability

1. **Promise** — Condensed split hero with a dark interface and QR entry.
2. **Benefits** — Lilac horizontal feature cards under a centred title.
3. **Explanation** — Purple chapter with a huge question heading and sculptural illustration.
4. **Onboarding** — Alternating image/text tutorial rows.
5. **Closing call** — Wide blue-violet clipped panel with large promise and QR.
6. **Objection handling** — Wide, large-type question accordion.
7. **Education and utility** — Small availability notice, related reading, breadcrumb and shared white newsletter footer.

**Transfer:** Use an educational chapter to make the concept legible before asking users to follow setup steps.

### Immersive art-led brand campaign

1. **Promise** — Centred block-letter statement and animated emblem on a forest stage.
2. **Product demonstration** — Full-screen transitions reveal a device and coloured capability tiles.
3. **Everyday benefits** — Indigo scene transitions to pale blue device-and-bento composition.
4. **Trust** — Peach security stage followed by four tall coloured proof illustrations.
5. **Closing call** — Dark illustrated banner with central stacked word sculpture.
6. **Utility ending** — Large subscription and learning modules, legal note and white directory footer.

**Transfer:** Choose a coherent cinematic visual system rather than combining these full-screen transitions with the default condensed headline system.

### Immersive educational campaign variant

1. **Promise** — Block-letter split hero on aubergine with lavender copy and a QR tile.
2. **Benefits** — Dark cards on lavender beneath a rounded sans heading.
3. **Explanation** — Text and sculptural illustration share an aubergine split section.
4. **Onboarding** — Large interface demonstration beside a compact step list.
5. **Closing call** — Centred pale block-letter promise and QR on aubergine.
6. **Objection handling** — Left section label beside narrow right-column questions on lavender.
7. **Education and utility** — White related reading, breadcrumb and white directory ending.

**Transfer:** Retain the purple/lavender alternation and wider sans section headings for this campaign, rather than importing the default light product layout halfway through.

## Writing

Direct, energetic and consumer-facing, with confident verbs and a little conversational swagger. Technical detail appears in support text, while headlines make the benefit feel immediate.

**Do not copy:** Do not reuse MetaMask or partner names, logos, mascot, distinctive artwork, proprietary product names, customer metrics, ratings, yield or leverage figures, security guarantees, geography claims or legal language. Source examples illustrate voice, not claims available to another product.

- **Addressing the reader:** Address the reader as you and your. Use we for concrete product operations and the product name when explaining a capability; avoid a remote corporate narrator.
- **Rhythm:** Short two-part promises and compact verb phrases lead. Support paragraphs usually make one practical point in one or two sentences; technical qualifications sit close to the claim, not inside the headline.

| Role | Pattern | Typical length | Examples of the pattern |
| --- | --- | --- | --- |
| Hero headline | Lead with an action or an ownership promise; use short decisive clauses. | 3–6 words | “Trade anything. Earn more.”<br>“Where your money lives” |
| Section heading | Conversational benefit with a compact twist. | 4–7 words | “Earn on everything you do”<br>“Security obsessed, on your behalf”<br>“Pro mode on tap” |
| Supporting line | Name the concrete action, explain the practical advantage and qualify availability when needed. | 15–35 words | “Trade, earn, and spend from one self-custodial app. Free on iOS, Android and web.”<br>“Swap and bridge tokens between networks in a single approval.” |
| Card title | A terse operational benefit or plain capability noun. | 2–5 words | “Compare quotes in a few clicks”<br>“Easy funding” |
| Primary action | Get plus the thing, or a plain task-starting verb. | 2–4 words | “Get Started”<br>“Get your card” |
| Question | Use the reader's actual practical uncertainty, not a promotional assertion. | 5–14 words | “What is a prediction market?”<br>“Are prediction markets risky?” |

**Words and phrasing to use:** your; get; trade; earn; in a few clicks; on tap; all from inside; automatically; control

**Avoid:** revolutionary ecosystem; unlock limitless possibilities; enterprise-grade synergy; journey into the future; effortlessly guaranteed

**Rules:**

- Put the action before the mechanism in a headline.
- Use concrete task language in descriptions; explain necessary specialist terms in the educational chapter.
- Keep numerical proof short and verifiable, with a nearby qualification for conditional benefits.
- Sentence case is the default. Reserve all-capital labels for small badges and the scoped block-letter art direction.
- Let a playful phrase appear in a headline, not in every sentence.

## Do's and Don'ts

### Do

- Keep the default opening at 180px/0.82 with a dense three-line silhouette.
- Use 72px/0.94 condensed section leads against 20px/1.3 support copy.
- Preserve the 100px action radius and the 64px versus 42px hero/header hierarchy.
- Place flat white cards on #f5f5f5 without elevation shadows.
- Use 16px gutters for explanatory grids and 20px for the capability family.
- Combine at least one diagonal art stage, glossy metaphor and activity capsule ribbon.
- End the sales narrative with a large 124px line and warm image-backed conversion stage.
- Use the peach newsletter as a compact footer utility, with thin #e9edf6 directory separators.

### Don't

- Do not render the condensed headings as weight-700 Inter; width and construction matter more than nominal weight.
- Do not spread lime, peach and blue as alternating full-page bands in the default light system.
- Do not replace diagonal art masks with uniformly rounded rectangles everywhere.
- Do not add blurred glass or soft card shadows to the flat white-on-grey information grids.
- Do not turn the 32px compact proof values into giant dashboard-style KPI counters.
- Do not make all action labels uppercase; ordinary marketing controls use sentence case.
- Do not use the 40px campaign bento radius for the ordinary 8px feature cards.
- Do not use neutral office headshots for the closing scene; the treatment depends on vivid daylight, low angles and warm clothing.

## Motion and responsive

### Motion

**Observed:**

- The activity ribbon declares a 60s linear infinite scrolling animation.
- Header transform transition is calc(1*.75s) cubic-bezier(.19,1,.22,1).
- Capability cards declare transform 1.2s cubic-bezier(.19,1,.22,1) calc(0*.08s). Proof tiles declare opacity .8s cubic-bezier(.215,.61,.355,1) with staggered delay and transform 1.2s cubic-bezier(.19,1,.22,1).
- Clipped reveals declare clip-path 0.75s cubic-bezier(0.19,1,0.22,1); immersive campaign stages use sticky scenes and variable-letter reveals.

**Transfer:**

- Use motion for the ribbon, object staging and large masked transitions rather than animating every paragraph independently.
- Keep the ordinary light page's reveal vocabulary distinct from the scoped full-screen campaign choreography.

**Unknown:**

- Exact trigger positions, complete spring curves, interruption behaviour and reduced-motion presentation are not established.

### Responsive

**Observed:**

- The root font size uses 0.694444vw, so rem-based dimensions scale with the viewport.
- Declared header tokens are 98px desktop and 83px mobile at the desktop reference scale.
- Source CSS includes breakpoint families around 768px and 1024px, with additional small-device and wide-display breakpoints.

**Transfer:**

- At narrow widths, preserve the poster headline's dense wrap and bring the product cutout beneath it rather than reducing the whole desktop composition to a tiny image.
- Stack tutorial rows and feature cards while retaining the diagonal art backing; let the activity ribbon continue bleeding past the edges.
- Keep the portrait's face outside the copy area when adapting the closing frame; a stacked image and solid gradient copy panel can preserve the angular relationship.

**Unknown:**

- Mobile layouts, actual breakpoint-specific typography and menu-open behaviour have not been visually established; narrow-layout transfer rules are recommendations.

## How to use this guide

1. Start from the Essentials and the first-screen recipe; where the guide offers variants, use the default named for a new marketing page.
2. Plan the page before building: map your content onto the section recipes and page flow, then check the plan against the Do's and Don'ts.
3. Build with the tokens and component specs; recreate signature graphics with their build recipes instead of generic decoration, and use the named font substitutes if a font is unavailable.
4. Render the page at desktop and mobile widths, compare it with the Essentials and the Don'ts, and fix the differences before you finish.

