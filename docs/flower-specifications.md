# Shared botanical asset specifications — library v1

## Tangedu

Five unequal rounded petals; warm yellow variants; fine vein details; compact dark stamen cluster. The 3D asset should use curved petal surfaces with a corresponding center. Do not replace it with a radial daisy icon.

## Gunugu

The selected initial interpretation is a tapered Celosia argentea spike. Fine overlapping marks communicate many small flowers/bracts. Pale ivory and pink are natural appearance choices; saturated pink/plum are labeled decorative choices. The 3D head should be tapered with overlapping bracts and shallow relief, not a spherical bloom or a cockscomb crest. Local form review remains pending.

## Banti

A selected Tagetes erecta marigold form: rounded flower head with three visible concentric tiers of scalloped, overlapping petals. Yellow, amber, and orange. The 3D head should preserve the ruffled, densely layered profile.

## Representation contract

Flower IDs and color values come from the canonical design. Both views use `generateLayout(design)`. The SVG uses X/Z placement coordinates and rotation about Y. The future renderer must preserve stable placement IDs, counts, colors, and relative transforms. The SVG's scale factor converts geometry conventions and must be reflected in 3D asset sizing. Side profile is explicitly schematic.

Natural variation uses a stable seed; no Math.random during render. Editor controls may change counts deterministically. Generator/library version fields exist so shared creations can remain stable across future changes.

## Implemented 3D and layout v2

Procedural geometries in `src/lib/three/flowers.ts` follow these specifications. Petals, stamens and bracts are merged into one reusable head geometry per species, with vertex color details. Instances carry the design's flower color and canonical transform. No separate flower positions are sampled for 3D.

Layout v2 adds inward elevation across the band's rows. Heads tilt to follow the same slope; the support is a truncated leaf-colored mound beneath them. These orientation conventions are consistent for every instance and derived from layer dimensions, without changing species or counts. A 4.4-second timeline animates elevation, depth and camera; skip and reduced motion resolve to the same final transforms.

## Fuller botanical rendering refinement

Based on the owner's supplied arrangement photographs, flower heads now overlap more closely and carry more volume. Marigold heads have a softly domed core and five tiers of curled florets. Tangedu uses broader cupped petals, smooth normals and a smaller stamen cluster. Gunugu uses a broader fluffy spike with a restrained inclination, avoiding the previous long spoke-like projection. Original SVG artwork was refined to match these forms.

`src/lib/flowers/appearance.ts` provides shared SVG/world sizing. Saved counts, species, colors, IDs and placement coordinates are unchanged. Small deterministic tonal variation follows the existing scale seed. Foliage support is slightly inset and recessed, with a dark natural olive material; no extra flowers or painted flower textures are used to conceal it. Intentionally sparse designs can still expose leaves.

Detailed and lighter geometry tiers reuse the same footprint. Quality changes rebuild the appropriate head geometry while preserving camera position and all canonical instances. Starter geometry is bounded below 280,000 triangles in detailed mode and below 200,000 in lighter mode, before shadow passes.

The supplied photos and watermarked illustrations were used only for visual reference. No image pixels or third-party artwork were incorporated. This remains original procedural, stylized botanical geometry rather than a photorealistic scan.
