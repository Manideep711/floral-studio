import { flowers, type FlowerId } from "../flowers/catalog";
export type Pattern = "rings" | "staggered";
export type Accent = {flower:FlowerId;color:string;count:number};
export type Layer = { id: string; flower: FlowerId; color: string; radius: number; width: number; rise: number; density: number; pattern: Pattern; offset: number;accent?:Accent };
export type Design = { schemaVersion: 1; layoutVersion: 1|2; flowerLibraryVersion: 1; seed: number; layers: Layer[]; scene: "studio"; personalization: { title: string; dedication: string; language: "en" | "te" } };
export const LIMITS = { layers: 8, radius: [8, 180], width: [8, 50], rise: [10, 40], density: [0.55, 1.2] } as const;
export function validateDesign(value: unknown): value is Design {
  if (!value || typeof value !== "object") return false;
  const d = value as Design;
  if (d.schemaVersion !== 1 || ![1,2].includes(d.layoutVersion) || d.flowerLibraryVersion !== 1 || !Number.isSafeInteger(d.seed) || d.scene !== "studio") return false;
  if (!Array.isArray(d.layers) || d.layers.length < 1 || d.layers.length > LIMITS.layers) return false;
  const ids = new Set<string>();
  for (const l of d.layers) {
    if (!l || typeof l.id !== "string" || l.id.length > 80 || !l.id || ids.has(l.id)) return false;
    ids.add(l.id);
    if (!flowers.some(f => f.id === l.flower && f.colors.some(c => c.hex === l.color))) return false;
    for (const k of ["radius", "width", "rise", "density"] as const) {
      if (!Number.isFinite(l[k]) || l[k] < LIMITS[k][0] || l[k] > LIMITS[k][1]) return false;
    }
    if (l.width > l.radius || !["rings", "staggered"].includes(l.pattern) || !Number.isFinite(l.offset) || Math.abs(l.offset) > Math.PI * 2) return false;
    if(l.accent && (!flowers.some(f=>f.id===l.accent!.flower && f.colors.some(c=>c.hex===l.accent!.color)) || !Number.isInteger(l.accent.count) || l.accent.count<4 || l.accent.count>24))return false;
    if(l.accent!==undefined && (!l.accent || typeof l.accent!=="object"))return false;
  }
  const p = d.personalization;
  return !!p && typeof p.title === "string" && p.title.length <= 100 && typeof p.dedication === "string" && p.dedication.length <= 300 && ["en","te"].includes(p.language);
}
