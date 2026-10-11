# Make Your Own Digital Bathukamma

Source repository: **floral-studio**.

Original botanical studio, matching procedural 3D reveal, shared festival courtyard and personalized PNG cards. Next.js 16.4.0 / React 19.3.0 / TypeScript 7.0.2 / React Three Fiber 9.8.1 / Three.js 0.186.1. Versions and peer compatibility were checked against npm on 2026-10-09 and are pinned in package.json and package-lock.json.

## Run on Windows

From the extracted project directory:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the URL printed by Next.js, then `/studio`. The development server binds to loopback only. Node 20.9+ is required by this Next.js version; development used Node 24.11.0.

```powershell
npm.cmd run build
npm.cmd run typecheck
npm.cmd test
npm.cmd start
```

## Implemented

- Homepage and responsive layer editor.
- Original Tangedu, Gunugu (spike form), and Banti vector flower artwork.
- Flower/color selection; radius, band width, rise, density, and pattern controls.
- Add/remove/reorder up to eight layers; top view and schematic side profile.
- Undo/redo, including grouped slider interactions; selected-layer and full-design reset.
- Validated, versioned local drafts and JSON download/restore.
- Bundled Noto Sans Telugu font with OFL license.
- Three original procedural flower-head geometries, instanced from canonical placements.
- Four-phase reveal with flattened-to-dimensional geometry, camera transition and settling; skip, replay, and reduced motion.
- Pointer/touch orbit and zoom; accessible rotate/zoom/reset buttons.
- WebGL detection, context-loss/error handling, and an illustrated fallback.
- One studio lighting environment; capped pixel ratio, demand rendering, lighter rendering on mobile and after observed slow reveals.
- Fuller, overlapping flower heads and recessed foliage; detailed/lighter procedural geometry tiers with matching illustrated artwork.

The canonical model is in `src/lib/design/schema.ts`. `layout.ts` is the deterministic source of flower positions for SVG and both 3D renderers. X/Z are plate coordinates and Y is elevation. Values use arbitrary studio units, not physical centimeters. Placement output is quantized to four decimals for consistent server/browser rendering.

## Limitations

Personalized 1080 × 1350 PNG cards support downloads and native file sharing where available. Optional shared garden persistence is implemented through Supabase but requires owner project configuration; the local preview currently shows labelled samples. The editor's side profile is a schematic proportion preview; Bloom into 3D opens the actual scene. Drafts live only in this browser on this device; JSON backups can be restored elsewhere. Local saving does not publish designs. Physical Android/iOS GPU performance remains unverified.

Layout version 2 distributes flower elevations across each band's inward rise, improving the mound silhouette. Version 1 remains supported by the generator; the first Bloom action upgrades a legacy draft to version 2 as an undoable change. All IDs, counts, flower identities, colors, top-view coordinates, rotations and scale variations are preserved. The 3D renderer consumes the same upgraded canonical layout as the editor. This is tested explicitly.

The current stable Fiber release internally uses the deprecated Three.Clock API. Three.js emits a warning, but no rendering error was observed; the app does not suppress it or patch dependency code. Revisit this when a compatible stable Fiber release adopts Timer. Frame-rate readings are diagnostics from this browser session, not device guarantees. Skipped and reduced-motion reveals intentionally report no meaningful FPS sample (0).

Flower forms and Telugu labels require a local cultural/native-language review before public release. No medicinal or ritual-symbolism claims are made. Original SVG drawings are stylized interpretations, not scientific plates. See `docs/references.md`.

## Assets

The editor reuses the original vector specification in `src/components/flowers/FlowerArt.tsx`. Standalone SVGs are in `public/flowers`; regenerate them with `npx tsx scripts/export-flower-assets.tsx`. Noto Sans Telugu is bundled from the official Google Fonts repository, with its SIL Open Font License in `public/fonts/OFL.txt`. English uses system fonts, so no remote font request is required at runtime.

## Community garden

Public pan-and-zoom canvas and optional authenticated publication: see docs/community-garden.md. Email/password sign-in, account creation and password recovery are wired for Supabase. Sign-in or local saving never publishes a creation; publication requires an explicit reviewed consent step. See supabase/garden.sql and .env.example for setup. No backend credentials are bundled.


## Festival scene and accent flowers

The garden displays 3D Bathukammas on a neutral plane, with pan, zoom, optional rotation, close-range nicknames and owner-only editing through My flowers. There are no people, public View actions or 2D garden fallback. Find my Bathukamma focuses owned entries. Existing databases may need supabase/accent-upgrade.sql and supabase/spatial-upgrade.sql; fresh projects use garden.sql. See docs/deployment.md for hosting.

## Deployment readiness

Use Node 24 and run `npm run verify` for tests, the full production build and TypeScript checks. Vercel static hosting is configured in vercel.json. CI is prepared in .github/workflows/check.yml. The live garden needs both public Supabase variables and Google/email provider configuration. Set REQUIRE_LIVE_GARDEN=1 on the host to prevent accidentally deploying sample mode. See [docs/deployment.md](docs/deployment.md).



## Premium component pass

The interface now uses adapted shadcn/ui Radix tabs, sliders and tooltips, Magic UI Blur Fade with reduced-motion handling, and locally hosted Fraunces/Manrope typography. See docs/component-sources.md for provenance, licenses, dependency versions and QA. Garden and card design work remains paused; model, draft, authentication and database flows are preserved.

After creating garden.sql, apply supabase/one-per-owner-upgrade.sql (also required for existing deployments). Each account has one garden entry; save_garden_entry updates it atomically without moving its slot. Earlier duplicates are retained in the private garden_private.duplicate_entries archive, inaccessible to browser roles.
