# Premium component integration

This pass extends the existing warm botanical identity with locally hosted Fraunces editorial headings and Manrope interface typography, a more deliberate flower-study frame, compact tabbed settings and refined control surfaces. The garden canvas and share card redesign remain paused.

## Components actually used

- shadcn/ui Radix Slider, Tabs and Tooltip wrappers were adapted to the project's existing CSS tokens. This avoids adding Tailwind, a second style system, lucide or utility packages merely for the wrappers. Source structure and behavior are based on the official MIT-licensed registry; local files are slider.tsx, tabs.tsx and tooltip.tsx.
- Magic UI Blur Fade was obtained from its official registry and adapted with Motion useReducedMotion and a no-JavaScript CSS fallback. It appears only on the homepage copy and flower study. It does not animate the editor or run an idle canvas loop.
- Motion supports the Magic UI component. CSS panel transitions are short, respect reduced motion and keep the same user workflow.

Sources: [shadcn Slider](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/slider.tsx), [Tabs](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/tabs.tsx), [Tooltip](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/tooltip.tsx), [Magic UI Blur Fade](https://magicui.design/docs/components/blur-fade), [registry JSON](https://magicui.design/r/blur-fade.json). Original licenses are included in shadcn-LICENSE.md and magicui-LICENSE.txt.

Also explored React Bits, Aceternity, Motion Primitives, Skiper, Kokonut and 21st.dev. Additional decorative component bundles were not needed for the selected design. No paid templates or licensed Pro components were used.

Fonts come from the official Google Fonts repository: [Fraunces](https://github.com/google/fonts/tree/main/ofl/fraunces), [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope). Font files and their OFL licenses are bundled in public/fonts. Next.js localFont self-hosts the new fonts; no runtime Google Fonts request is required. Existing Telugu font remains.

## Dependencies and behavior

Pinned compatible packages: @radix-ui/react-slider 1.5.0, @radix-ui/react-tooltip 1.3.0, @radix-ui/react-tabs 1.1.22 and motion 14.1.0. npm reported zero vulnerabilities after installation. Settings tabs support keyboard navigation and have associated tab panels; slider thumbs expose names and readable percentage values. Pointer commits, keyboard keyup, blur and cancellation preserve the studio's grouped history behavior.

All 29 existing tests, TypeScript and production export pass. Browser checks covered keyboard slider increments with immediate undo, pointer slider commit/undo, keyboard-triggered tooltip, settings tabs and accent enable/undo. The current eight-layer design was restored to 372 heads after every temporary edit. Current user flower choices, including their Tangedu base, were preserved. Narrow phone widths fit without horizontal overflow. Physical-device performance and an OS-level reduced-motion check were not performed.

Font optimization: the new fonts use locally hosted Latin WOFF2 files (107,112 bytes combined), with the existing Telugu font retained. The official Google Fonts CSS API supplied the subsets; licensing is unchanged. Final production browser check reported no captured application errors. Phone homepage and studio widths fit at 390px and studio at 320px. Desktop and phone component screenshots were saved. OS-level reduced-motion and physical phone GPU benchmarks remain unverified.

Template proportion buttons reuse the installed Motion package for a short tap transform; accessible pressed states, visible focus rings and reduced-motion support are retained. Current API checked at https://motion.dev/docs/react-motion-component. Existing Radix/shadcn-style tabs and sliders remain in the editor.

Visual refinement: template browsing uses an editorial header and a desktop sidebar beside the collection, with a stacked mobile layout. Larger preview surfaces, consistent metadata, clear action arrows and deep teal pressed states replace the plain form appearance. Studio tabs, flower selection, slider handles and value outputs, dropdown chevrons and the accent switch share the same tokens. Motion tap feedback and reduced-motion support remain. No new dependencies or image-rendering workload were introduced. Production build and TypeScript passed; desktop and mobile collection layout and the Shape controls were visually inspected, with no observed horizontal overflow at 417px.

Template-first editor: a prominent dark teal entry section appears before the working controls, with direct Mini/Small/Medium/Large collection shortcuts. These open a filtered picker without applying anything to the draft. The default preview is side profile. An optional inline How to arrange disclosure explains the three-step workflow. Flower selections are compact; botanical information remains available in a disclosure, with colour controls visible sooner. A static 64px PNG grain tile textures the banner. Desktop dialog backdrops have 3px blur; mobile and reduced-transparency preferences disable blur. No live noise shader is used. Production build and TypeScript passed. Browser checks verified desktop/mobile layout, explainer expansion, Mini and Medium filtering, initial side-profile selection and no horizontal overflow at the observed 417px mobile width.

### Product motion system (October 10)
- Existing Motion only; shared `SelectionGroup` highlights use scoped LayoutGroup/layoutId and a damped spring. Template size/height, layer list, preview projection and settings tabs each have independent highlights.
- Scrollable template dialog/panes and mobile layer rail declare layoutScroll; dialog declares layoutRoot. Flower rendering and slider scheduling are unchanged.
- PageMotion provides opacity-only route entrances (no transformed ancestor of the fixed/sticky story sculpture). Story chapter reveals keep future chapters inert and invisible until unlocked.
- Finite section entrances, disclosure reveals, navigation underlines and pointer-only thumbnail/button feedback. Reduced motion disables transforms/entrances and shared highlight travel; no perpetual animated noise or added dependencies.
- API references: https://motion.dev/docs/react-layout-animations and https://motion.dev/docs/react-accessibility.

### Six-petal brand emblem
Clean SVG interpretation of the user-supplied Minimalist Six-Petal Green Emblem. Shared geometry in src/lib/brand/logo.ts drives the React logo, exported card mark and generated browser/touch icons. Updated header/footer, branded actions, garden empty/loading states and white diagonal-fill reload animation. Original circular slider controls are retained. scripts/export-brand.ts runs before production builds.

The later supplied SVG replaces the earlier interpretation: its exact path is used unchanged everywhere, with a cropped viewBox removing only whitespace. Circular slider handles include the same SVG and retain 44px touch targets.

### Styled select controls
Added @radix-ui/react-select 2.3.8, matching the existing Radix foundation. Shared ui/select.tsx replaces browser menus for arrangement pattern, accent flower/count and template filters. The controlled values and callbacks are preserved. Popper collision handling, focus management, typeahead, arrow/Escape keys and scroll buttons come from Radix; portals target the closest native dialog to keep template menus within its top layer. Styling uses the current teal palette, 44px rows, selected checks and a short reduced-motion-aware entrance.
API: https://www.radix-ui.com/primitives/docs/components/select
