import type {FlowerId} from "./catalog";
// One size contract for the illustrated preview and procedural flower heads.
// Changing artwork never changes a saved flower's identity, color or placement.
export const flowerAppearance:Record<FlowerId,{svgScale:number;worldScale:number}>={
  tangedu:{svgScale:.91,worldScale:1.13},
  gunugu:{svgScale:.91,worldScale:1.15},
  banti:{svgScale:.91,worldScale:1.12},
  rose:{svgScale:.91,worldScale:1.12}
};
