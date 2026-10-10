# Milestone record

## 2026-10-09 — M1 botanical editor foundation

Implemented: homepage; original three-variety SVG artwork; deterministic versioned placements; responsive studio; layer add/remove/reorder; flower/color/dimension/fullness/pattern edits; top/side previews; taper warnings; undo/redo; reset; validated local drafts; JSON backup download/restore; bundled Telugu font/license.

Actual checks:

- TypeScript check passed.
- Eight Node tests passed (deterministic restoration, placement identity, elevation changes, density, schema validation, silhouette warnings, full-state history, branching/bounds).
- Next.js production build passed for `/` and `/studio`.
- Browser: flower/color changes, undo/redo, keyboard radius edit and undo, persisted restoration after reload, pattern selection, add/reorder/remove, JSON download then restore, full reset, side-profile switching, homepage-to-editor journey.
- Responsive: desktop 1440-pixel viewport and mobile 390-pixel viewport; document scroll width equaled its client width at both tested widths.
- Production homepage and editor produced no captured browser warning/error logs during the final check.
- Original SVG assets generated; Telugu font and license confirmed on disk.

An observed SSR hydration warning caused by last-bit floating-point trig differences was fixed by rounding canonical placement output and SVG transforms. Production was rechecked after the fix.

Known limits: no 3D/reveal, greeting-card image export, server storage or shareable links yet; the Bloom action is disabled and explicitly marked coming next. Side view is a schematic projection. Cultural/local flower-form and Telugu editorial review remain pending. Physical Android/iOS testing and assistive-technology testing have not been performed. Browser storage failure recovery is implemented but was not exercised by altering the browser's storage permissions.

Next milestone: procedural 3D flower heads and instanced reconstruction from the same placement generator; one lighting environment; rotation/zoom; WebGL fallback; measured performance. Then the cinematic timeline.

## 2026-10-09 — M2/M3 matching 3D and cinematic vertical slice

Implemented the above next milestone and reveal: three original procedural head geometries, species batches of instanced meshes, one studio lighting environment, brass-colored plate and underlying support; top-down flattening, inward elevation and camera transition; anticipation, transformation, bloom and exploration; replay/skip; operating-system reduced-motion preference and an explicit toggle; orbit/pinch/scroll controls plus rotate/zoom/reset buttons; demand rendering and resource cleanup; lazy loading, WebGL probe, renderer error boundary, context-loss callback and illustrated fallback.

Important model change: layout v2 distributes elevation across each band instead of placing every head in that band on a level plane. The first Bloom upgrades legacy v1 drafts as an undoable action. Explicit tests prove IDs/counts/colors/top-view placements stay identical and old v1 output remains reconstructible. This corrected visibly exposed green support between layers.

Validation after final source changes:

- All 13 automated tests passed; TypeScript and production build passed.
- Customized production design reconstructed all 411 canonical heads; one observed desktop reveal reported 14 draw calls and approximately 99 FPS in this local browser. These measurements are not physical mobile benchmarks, and triangles include shadow passes.
- Browser checks: natural reveal completion; customized color/count reconstruction; rotate/zoom/reset; replay/skip; reduced-motion direct completion; illustrated-view toggle and return; editor state retained on return.
- Temporary test edits were undone, leaving the user's pre-test flower choices intact.
- Production mobile viewer tested at 390 × 844; page client and scroll widths matched, canvas fitted its container, and the full arrangement remained framed.
- WebGL unavailable/exception probe behavior and resource release were tested with controlled inputs. Illustrated fallback was exercised in-browser; actual GPU context loss was not induced.
- No application error observed in production checks. One library warning remains: stable Fiber 9.8.1 uses deprecated Three.Clock. PCF shadow mode is explicitly selected to avoid the removed PCFSoftShadowMap warning.

Known limits now: personalization, PNG greeting-card export, server persistence and shareable links are not implemented. Cultural/Telugu review and physical Android/iOS performance testing remain pending. Geometry is an original stylized interpretation, with further botanical and artistic refinement possible. Only one environment is offered. Real animation recordings are not implemented.

Next milestone: personalized greeting-card composition and reliable high-resolution PNG download, then guest shareable snapshots with explicit visibility and durable reconstruction.

## 2026-10-09 — Fuller, more natural flower appearance

Owner requested larger, more realistic flower heads and less visible foliage, supplying eight photographic/illustrated references. Implemented a rounded marigold core with five rings of curled florets; broader cupped Tangedu petals with smoother normals and a smaller center; wider fluffy Gunugu spikes held closer to the mound. Shared SVG/world appearance sizing increases overlap in both representations. Underlying leaf support is recessed/inset with a darker olive material, including a lower crown support. Existing placements, counts, flower choices and colors are preserved. No reference image pixels or third-party artwork were shipped.

Added detailed/lighter flower geometries, reused through species instancing. Quality switching retains final instance transforms and camera position. Slight seeded tonal variation is purely a material treatment. Reframed the hero camera toward the visual center.

Validation: all 13 tests and TypeScript checks passed; production build passed. Detailed starter geometry remains below 280,000 triangles and lighter starter geometry below 200,000 before shadow passes. Browser checked the 345-head starter and the current saved 8-layer, 372-head arrangement. Quality switching, returning to the editor, and reduced-motion completion passed. The production viewport at 390 × 844 had equal client/scroll widths and preserved all 372 heads. No draft resets or test edits were applied to the owner's saved arrangement during this refinement. Physical mobile GPU testing remains pending.

This is fuller original stylized botanical geometry, not photorealistic scanning. Sparse density choices may intentionally expose foliage. Cultural/local flower-form and Telugu review remain pending as recorded above.

Tooling note: the Sites dependency helper failed to locate npm on this Windows setup. Installation succeeded using the installed official `C:\Program Files\nodejs\npm.cmd`. Dependency audit reported zero vulnerabilities at installation.

## 2026-10-09 — Optional community garden

Added `/garden`: pan, wheel/pinch zoom, keyboard pan/zoom, recentering, viewport-culling, stable spiral slots, cursor pagination, sample mode and opening one arrangement in 3D. Links connect the homepage, studio and bloom viewer. Chosen authentication is Google plus an email link through Supabase. A separate reviewed public snapshot, public title/display name, unchecked consent and an explicit Publish action precede any database insert. Local editing and saving remain available to guests. Owner-only removal has its own confirmation; hidden moderation rows are filtered from guest reads.

Backend SQL, browser-safe configuration example and setup guide are included. No Supabase project credentials were present, so the preview uses labelled original samples and blocks sign-in/publication with a clear pending-connection message. Live provider/email and hosted multi-device verification remain pending owner configuration. Database policies are executed in PGlite's Postgres engine with isolated auth-role fixtures, not a fake live sign-in. No draft resets were performed.

Browser QA additionally exercised the saved 8-layer, 372-head design through Bloom → Add mine to the garden → unpublished review → Keep this private. No public row was created and the pending copy was cleared. Mobile garden and studio both reported clientWidth = scrollWidth (375 CSS pixels with a scrollbar in the 390-pixel test viewport). Cached image thumbnails replaced heavy live SVG tile trees. The browser screenshot capture API later became unavailable after viewport reset; visual inspection succeeded earlier, but no final screenshot file is included. The local preview remains available for direct review.

## 3D festival courtyard and spaced accents

Replaced the default flat gallery with a real shared WebGL courtyard, original decorative figures, garlands, lamps, and warm lighting. Canonical flower instances reconstruct published designs; nearest loaded entries are capped at 24, with nearby detailed heads and coarse distance geometry. Hidden supports and celebrants are combined into meshes. Hover/tap maker cards, orbit/pan/zoom, keyboard/button camera controls, an accessible directory and illustrated fallback are included. Samples and decorative figures do not masquerade as real users.

Optional per-layer accents use separately chosen species/color and 4–24 equal angular placements. Existing base placements and saved designs are preserved. Accents carry through history, persistence, SVG and both 3D renderers, cached thumbnails, sanitized public snapshots and server validation. An additive SQL validator upgrade is included for already-configured projects.

Validation: 25 tests and production build pass, including accent counts/spacing, unchanged base layouts, snapshot validation, canonical shared-scene reconstruction, spatial separation, near-entry limiting, and Postgres validation of accent data. Browser verified the saved 372-head eight-layer design; enabling 12 accents produced 384 heads, choosing 8 produced 380, and undo returned to 384. Maker cards and directory camera jumps were exercised. Full mobile and final scene checks follow below. Live backend setup and physical mobile GPU benchmarks remain pending.

Browser completion: the 384-head full bloom reported all 384 canonical heads, and undo restored the owner's original 372-head draft with accents off. The final courtyard was inspected after camera rotation; screenshot saved as bathukamma-festival-courtyard.jpg. At the 390-pixel phone viewport, clientWidth and scrollWidth both measured 375 CSS pixels; the scene container fitted its width and defaulted to lighter rendering. Google/email live provider setup and physical mobile GPU benchmarking remain pending.

Mobile tap on the shared 3D stack revealed its maker card and opened the individual viewer; closing returned to the courtyard. Temporary viewport override was reset. The final controls retain the camera's pan target across quality changes. The source archive includes only the whitelisted application source, documentation, tests, configs and public assets.

## 2026-10-10 — Hex neighborhoods, mobile bounds, cards and static hosting

Added circular hexagonal spiral slots with slight stable jitter, SQL-generated axial coordinates and an indexed, security-invoker nearby RPC. Requests return at most 61 rows, the cache caps at 160 and refreshed regions remove stale records. Mobile/light rendering caps at 12 arrangements, 700 detailed heads and 18 decorative people; desktop caps at 24, 1,600 and 32. Ground and decoration follow traversal. Original draft placements remain intact.

Share my Bathukamma opens a separate personalized cream/gold card with title, name and message. Finished 3D is captured into transparent PNG using the current canonical scene; illustrated fallback decodes SVG through an image element. Cards export at 1080 × 1350, with download and capability-detected native file sharing. Export never publishes to the garden.

Configured static Next export, a loopback static preview script, Cloudflare headers, Vercel static configuration and deployment guide. No backend credentials or actual deployment were available/requested.

Validation: 29 tests, TypeScript and static build pass. Tests include 100,000 unique hex slots, minimum separation, bounded cache, Unicode card wrapping and Postgres permission/query tests with 3,000 records. Browser downloaded and visually checked the personalized 3D PNG and illustrated PNG; phone viewport reported width = scrollWidth = 375 CSS pixels and a 351-pixel card dialog. The saved eight-layer 372-head draft was preserved. These are functional checks; concurrent service traffic, physical phones, live provider/email delivery and OS share-sheet delivery remain unverified.

## 2026-10-10 — UI refinement

Audited and refined the existing home, studio and bloom UI, holding garden/card design work. Added shared header/footer/button primitives and CSS tokens; readable typography, clear product copy, flatter layer rows and consistent selection/focus/error/destructive states. Bloom moved above the workspace on desktop and into a fixed safe-area mobile action bar. Backup disclosure supports Escape/focus return and outside dismissal; native modal focus return and history-shortcut suppression were fixed. No new dependencies or draft/model/database changes. See ui-refinement.md for decisions and browser evidence.

Validation: 29 tests, TypeScript and static build pass. Browser checks at 320/390/768/1440 CSS viewport widths, selection/undo, preview switching, backup download, dialogs/menu keyboard behavior and 372-head 3D/fallback succeeded. Original eight-layer Banti #E98333 draft preserved. Captured final browser error list is empty. No lint script exists; live provider, physical phone and full assistive-technology tests remain pending.

## 2026-10-10 — Premium component integration

Added shadcn/ui Radix Slider/Tabs/Tooltip adaptations and Magic UI Blur Fade. Locally hosted Fraunces/Manrope WOFF2 fonts add editorial/interface hierarchy at 107 KB combined. Layer settings are separated into Flowers, Shape and Accents; tooltips support keyboard focus; homepage reveal respects reduced motion and has a no-JS visibility fallback. No garden/card redesign or model/backend changes.

TypeScript, 29 tests and production export pass. Browser keyboard/pointer slider commits and Undo, tab selection, keyboard tooltip, accent enable/Undo and narrow viewport bounds were verified. A keyboard commit-order issue was found and corrected by completing commits at keyup as well as pointer commit/blur. All temporary edits were undone, preserving the user's current Tangedu base and original 372-head eight-layer arrangement. No application errors captured in the final browser check. Component/font licenses and provenance are included.

## 2026-10-10 — Crisp theme and public-name directory

Moved cream/yellow UI surfaces to cool white/slate with deeper teal/green accents; 3D studio background/floor/fog match the new neutral preview. Removed public maker names and cache counts from the browsing directory while preserving title-based keyboard browsing and opening. Publication copy explicitly requests a public nickname and explains API visibility. Hover/selected-creation nicknames and backend public access remain unchanged; this is not an identity-privacy or full-security-audit claim. See crisp-theme-privacy.md.

All 29 tests, TypeScript and production export pass. Browser directory has zero maker metadata rows and no sample creator text; theme was visually inspected and screenshot saved. Draft/auth data flows preserved.

## Reload logo sequence — 10 October 2026
The text-free reload overlay now shows the exact supplied SVG faintly, draws its gold center, then reveals the six green petals clockwise starting at the top. SVG masks preserve the original logo silhouette. After completion, the overlay eases upward to reveal the current page; it is removed on animation completion with a timeout fallback. Reduced motion uses the completed mark and a short fade. No new dependency was added. Production build and TypeScript passed. Browser frame checks verified sequential petal drawing, upward movement, and overlay removal. Screenshots: outputs/logo-sequence-complete.png and outputs/logo-page-up.png (workspace root).


Reload sequence correction: center now draws clockwise in the original green. Petal traces begin at the center-facing stem, sweep anticlockwise, and end at the open tip instead of returning to the center. Petals progress anticlockwise from the top; exact SVG silhouette and page-up reveal are preserved. Production build/TypeScript pass; browser verified progressive reveal and overlay removal.


Reload thickness correction: replaced rotated approximations and sector clipping with six individual trace paths following the asymmetric SVG. Removed the final full-logo fill, so no completion thickening occurs. Original silhouette still supplies visible geometry. Green background and white mark retained. Build and TypeScript pass; complete animation frame inspected in browser (outputs/logo-full-thickness.png).


Preview layer selection: shared LayerSelection SVG overlay replaces dashed boundaries with solid evergreen contours, white contrast edges, a subtle tinted band, and an explicit selected-layer label. Canvas and vector fallback share the overlay; decorative previews omit it. Selection is rendered separately from cached flower bitmaps. Production build and TypeScript passed; browser checked base and middle selection plus top-view rings. Screenshot: outputs/visible-layer-selection.png.
