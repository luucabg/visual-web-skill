# OFFGRID — opening art direction, sections 1–3

## Delivery and method

Exactly three separate horizontal section reference images and three matching standalone photo assets were generated using the built-in imagegen tool, one call per image. Each generated reference and photo was visually inspected. Photos were freshly regenerated from their matching references using imagegen; no cropping, screenshot extraction, image compositing code or placeholders were used. The original managed outputs were preserved during creation; deliverables were copied into this portable case directory.

All six files are PNG, 1672 × 941 pixels (native tool output, approximately 16:9). Prompts requested nominal 1536 × 864; the built-in tool chose its native size. No resampling was performed.

| Section        | Reference                     | Clean photographic asset |
| -------------- | ----------------------------- | ------------------------ |
| 1 Hero         | 01-hero-reference.png         | 01-patagonia.png         |
| 2 Manifesto    | 02-manifesto-reference.png    | 02-stillness.png         |
| 3 Destinations | 03-destinations-reference.png | 03-norway.png            |

The reference screenshots lando.png, floema.png and mindmarket.png were read visually before generation. Lando contributed confident composition and sparse acid color; Floema contributed warm cream space and refined typography; MindMarket contributed large readable normal-weight sans type. Their brands, people, graphic identities and page content were not copied. The first section used all three references as explicit image inputs. Subsequent sections used earlier OFFGRID output to preserve visual continuity.

## Shared design extraction

- Requested implementation palette remains the source of truth: cream #f1f0e8, dark forest #19251d, acid lime #d5ed45. Generated pixels approximate these values and should not force a different CSS palette.
- Typeface: refined neutral grotesk, Neue Montreal mood, light/normal display weight, very tight tracking (approximately -0.035em), no serif or heavy black weight. Body text normal with slightly tighter-than-default tracking.
- Visual language: open flat editorial sections. Photos have square corners. No containers around sections, nested panels, shadows, metrics, testimonials, badges or decorative UI.
- Desktop implementation gutter: 56px requested. Generation approximates 49–73px at 1672px, with consistency of alignment more important than literal pixel copying. Normalize final implementation to the requested 56px.
- Background and density rhythm: full-bleed cinematic hero, cream text-led manifesto with small photo counterweight, cream gallery-led destinations with large image and fine-rule list.
- Motion cues implied, not drawn: restrained cinematic fade-through and slight parallax image drift. Respect reduced motion.
- Section anchors: bottom-left overlay; top-left statement/support bottom-right; large left visual/right-third destination list.
- CTA hierarchy: lime primary pill in hero, outlined secondary nav pill, underlined manifesto link, plain destination rows with arrows.
- Imagery: cinematic natural low-chroma green-gray landscape photography, overcast light, detailed terrain, no oversaturated postcard skies. Reference assets are imagegen artwork, not verified travel documentary photos.

## 01 — Hero analysis

Visible text is clear and matches:

- OFFGRID®
- Destinos / Filosofía / Cuaderno
- Diseña tu escapada →
- MENOS RUIDO.
- MÁS MUNDO.
- Viajes extraordinarios. Lejos de lo de siempre.
- Encuentra tu norte ↗
- Para quienes prefieren perderse un poco.

At native 1672 × 941, logo starts around (49,42), center links around y49, outline nav CTA is around (1364,32), 259 × 52. H1 begins around x49/y440, roughly 126px display size, two lines with about 120px baseline rhythm, taking 54% of frame width. The supporting sentence begins around x49/y699 and is approximately 30px. Lime CTA is around (49,755), 311 × 65 with fully rounded ends, generous side padding and dark arrow. Bottom note around x49/y889 is ~19px.

The photorealistic Patagonia background keeps the left foreground naturally dark for text contrast. Jagged peaks sit upper-middle/right; emerald lake sits in lower-right; lone small hiker at x1275/y760 provides scale. Main landscape remains visible above and right of headline. Clean photographic derivative preserves this composition, with reconstructed terrain and sky where UI existed. No residual glyphs or button shapes were observed.

Implementation: full-bleed background with cover and central object position, then text and nav as real accessible HTML. Keep hero around first viewport height; scale H1 responsively so two lines and primary CTA remain visible at small laptop heights. Do not burn generated UI into the actual page. Source hero's CTA lime renders a little brighter than requested; use #d5ed45.

## 02 — Manifesto analysis

Visible text is clear and matches:

- EL ARTE DE DESCONECTAR
- No necesitas más planes.
- Necesitas otros horizontes.
- Menos pantallas. Más caminos sin nombre.
- Creamos rutas para volver a sentir el tiempo.
- Nuestra filosofía ↗

Full cream field with forest text. Label around (73,112), roughly 20px. Giant normal/light headline starts x73/y175; two long lines with ~130px line rhythm. This is the defining typographic moment, intentionally much stronger than supporting copy. Text aligns on one left edge with label, body and link.

The lower-left paragraph begins around (73,689), about 29px with 44px line rhythm. It fits into two clear lines rather than the prompt's possible three; retain the visible two-line logic on broad screens. Underlined link starts around (73,815), about 24px with a thin underline beneath label plus arrow.

The inset photo occupies approximately (1076,534), 520 × 313 at native size, about 31% of canvas width. It is 5:3, square-cornered, no border. This is a small supporting image relative to the large statement, not a 50/50 split. The separate photographic asset depicts forest in upper 58%, near-still emerald water/reflections in lower 42%, low mist and visible shallow stones. No people, structures, text or UI remain.

Implementation: cream section with large top statement. Lower portion can use a broad text column plus smaller aligned image column, generous space between. Normalize exact photo width to parent layout/brief (~300–420px desktop) if necessary while retaining the asymmetrical balance. At mobile, heading reflows naturally and photo follows body/link.

## 03 — Destinations analysis

Visible text is clear and matches:

- DESTINOS SIN PRISA
- Lejos,
- pero de verdad.
- Elige el paisaje. El resto puede esperar.
- Noruega
- Mar, montaña y luz infinita
- 01 Noruega ↗
- 02 Islandia ↗
- 03 Patagonia ↗

At native size label begins around (69,69), about 20px. Headline begins x64/y105, roughly 122px, two lines. Right support copy begins around (1243,248), approximately 29px, two lines with ~44px rhythm. Main photo begins around (68,369), 988 × 435, an editorial panoramic ratio about 2.27:1. Its caption sits outside the image on cream: Noruega around (69,822), ~43px; description below y869, ~23px.

Destination list starts x1106/y370, width 496px. Four fine muted olive rules at approximately y370,513,660,805 create three 145px rows. Numbers start x1120, names x1196 and arrow x1572; numbers ~21px and names ~42px. All rows are clean plain text without boxes or bright fills. This open list and image create a 65/30 horizontal balance with a clear gutter.

The photograph shows Lofoten-like jagged mountains, dark green slopes, curving pale sand bay, cold turquoise-gray ocean, tiny coastal village and muted overcast sky. Clean photo regenerates the same composition at 16:9, which gives the implementation freedom to cover the wider ~2.27:1 image frame without using screenshot crops. No glyphs, borders or page remnants were observed.

Implementation: make destination rows real buttons/links, preserve fine-rule visual style. Content switching can swap photo and caption, but no interaction is simulated in the raster itself. Use the standalone Norway photo in the featured frame, object-fit cover, keep mountains and curved bay visible.

## Validation

- All six expected deliverables exist and were read as valid PNGs.
- All six are horizontal 1672 × 941.
- Exactly three section-reference calls and three matching photographic calls.
- All three references visually inspected for copy, hierarchy, spacing, controls, palette and image treatment.
- All three photo derivatives visually inspected: no UI or text remains.
- No source code or Sites state was touched.
- No tool failures occurred.

## Exact generation prompts

### 01 Hero reference

Use case: ui-mockup. Asset type: exactly ONE high-fidelity desktop website HERO SECTION reference, horizontal 1536x864 canvas, no browser window or page below.
Brand: OFFGRID remote-travel editorial studio. Spanish language.
Input images: Image 1 Lando website screenshot is a style reference ONLY for restrained striking art direction and sparse acid accent; Image 2 Floema website screenshot is a style reference ONLY for warm cream space, refined grotesk typography and calm proportions; Image 3 MindMarket website screenshot is a style reference ONLY for confident large sans-serif type. Do not copy any reference brand, people, exact layouts, graphics or screenshots.
Scene: Full-bleed cinematic photorealistic dramatic misty Patagonia mountain range with an emerald alpine lake. Monumental mountain peaks and drifting cloud upper middle and right. Natural muted greens, gray stone and low mist. Tiny distant hiker standing on rocky foreground at lower right. Left bottom is visually quiet dark green-gray terrain, readable under cream type. Real editorial landscape photograph, understated fine texture, no oversaturated travel postcard treatment.
Layout: transparent navigation at top with generous 56px side gutters and 32px top gutter. OFFGRID® wordmark left, center links 'Destinos' 'Filosofía' 'Cuaderno', small restrained cream-outline rounded pill right 'Diseña tu escapada' with arrow. Vast scenery visible between nav and headline. Huge refined clean light/medium grotesk (Neue Montreal mood), tight tracking, cream #f1f0e8 bottom-left headline exactly TWO lines: 'MENOS RUIDO.' then 'MÁS MUNDO.'. Text block occupies left 65% below midpoint, first line around 490px, 110px font equivalent, controlled 0.95 line-height. No heavy black grotesk.
Under headline readable supporting caption 'Viajes extraordinarios. Lejos de lo de siempre.' and one primary acid lime #d5ed45 pill with dark forest #19251d text 'Encuentra tu norte ↗'. At very bottom-left small note 'Para quienes prefieren perderse un poco.' Keep all content inside safe area, minimal and cinematic. Upper-right nav CTA secondary, bottom-left lime CTA primary.
Strict palette: cream #f1f0e8, forest #19251d, acid #d5ed45. Rounded shapes only buttons, no cards, panels, widgets, fake stats, badges, scroll indicator, watermark or decorations. Exact Spanish typography, sharp and readable. A single horizontal section, all visible, premium editorial travel website.

### 01 Patagonia standalone photo

Use case: precise-object-edit. Asset type: standalone photographic hero background, horizontal 16:9, nominal 1536x864. Input image 1 is the exact edit target: OFFGRID Patagonia website hero reference.
Regenerate a clean full-resolution standalone photograph of this identical Patagonia scene, preserving the camera, landscape composition, framing, mountain peak placements, emerald lake, mist, lighting, natural muted dark forest color grade, foreground terrain and the single small distant hiker at lower right. Remove ALL lettering, navigation, logos, registered mark, arrows, button shapes, caption, and interface elements, reconstructing realistic continuous scenery in their place. The landscape should fill the entire frame edge to edge. Keep wide quiet dark terrain at left as natural negative space and the mountain peaks upper-middle/right. Preserve photo realism, texture, the gently overcast gray atmospheric sky, pale mist wrapping crags, subtle green lake. Do not crop a section out of the target. Fresh regenerated photograph, no website, no text or logo anywhere, no watermark, no border, no UI, no extra people, no added objects, no overly bright saturation. Keep all non-UI visual details unchanged as closely as possible.

### 02 Manifesto reference

Use case: ui-mockup. Asset type: exactly ONE standalone high-fidelity desktop MANIFESTO website section, horizontal 1536x864 nominal canvas, one section only, no nav, no browser frame.
Brand OFFGRID remote-travel editorial studio in Spanish. Input image 1 OFFGRID hero is continuity reference for refined grotesk type and restraint, not layout. Image 2 Floema reference supports spacious cream editorial minimalism. Image 3 Lando is acid accent restraint only. Never copy reference brands.
Background full flat warm cream #f1f0e8 edge-to-edge. Text dark forest #19251d. Very generous breathing room and consistent 56px gutters. Flat open editorial layout, no outer card/panel or borders.
Small uppercase label at x56 y85: 'EL ARTE DE DESCONECTAR'. Main extremely large but readable clean light/normal grotesk headline, Neue Montreal style, tight tracking, not bold, starts x56 around y220. Exactly two long lines: 'No necesitas más planes.' and 'Necesitas otros horizontes.'. Around 86px equivalent, 1.06 line-height. Title should dominate and leave room below.
Lower-left supporting copy, around x56 y600 in readable 26px, width 630px, three graceful lines: 'Menos pantallas. Más caminos sin nombre. Creamos rutas para volver a sentir el tiempo.' Beneath it with comfortable gap, underlined secondary link 'Nuestra filosofía ↗', 22px.
One small quiet horizontal photograph inset at lower right, approximately 380px wide by 228px tall at x1100 y565 with 56px right gutter, square corners and no border. Photorealistic still green lake with dense dark evergreen forest and faint low mist, natural muted daylight, emerald reflections, calm clear water, no people or architecture, closely composed quiet intimate landscape. Photo is a supporting counterweight, not a giant half-screen image. Keep a generous empty gap between photo and heading.
Precise Spanish text rendered verbatim and sharp. No other text, icons, logos, badges, decorative numbers or UI clutter. No shadows, cards, dashboard chrome, widgets, texture noise. This is a shippable restrained premium editorial website section with visible clean hierarchy, readable spacing, calm even rhythm.

### 02 Stillness standalone photo

Use case: photorealistic-natural. Asset type: standalone wide landscape photograph derived from the matching image reference, horizontal 1536x864 nominal.
Input image 1 is the OFFGRID manifesto website reference. Use ONLY its lake and evergreen forest photograph at the bottom right as scene, composition, lighting and color reference. Freshly regenerate that same scene as a complete edge-to-edge high-resolution standalone photograph. Do not crop, screenshot, enlarge a cutout or reproduce any page UI.
Scene: serene dark emerald alpine lake occupying lower 42% of image, clear shallow translucent water with subtle stones visible at bottom foreground, densely packed tall evergreen conifer trees across the entire far shore, deep forest greens in the upper 58%, faint pale wisps of mist among the treetops. Nearly straight forest shoreline at lower-middle, slight rises on both sides, soft subdued overcast light. Reflections of evergreens in still green water, real textures and slight natural ripples. Quiet intimate nature scene, level camera near water edge, realistic 50mm landscape perspective, no dramatic peaks, no large open sky, no objects.
Preserve reference photograph's calm composition, closely framed forest, muted natural grade and emerald water. The photograph fills the entire landscape canvas. No text, letters, logos, arrows, buttons, cream website background, borders, page elements, people, buildings, boats, wildlife, watermarks or stylized illustration.

### 03 Destinations reference

Use case: ui-mockup. Asset type: exactly ONE horizontal standalone DESTINATIONS section of the OFFGRID Spanish remote-travel editorial website. Nominal canvas 1536x864, shippable high fidelity desktop website comp. No nav, no browser or surrounding page.
Input image 1 OFFGRID manifesto is continuity reference for cream, dark forest and grotesk typography. Image 2 OFFGRID hero is continuity reference for quiet cinematic photo grade. Image 3 Floema is restraint/style reference. Do not copy other brand text.
Palette: warm cream #f1f0e8 flat full background, forest #19251d text, restrained subtle olive-gray fine hairlines. Use refined normal/light Neue Montreal-like grotesk, tight tracking, no bold slugs. Consistent 56px desktop side gutters. Flat open layout without cards, containers, borders around whole section or shadows.
Top-left small uppercase label at x56 y55 'DESTINOS SIN PRISA'. Below, large dark forest heading around 90px in exactly TWO lines: 'Lejos,' then 'pero de verdad.'. Heading occupies top-left two-thirds and y95–285. Top-right at x1080 around y180 a readable 24px brief sentence with calm two-line wrap: 'Elige el paisaje. El resto puede esperar.'
Below around y350 begins dominant horizontal photorealistic Norway Lofoten coast photograph, width around 950px, occupying 65% of content width lower-left, height around 380px, perfectly square corners and no borders. View from green coastal ridge: steep dark jagged Norwegian mountains meeting turquoise-gray cold Atlantic water, sweeping pale-sand coastal bay, rugged dark green slopes, tiny red fishing village on the coast if natural, quiet overcast cloud, cinematic natural desaturated tones. Real editorial remote-travel photograph with texture and atmosphere, premium but credible.
Directly beneath photo, left aligned, large 36px title 'Noruega' and one smaller 20px caption below 'Mar, montaña y luz infinita', both on cream outside photograph.
Rightmost 30% of lower composition is a plain destination text list starting aligned to photo top: first row '01 Noruega ↗', next row '02 Islandia ↗', third '03 Patagonia ↗'. Destination names around 32px normal weight, small 17px numbers and right-aligned arrows. Thin muted horizontal rules above and beneath each row, generous 80px row spacing. Flat list only, no image or boxes behind it, first row subtly higher dark contrast and other rows muted forest without bright fills.
No additional text or fake stats, ratings, badges, carousel dots, UI panels, watermarks. All text exact Spanish and very readable. One section per frame; title, photo, caption and destination list all visible with generous bottom margin.

### 03 Norway standalone photo

Use case: photorealistic-natural. Asset type: standalone scenic photograph for OFFGRID travel destination Norway, landscape 1536x864 nominal.
Input image 1 is the matching OFFGRID destinations website reference. Use ONLY the lower-left Norway coast photograph as the scene/composition/lighting reference. Freshly regenerate its photograph as a sharp edge-to-edge standalone photograph. Do not crop, screenshot, enlarge cutout or reproduce any page.
Preserve the same dramatic Lofoten Norway coastal landscape: view from a low moss-green rocky coastal hillside foreground at bottom left, cold muted turquoise-gray sea sweeping from left to center, gently curving pale-sand beach from lower-center toward a tiny remote coastal village at center-right, dark rugged jagged alpine mountain mass rising from the sea across upper-middle, thin wisps of cloud at summits and a moody overcast gray sky. A few tiny red and cream fishing cottages sit far away along the shore at right, believable scale, no foreground buildings. Dark green mountain slopes, gray vertical rock textures, tiny patches of old snow in gullies, subtle white waves breaking on the long bay. Cinematic desaturated natural travel editorial photo, crisp real detail but atmospheric low-contrast distance.
Keep the landscape composition coherent, mountain peaks centered, ocean around mountain headlands on both sides, same perspective and moody northern light, full frame horizontal photo. Preserve the reference's remote quiet mood and brand-compatible forest gray green grading. No people, letters, logos, text, watermarks, UI, buttons, cream margins, arrows, cards, borders, website design or additional objects.
