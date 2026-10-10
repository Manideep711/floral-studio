# Festival courtyard and accent flowers

The community garden now defaults to a real WebGL 3D scene: multiple Bathukamma share a green festival courtyard, surrounded by original stylized celebrants, marigold garlands, brass lamps and warm dusk lighting. Decorative figures are scenery, not fake authenticated users. Unconfigured preview arrangements remain labelled Studio samples. Real published entries use their public display names.

Drag to orbit, right-drag/two-finger drag to pan, and scroll/pinch to zoom. Camera buttons and keyboard arrows/+/-/Home provide alternatives. Hovering or tapping a stack reveals its maker card; the card opens the detailed bloom. The Find a Bathukamma directory provides keyboard-accessible lookup, camera jumps and direct opening. WebGL failure preserves browsing through the illustrated garden. There is no automatic camera motion or flashing animation.

The shared scene reconstructs every canonical flower head. At most 24 nearby loaded arrangements are active; distance geometry and a small detailed-neighbor set reduce work. Figure geometry and hidden layer supports are batched, flowers are instanced by species, and the scene renders on demand. Full detail is available in the individual viewer. This is stylized procedural 3D, not photorealistic rendering or a physical-mobile performance guarantee.

In the studio, choose a layer and enable Add spaced accent flowers. Select Tangedu, Gunugu or Banti, choose a color, and set 4–24 accents. Larger heads sit evenly around the upper edge of that band. The count is independent of the main layer's fullness. Accent settings participate in undo/redo, device-local saving, JSON backup/restore, SVG previews, 3D reconstruction and public snapshots. Older saved designs remain valid and do not acquire accents automatically.

For a new Supabase project, use the updated supabase/garden.sql. If the previous table/schema is already installed, apply supabase/accent-upgrade.sql once to update its design validator; it preserves existing records and ownership policies. Google/email sign-in and live publishing still require project configuration described in community-garden.md.

## Plain garden revision
At the owner's request, the garden scene now contains only Bathukammas on a neutral plane. Removed crowd meshes, overhead garlands, lamps, decorative rings, courtyard labels, maker popups, and the arrangement directory. Removed the page hero and promotional strip. Kept minimal navigation/publication entry points, camera controls, click-to-open, spatial neighborhood loading, and the 2D fallback. The fallback also shows only arrangements without public names/captions or a dotted background. Preserved authentication, consent, published entries and database flows. Rendering remains on demand with the existing mobile budgets. Production build and TypeScript passed; browser inspected desktop 3D and phone bounds (equal client/scroll widths after header fix). Screenshot: outputs/plain-garden.png.


3D-only revision: removed the illustrated-view switch and GardenCanvas fallback from the garden. Unsupported WebGL now displays a concise unavailable state instead of a 2D renderer. Camera controls disable until the scene is ready. Studio's 2D editor remains independent. Production build and TypeScript pass.


## Close inspection and ownership
Distant arrangements no longer have clickable open targets. Camera changes expose one on-screen nickname/title/View card only within 10 world units and after that creation is selected for detailed rendering. Detail budget prioritizes the camera target; one large focused arrangement may exceed the usual flower budget so mobile users can inspect it. Moving away hides the card. No continuous render loop was added.
Publication now includes allow_editor_copy, false by default. Owners can always open their own editor copy; visitors require explicit opt-in. Permissions are rechecked against the current record before routing. Existing snapshots remain locked after the additive supabase/editor-access-upgrade.sql migration. The preference controls the product's copy action; published geometry remains public for 3D rendering and is not copy-protected. No visitor edits change the published original. Studio handoff commits a validated copy into history, preserving Undo of the previous draft.
Authenticated owners focus automatically on their latest creation, have Find mine, and can Find in garden for each entry in My flowers. Distant owned slots load their spatial neighborhood before inspection. Supabase is not configured locally, so live sign-in/owner camera behavior awaits connection; these account paths were source-checked. A database upgrade is required before using the new query/insert fields in a connected deployment.
Validation: 39 tests pass including PGlite owner/consent/quota checks, locked defaults, explicit opt-in insert permissions and immutable permission snapshots. Browser verified close-only inspection, locked viewer without copy action, allowed copy handoff (507 heads), and Undo restoring the original 246-head draft. Screenshots: outputs/garden-close-inspection.png.


## Owner-only editing and world labels (current)
This supersedes the editor-copy opt-in above: the public-copy toggle, permission field/query, and proposed migration were removed. Only entries in the authenticated owner's list show Edit my Bathukamma; the edit action calls getUser and rereads the selected entry filtered by owner_id before opening it in the studio. Visitor views have no editor action. Existing published snapshots remain immutable; owner editing changes their local studio draft, with Undo preserving the previous draft.
The previous bottom inspection panel was replaced by a Three.js CSS2DObject. CSS2DRenderer projects an accessible HTML nickname/title/View label alongside the actual sculpture on demand. The label uses a translucent surface, backdrop blur, restrained border and shadow. Desktop labels flip to the opposite side when needed; narrow screens position them just above the crown. Labels hide outside close/detail range. No dependency was added. The garden stays 3D-only. Build and 39 tests pass; live authenticated ownership still awaits the Supabase connection.


## Minimal nickname labels
Close-range labels now show only the public nickname, on the right of the sculpture, with compact translucent styling. Removed title and View actions and the public viewer overlay. Labels pass gestures through to the canvas. Owner editing remains in My flowers as Edit mine and retains the authenticated ownership check.

## Fixed-angle pan and close-only flowers
Garden navigation now locks rotation, supports left-drag or one-finger pan, pinch/wheel zoom, and visible directional pan buttons. Owner focus preserves the same viewing angle. Far arrangements use lightweight solid 3D layer silhouettes; canonical flower placement is generated only for detail candidates within 14 world units, capped at two on mobile or four on desktop with the existing head budget. A large closest arrangement can exceed that budget within 10 units. Nicknames appear for the detailed close-range arrangements, on the right, with no View action. Rendering remains on demand.

## Flower-preserving distance rendering (current)
Replaces the solid layer silhouettes above. Every active arrangement keeps its canonical flower heads at every distance. Shared compact petal meshes serve distant flowers; nearby flowers use the existing detailed mesh. Flowers are instanced into at most eight species/detail batches, layouts are cached by design with a WeakMap, and changing detail no longer regenerates placement layouts. The active neighborhood remains capped at 12/mobile or 24/desktop and rendering stays on demand. Pan-only navigation and close-range nickname labels are preserved.

## Optional rotation and finding owned flowers
Pan remains the default with no automatic rotation. Rotate view explicitly enables orbit dragging; Pan view locks the chosen angle again. Reset angle restores the original orientation without changing the current target or zoom. Authenticated owners have a prominent Find my Bathukamma button inside the canvas and subtle green plate outlines on their visible published creations. Finding an owned entry loads its neighborhood and centers it at close range; multiple creations remain individually reachable through My flowers. Live authenticated verification requires the Supabase connection.

## Scroll rebuild fix
Camera controls persist across neighborhood updates. Camera movement redraws existing instance buffers immediately; neighborhood and detail reconciliation waits for a 160 ms pause in input. Detail uses a separate exit distance to avoid repeatedly flipping at its boundary. Active entries use stable ordering so identical sets reuse their placement arrays and support geometry. Flower batches retain capacity across count changes rather than remounting for every new count; buffer capacity only grows when needed. Memoized batches skip uploads on unrelated UI updates. Canvas data attributes gardenControls/gardenReconciles/gardenUploads expose simple lifecycle counters for browser verification.

Validation: production build and 42 tests pass, including detail exit-band stability. Browser lifecycle counters stayed at one controls instance; six rapid zoom inputs left uploads unchanged during the burst (16), then performed one settled reconciliation (2 to 3) and one batch upload pass (16 to 24). Actual wheel input was also exercised. These checks verify rebuild behavior, not physical-phone FPS.

Narrow-screen verification: a second six-input zoom burst kept the counters unchanged within the burst (one controls instance, 24 reconciliations, 88 upload passes both before and after). Neighborhood traversal also retained one controls instance. No console errors were observed.

## Stable arrangements while panning
The active set now retains existing slots inside the padded camera view instead of replacing them when distance rankings change. Newly visible arrangements fill freed slots; world positions and canonical flower placements remain slot-based. This retains the 12/mobile and 24/desktop limits. A regression test verifies that panning changes neither the IDs nor world positions of retained arrangements, and offscreen eviction leaves remaining entries unchanged. Close-range detail still changes mesh fidelity without changing the underlying design.

Verified in the browser: one pan retained all 24 active slots with exactly unchanged world coordinates. Production build and all 43 tests pass.
