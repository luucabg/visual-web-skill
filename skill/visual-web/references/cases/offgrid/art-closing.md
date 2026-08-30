# OFFGRID — sections 7–8 art handoff

Generated with the built-in imagegen tool, one call per image. All four outputs are newly generated. The photographic assets were regenerated individually from the scene reference, never cropped from a website mockup. No checkout files were changed.

## Deliverables and verification

| File                     | Dimensions  | Purpose                                                                       |
| ------------------------ | ----------- | ----------------------------------------------------------------------------- |
| 07-planner-reference.png | 1672 × 941  | Horizontal section 7 reference                                                |
| 08-closing-reference.png | 1672 × 941  | Horizontal section 8 reference; also appropriate for a branded social preview |
| 07-tent.png              | 1024 × 1536 | Independent portrait tent/lake photograph                                     |
| 08-horizon.png           | 1536 × 1024 | Independent landscape coastline photograph                                    |

The tool chose 1672 × 941 for the two UI mockups even though the requested composition was 1536 × 864. Their horizontal 16:9 composition is preserved. All files were visually inspected; all reference text is readable and matches the Spanish brief. Both photos are text-free. Image files successfully decode with System.Drawing. No generation failures occurred.

## Shared design system and reference use

Inspected lando.png, floema.png and mindmarket.png. Floema was largely obscured by a cookie dialog, so it was not passed as a useful primary style input. Lando and MindMarket were passed to both UI generations as style references only: paper/lime graphic confidence, restrained grotesk scale, strong spacing. No brand, person, illustration or cookie banner was copied.

Canonical palette for implementation:

- Paper #f1f0e8.
- Forest #19251d.
- Acid lime #d5ed45.
- Fine rules: forest at approximately 30–50% opacity on paper; approximately 65% on lime.
- Natural photography: subdued gray/olive, muted gold, soft cream dawn light, no aggressive HDR.

Canonical typography: refined grotesk close to Neue Montreal, display weight about 500, tight tracking around -0.055em, close heading line-height 0.96–1.0, normal sentence case. Body and form text at 18–22px desktop; legal/support copy at 14–16px. Keep all copy as real selectable HTML in implementation.

Generated colors vary slightly around the requested values: section 7 sampled upper-left paper is RGB 244,244,238; section 8 sampled upper-left lime is RGB 217,237,86. Use the canonical hex values above in code. The 7 headline is visually heavier than 8; normalize to the shared medium/normal family. No need to reproduce image-generation color noise or inconsistent weights.

Visual grammar: 56px desktop gutters, generous section breathing room, open layouts, clean rectangular photo frames, slim outlines, capsule primary CTAs. No giant wrapper cards, nested cards, fake statistics, testimonials, decorative system labels or shadows.

## Section 7 — Planner

Job: convert landscape/pace interest into a personal downloadable plan, without implying reservations or payments.

Exact text:

- Eyebrow: EMPIEZA A IMAGINAR
- Heading line 1: Tu próxima
- Heading line 2: buena historia.
- Body: Un paisaje. Tu ritmo. Un primer plan para salir.
- Select 1: Tu paisaje: Islandia
- Select 2: Tu ritmo: Sin prisa
- CTA: Crear mi ruta ↗
- Disclosure: Un plan personal descargable. Sin reservas ni pagos.

Composition: cream field with the text/form mass left and a tall rectangular photograph right. In the actual 1672px-wide image, the left text begins near x90 and the photo near x929; photo ends near x1620, giving about 41% image width. Keep the canonical 56px outer gutter at normal desktop viewport widths and a substantial text/image gap. Heading, short body, selectors and CTA align to one left edge.

Type and spacing: eyebrow small uppercase. Very large two-line heading with no awkward wrap, then a clear 30–40px body gap. The body remains one line at full desktop width. Form appears about 60px below body. Two stacked rows with a small 10–14px gap, one outline each, no enclosing form card. Rows approximately 60–68px tall, 24px horizontal inset, modestly rounded or square corners, simple down chevron at right. Primary action about 64px high, followed by quiet supporting disclosure around 16px.

Important generated-reference deviation: the image shows a rounded rectangular CTA. The shared OFFGRID specification calls for a full capsule. Implement border-radius:999px and canonical lime.

Photo reference: one mustard expedition tent at lower center-right, calm lake through middle, fog bands across rugged dark mountains and a soft warm dawn sky. Independent 07-tent.png recreates this with more vertical context. Use object-fit:cover with object-position around 50% 60% for the tall section frame, keeping the whole tent visible. The image is generated editorial scenery, not documentary proof of any specific itinerary.

Responsive translation: below tablet width, keep eyebrow, heading, body and complete functional form together; place photo beneath or after form rather than compressing both into narrow columns. Keep controls at least 48px high and allow disclosure to wrap naturally.

## Section 8 — Closing and footer

Job: close the journey with one unmistakable action and a strong brand memory.

Exact text:

- Heading line 1: Nos vemos
- Heading line 2: ahí fuera.
- CTA: Encuentra tu norte ↗
- Left footer text: Menos ruido. Más mundo.
- Center footer links: Destinos / Filosofía / Cuaderno
- Right footer text: Concepto independiente · 2026
- Large bottom wordmark: OFFGRID®

Composition: the entire section is a lime field. Large top-left statement, generous whitespace toward the middle, small rectangular coastal image at upper right. Dark forest capsule CTA sits left below heading. A fine horizontal rule at roughly 59% of the generated canvas height separates the upper conversion area from the lower brand/footer region. The footer text row sits directly below the rule. OFFGRID® spans almost the complete width across the bottom and remains fully inside the canvas.

Actual image ratios: roughly 3.6% side gutters, photo begins around x1068 and covers 33% of width, from y63 to y508. The upper text is about 60% width. Headline is very light/normal and tightly tracked. CTA has correct semicircular endcaps. The wordmark is the heaviest type in the frame and has a smaller superscript registered symbol. Keep the canonical medium heading rather than inheriting excessively thin raster strokes.

The section may be used as a social preview reference because both OFFGRID and the exact Spanish headline are legible. It is not just scenery without title or brand.

Photo reference: muted gold grass cliffs occupy lower right, a calm gray-blue ocean extends left, warm sunlit haze near the upper horizon. Independent 08-horizon.png matches this scene and grade while being a fresh full photograph. Use a simple sharp rectangular frame and object-position:center.

Responsive translation: headline and CTA first, photo beneath or to the side when space allows; wrap footer links into their own row; preserve a readable full-width wordmark using fluid type rather than fixed overflowing text.

## Generation prompts

### 07-planner-reference.png

Use case: ui-mockup
Asset type: Section 7 of 8, PLANNER, of the OFFGRID Spanish remote travel studio website. Create ONE standalone horizontal high fidelity desktop section reference, 1536x864 composition, edge-to-edge flat web screenshot with no browser chrome.
Input images: Image 1 lando.png is style inspiration only for calm off-white/acid-lime restraint and strong art direction. Image 2 mindmarket.png is style inspiration only for oversized restrained grotesk typography and confident flat color. DO NOT reproduce their brands, wording, people, illustrations, cookie banners, or layout. OFFGRID is original.
Brand palette strictly paper cream #f1f0e8, forest ink #19251d, acid lime #d5ed45. Refined sans grotesk like Neue Montreal, medium normal weight, strongly tight tracked headings. Cinematic natural subdued photo grade. Flat open layout, 56px desktop outer gutter. No giant wrapper cards or nested containers. No shadows, gradients or ornamental shapes.
Composition: Cream canvas. Right 40% is one tall rectangular image with sharp corners, from x=920 approximately to x=1480, top=56 to bottom=808. It is a photorealistic atmospheric photograph of a muted mustard yellow expedition tent beside a calm mountain lake at early dawn, distant gray mountains and low fog, desaturated deep greens and gray stone, calm low light. Tent small but visible in lower third. Left 56% is typography and controls in generous negative space.
Upper left tiny but clearly readable uppercase forest eyebrow 'EMPIEZA A IMAGINAR'. Below this huge medium grotesk forest heading with EXACT TWO lines:
'Tu próxima'
'buena historia.'
Heading approximately 88px and tight line height .98. No overlap with image or cut-off letters. Supporting sentence underneath at 22px: 'Un paisaje. Tu ritmo. Un primer plan para salir.'
Left lower area around y=455: two minimalist native-like wide outlined selection rows, about 760px wide and 64px high, 1px muted forest stroke, squared corners, generous 24px horizontal inset. First label 'Tu paisaje: Islandia' and a simple down chevron at far right. Second row 'Tu ritmo: Sin prisa' and a simple down chevron. 14px space between rows. Then a single acid lime primary pill CTA width 246 height 64 with dark forest 21px type reading 'Crear mi ruta ↗'. Beneath with 18px gap in forest gray 16px exact truthful sentence: 'Un plan personal descargable. Sin reservas ni pagos.'
Use all exact Spanish accents. No navigation/header, no unrelated footer, no 'section 7' label in the picture, no fake stats/testimonials/logos, no decorative tags. Only this one focused section. Premium editorial travel website, buildable precise clear layout.

### 08-closing-reference.png

Use case: ui-mockup
Asset type: Section 8 of 8, closing CTA and footer, of OFFGRID Spanish remote travel studio. ONE standalone horizontal high fidelity desktop web section reference, 1536x864 composition. Edge-to-edge screenshot, no browser chrome.
Input images: Image 1 lando.png is style inspiration only for off-white/acid-lime restraint and strong graphic confidence. Image 2 mindmarket.png is style inspiration only for oversized medium-weight grotesk typography and confident flat color. Do not reproduce source brands, wording, illustrations, people, navigation bars, or cookie banners. Original OFFGRID brand.
Canvas solid acid lime #d5ed45, muted slightly warm lime, absolutely not green grass or yellow neon. All text dark forest #19251d. Refined grotesk like Neue Montreal, medium/normal weight (not bold heavy), tight tracking, clean precise hierarchy. 56px left/right desktop gutter. Purely flat open layout, no wrapper panels, no cards, no shadow, no gradient.
Upper left huge precise 100px heading, 2 lines verbatim:
'Nos vemos'
'ahí fuera.'
Heading at x=56 y=54, line-height .97. Large clean negative space around it.
At upper right place ONE subtle small landscape rectangular photo at x approximately 1110 y=64, width 370 height 250. Sharp square corners. Photo: sunlit ocean horizon at late afternoon, grassy sea cliffs edge in foreground and a calm vast ocean, subdued natural film grade, golden dry grasses, muted gray blue sea. No people, no buildings.
Below the headline left at y=332: one fully rounded capsule pill dark forest #19251d, approximately 280px wide and 62px tall, endcaps fully semicircular radius 31px. Cream #f1f0e8 21px text 'Encuentra tu norte ↗'.
At y=490 place a fine 1px forest rule across width from x=56 to x=1480. A small text row immediately below the rule: left 'Menos ruido. Más mundo.', center 'Destinos / Filosofía / Cuaderno', right 'Concepto independiente · 2026', all at readable 16-18px.
Across the whole bottom from x=56 to x=1480, huge original brand wordmark 'OFFGRID®' in forest, refined grotesk with strongly tight tracking, approximately 235px high, almost full content width, fully visible not cut off at bottom or sides. Registered symbol smaller and raised correctly. Wordmark O F F G R I D spelled exactly, clean high-quality typesetting. Brand and 'Nos vemos ahí fuera.' must be very legible when used as a social sharing preview.
Only this one focused section. No other text, nav, logos, pseudo-system labels or fake data. This is a decisive premium final CTA with huge brand recall, not a composite of several website sections.

### 07-tent.png

Use case: photorealistic-natural
Asset type: OFFGRID travel website photograph for Section 7 planner.
Input image: provided OFFGRID planner mockup is reference ONLY for the right-hand tent, lake and mountain photograph's atmosphere. Generate a BRAND NEW standalone photograph of the scene; do not crop or reproduce the UI.
Primary request: A muted mustard yellow expedition dome tent on a mossy rocky bank beside a perfectly calm mountain lake at early dawn. One tent only, near lower center-right, occupying approximately 25% of frame width. Huge steep rugged gray mountains with sparse patches of snow beyond the lake, low horizontal fog slipping between peaks, layered overcast warm cream gray dawn sky. Moody subdued natural colors: charcoal rocks, dark olive moss, silver gray water, warm but muted tent fabric. This should feel quiet, remote and believable, premium editorial travel photography.
Composition: Full-bleed high-resolution portrait photograph 1024x1536, no framing or border; tent remains within the central 65% horizontal crop-safe zone, ground at bottom 30%, lake middle 25%, mountain mass above, sky upper 25%. Camera at standing human height. Entire tent visible. Detailed rocks, moss, fabric seams and thin guy lines, natural realistic texture. Calm water reflects the fog and mountain. No people.
Lighting: soft diffused early dawn, cinematic low contrast, no artificial spotlight, no oversaturation, no extreme HDR.
Constraints: absolutely NO text, letters, wordmarks, logos, buttons, UI, cream canvas, captions, arrows or watermark. Do not return a webpage screenshot. A single independent newly generated photograph that fills the entire image.

### 08-horizon.png

Use case: photorealistic-natural
Asset type: OFFGRID travel website independent photograph for Section 8 closing footer.
Input image: the attached OFFGRID lime closing mockup is style/scene reference ONLY for the small sea horizon photograph in the top-right. Generate a BRAND NEW full-bleed photograph of this setting. Do not crop the reference or reproduce any webpage.
Primary request: Sunlit wild grassy sea cliffs with a vast calm ocean horizon in late afternoon. Pale warm cream hazy sky above a straight level distant horizon, muted gray-blue ocean with gentle sparkling ripples. Dry golden grass foreground fills lower right and sweeps diagonally down toward the lower left, grassy cliff edge gently receding into distance on the right. The sun is out of frame to the left, painting natural soft gold edge light on grasses. No visible sun disc necessary. Quiet expansive coast, anonymous natural location, no people or buildings.
Composition: single horizontal photograph, 1536x1024. Sky upper 28%, ocean middle 45%, grasses and slope lower 35% and right edge. Eye-level to slight downward viewpoint. Clear horizon. Cinematic natural subdued grade, colors harmonize with dark forest #19251d, warm paper #f1f0e8, olive/dry gold grass. Realistic texture and detail, fine grass blades, soft water movement, atmospheric haze, subtle film look, no fake extreme HDR.
Constraints: absolutely no text, letters, logos, buttons, arrows, UI, borders, lime canvas, cards, captions or watermark. The entire generated image is photography only, no page screenshot and no collage.
