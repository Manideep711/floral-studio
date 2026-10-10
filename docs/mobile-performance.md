# Mobile studio refinement

The editor now rasterizes the original flower artwork once per species/colour and stamps those cached sprites onto a bounded-resolution canvas. Flower identities, counts, positions, accent rings and side projection still come from the canonical layout used by the 3D viewer. The existing vector preview remains a fallback when canvas/artwork cannot load.

Slider events are coalesced to one React update per animation frame. The latest value is retained synchronously, so release, blur and cancellation commit the final value as one undoable gesture. Unchanged flower icons are memoized, and the editor flower count no longer generates a duplicate full layout.

Below 700 px the compact preview remains sticky while the settings scroll. Focused sliders have clearance below the preview and above the fixed action bar. Four explicit templates are available: Small, Classic, Grand and Colourful. Applying a template preserves personalization and is undoable. Template previews also use cached sprites.

Validation: 31 tests pass, TypeScript passes, production static export succeeds. Browser checks covered 320×568 and 390×844 mobile layouts, 768×1024 tablet, slider keyboard changes, a pointer drag/release followed by one Undo, template selection/Undo, both view projections and draft reload. An exported before/after draft comparison was identical. No new dependencies.

Observed flower-draw CPU times were approximately 1–4 ms on this desktop browser using mobile viewport sizes. These measurements exclude React, compositing, input latency and display timing. They are not a physical-phone benchmark or an FPS guarantee.

The deployment archive is the static `out` directory, suitable for Cloudflare Pages direct upload. Authentication/public publishing still require the Supabase configuration described in the existing deployment documentation.
