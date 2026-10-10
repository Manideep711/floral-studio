import type {GardenEntry} from "./model";
import {irregularPosition} from "./spatial";
import type {Design} from "../design/schema";
import {generateLayout,type Placement} from "../design/layout";
export const FESTIVAL_LIMIT=24;
export function festivalPosition(slot:number,anchor:number){const p=irregularPosition(slot),a=irregularPosition(anchor);return {x:p.x-a.x,z:p.z-a.z};}
export function nearbyEntries(entries:GardenEntry[],anchor:number,x:number,z:number,limit=FESTIVAL_LIMIT){return entries.map(entry=>({entry,...festivalPosition(entry.slot,anchor)})).filter(p=>(p.x-x)**2+(p.z-z)**2<=1600).sort((a,b)=>(a.x-x)**2+(a.z-z)**2-((b.x-x)**2+(b.z-z)**2)).slice(0,limit);}

// Keep already visible slots rather than replacing them when nearest rankings
// change. Only entries outside the padded view may leave the active window.
export function stableNearbyEntries(entries:GardenEntry[],anchor:number,x:number,z:number,retained:readonly string[],inView:ReadonlySet<string>,limit=FESTIVAL_LIMIT){
 const nearby=nearbyEntries(entries,anchor,x,z,entries.length).filter(p=>inView.has(p.entry.id));
 const keep=new Set(retained);
 const selected=[...nearby.filter(p=>keep.has(p.entry.id)),...nearby.filter(p=>!keep.has(p.entry.id))].slice(0,limit);
 return selected.sort((a,b)=>a.entry.slot-b.entry.slot);
}
export type FestivalHead=Placement&{entryId:string;slope:number;worldX:number;worldZ:number};
const layouts=new WeakMap<Design,(Placement&{slope:number})[]>();
function cachedLayout(design:Design){let result=layouts.get(design);if(!result){const layers=new Map(design.layers.map(l=>[l.id,l]));result=generateLayout(design).map(p=>{const l=layers.get(p.layerId)!;return {...p,slope:p.accent ? .95 : design.layoutVersion===2 ? Math.atan(l.rise/l.width) : 0};});layouts.set(design,result);}return result;}
export function festivalHeads(entries:GardenEntry[],anchor:number):FestivalHead[]{return entries.flatMap(entry=>{const pos=festivalPosition(entry.slot,anchor);return cachedLayout(entry.design).map(p=>({...p,entryId:entry.id,worldX:pos.x+p.x*.01,worldZ:pos.z+p.z*.01}));});}
