import type {GardenEntry} from "./model";
export type HexCell={q:number;r:number};
export const HEX_SPACING=5.8,NEIGHBOR_RADIUS=4,MAX_GARDEN_CACHE=160;
export function hexCell(slot:number):HexCell{
  const n=Math.max(0,Math.floor(slot)-1);if(!n)return {q:0,r:0};
  const k=Math.ceil((Math.sqrt(12*n+9)-3)/6),index=n-(1+3*k*(k-1));
  const directions=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
  const side=Math.floor(index/k),step=index%k;let q=-k,r=k;
  for(let i=0;i<side;i++){q+=directions[i][0]*k;r+=directions[i][1]*k;}
  return {q:q+directions[side][0]*step,r:r+directions[side][1]*step};
}
export function hexWorld(cell:HexCell){return {x:HEX_SPACING*(cell.q+cell.r/2),z:HEX_SPACING*Math.sqrt(3)/2*cell.r};}
export function worldHex(x:number,z:number):HexCell{
  const r=z/(HEX_SPACING*Math.sqrt(3)/2),q=x/HEX_SPACING-r/2,s=-q-r;
  let rq=Math.round(q),rr=Math.round(r);const rs=Math.round(s),dq=Math.abs(rq-q),dr=Math.abs(rr-r),ds=Math.abs(rs-s);
  if(dq>dr&&dq>ds)rq=-rr-rs;else if(dr>ds)rr=-rq-rs;
  return {q:rq,r:rr};
}
export function hexDistance(a:HexCell,b:HexCell){return Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));}
// Small deterministic offsets soften the grid without allowing plates to collide.
export function irregularPosition(slot:number){const p=hexWorld(hexCell(slot));const h=(Math.imul(slot|0,1664525)+1013904223)>>>0;return {x:p.x+((h%1000)/999-.5)*.46,z:p.z+(((h>>>10)%1000)/999-.5)*.46};}
export function mergeNeighborhood(old:GardenEntry[],incoming:GardenEntry[]){const ids=new Set(incoming.map(e=>e.id));return [...incoming,...old.filter(e=>!ids.has(e.id))].slice(0,MAX_GARDEN_CACHE);}
