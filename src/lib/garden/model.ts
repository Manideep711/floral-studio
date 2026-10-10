import {validateDesign,type Design} from "../design/schema";
import {defaultDesign} from "../design/defaults";
import {irregularPosition} from "./spatial";
export type GardenEntry={id:string;slot:number;title:string;creator_name:string;design:Design;created_at:string};
export type Viewport={x:number;y:number;zoom:number};
export const PENDING_KEY="bathukamma:garden-pending:v1";
export const PAGE_SIZE=48;
// The illustrated fallback uses the same irregular hexagonal neighborhood.
export function gardenPosition(slot:number){
  const p=irregularPosition(slot),origin=irregularPosition(1);return {x:(p.x-origin.x)*54,y:(p.z-origin.z)*54};
}
export function zoomAt(v:Viewport,factor:number,x:number,y:number):Viewport{
  const zoom=Math.min(1.8,Math.max(.3,v.zoom*factor));
  return {x:x-(x-v.x)*zoom/v.zoom,y:y-(y-v.y)*zoom/v.zoom,zoom};
}
export function visibleAt(slot:number,v:Viewport,width:number,height:number){
  const p=gardenPosition(slot),x=width/2+v.x+p.x*v.zoom,y=height/2+v.y+p.y*v.zoom;
  return x>-180*v.zoom && x<width+180*v.zoom && y>-180*v.zoom && y<height+180*v.zoom;
}
// Publish only known visual fields. Private draft dedication and extra keys never leave the device.
export function publicSnapshot(design:Design,title:string):Design{
  if(!validateDesign(design))throw new Error("This design cannot be published.");
  return {schemaVersion:1,layoutVersion:design.layoutVersion,flowerLibraryVersion:1,seed:design.seed,scene:"studio",layers:design.layers.map(l=>({id:l.id,flower:l.flower,color:l.color,radius:l.radius,width:l.width,rise:l.rise,density:l.density,pattern:l.pattern,offset:l.offset,...(l.accent ? {accent:{flower:l.accent.flower,color:l.accent.color,count:l.accent.count}} : {})})),personalization:{title:title.trim().slice(0,100),dedication:"",language:design.personalization.language}};
}
export function parsePending(raw:string|null):Design|null{
  try {const p=JSON.parse(raw||"null");return p && Number.isFinite(p.savedAt) && Date.now()-p.savedAt<7*86400000 && p.savedAt<=Date.now() && validateDesign(p.design) ? p.design : null;}catch{return null;}
}
export function parseEntry(value:unknown):GardenEntry|null{
  const e=value as GardenEntry;
  return e && typeof e.id==="string" && Number.isSafeInteger(e.slot) && e.slot>0 && typeof e.title==="string" && e.title.length<=100 && typeof e.creator_name==="string" && e.creator_name.length<=40 && typeof e.created_at==="string" && validateDesign(e.design) ? e : null;
}
export function sampleEntries():GardenEntry[]{
  const names=["Sunlit circles","A little festival","Golden hour","Petals for home","The pink crown","తెలంగాణ పూలు","Morning bloom","Colors of joy","A warm welcome","Flower by flower","A circle of love","September memories"];
  return names.map((title,i)=>{
    const d=defaultDesign();d.seed+=i*91;
    d.layers=d.layers.map((l,k)=>({...l,rise:29+(i+k)%9,density:1.08,color:l.flower==="banti" ? ["#E98333","#F3AA36","#F3CE49"][(i+k)%3] : l.flower==="gunugu" ? ["#EEE4D7","#DCA7BA","#C8587A","#973E68"][i%4] : ["#F2C643","#EFB32B","#F8DC77"][(i+k)%3],...(k<3&&i%2===0 ? {accent:{flower:"tangedu" as const,color:"#F8DC77",count:Math.max(6,14-k*3)}} : {})}));
    if(i%3===0)d.layers.push({id:"sample-top",flower:"gunugu",color:"#C8587A",radius:28,width:28,rise:30,density:1,pattern:"rings",offset:0});
    return {id:`sample-${i}`,slot:i+1,title,creator_name:"Studio sample",design:publicSnapshot(d,title),created_at:"2026-10-09T00:00:00Z"};
  });
}
