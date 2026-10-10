# Guided homepage and smaller crowns

The homepage now carries one actual 3D Bathukamma from the hero through four interactive chapters. Its sticky preview travels down the page and rotates through a full turn as the reader scrolls. Motion useScroll/useSpring drive the transform; the shared Three scene renders on demand. Reduced-motion users receive a static rotation, and WebGL failure falls back to the illustrated preview. On mobile the compact preview stays above the chapter controls.

The guide starts with Tangedu, adds Gunugu, adds Banti and finishes two upper bands. Only completing the guide and selecting Customise this arrangement transfers it to the studio. The hand-off is session-scoped, consumed once and committed into the studio's existing Undo history. The guide itself does not overwrite a saved draft. Existing user drafts are restored normally and are not rewritten as a starter template.

New starters and the Small/Medium/Big templates use a Tangedu base. Names are now explicit: Small (3 layers), Medium (5), Big (7); Colourful remains available in the studio. The studio's fresh default remains five layers.

The previous radius floor of 28 caused added upper layers to repeat the same size. The radius and band-width minima are now 8. Newly added layers use 68% of the previous radius and automatically clamp band width. With the five-layer starter, layers six/seven/eight taper to 26/18/12. Existing wider layers can also be reduced manually to 8. Old valid designs remain valid; canonical layout versions and flower identities are unchanged.

Supabase: fresh schema files include the new bounds. An EXISTING configured backend must apply supabase/small-crown-upgrade.sql before accepting newly published small-crown designs. The function update retains all colour validation, consent, ownership and quota protections; no RLS permission is expanded. No remote migration was applied here.

Validation: 35 tests pass and production export/TypeScript pass. Tests cover progressive guide validity, one-step undo to an existing draft, layers through eight, tiny-crown save/restore, SQL acceptance at 8/rejection below 8, explicit template sizes and existing mobile geometry budgets. The browser guide completed, a Big template transferred to the studio, layer seven reached radius 8, and two Undo actions restored the original six-layer draft; exported before/after JSON was identical. Desktop hero and mobile chapter layout were inspected. Physical-phone performance and reduced-motion emulation were not measured.

Motion API reference: https://motion.dev/docs/react-use-scroll

Deploy the new story build archive, not any earlier flower-polish archive.
