# 3D flower depth refinement

Reduced ambient/fill illumination and introduced a more directional warm key with a cool rim. Desktop shadow coverage now focuses on the sculpture with a 1024 px map. A small reusable radial contact texture grounds the plate, including when realtime shadows are disabled by lighter rendering.

Original instanced flower geometry now carries variation within petals for pigment, creases and midtones. No new dependencies or postprocessing passes. Tangedu has smoother, less cupped petals, a filled golden throat and shorter, softer stamens instead of the previous angular oversized crown and dark spikes. The canonical saved layout and 2D editor are unchanged.

Validation: all 32 tests pass, TypeScript passes and static production build passes. Geometry tests cover finite positions/normals/colours, mobile pigment variation, compact Tangedu bounds, unchanged canonical reconstruction, and existing starter triangle budgets. Browser inspection confirms the revised full-quality six-layer sculpture. A fresh viewer resolved a screenshot failure on the earlier tab. Physical phone performance and visual quality remain unverified; no FPS claim is made.

Material reference: https://threejs.org/docs/pages/MeshStandardMaterial.html

Use the new 3D-refined deployment archive instead of the previous mobile-only archive. Supabase/auth configuration remains optional and unchanged.
