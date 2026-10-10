import type { Design,Layer } from "./schema";
import type { FlowerId } from "../flowers/catalog";
export type Placement = {id:string;layerId:string;flower:FlowerId;color:string;x:number;y:number;z:number;rotation:number;scale:number;accent?:boolean};
// Coordinates: X/Z are the plate plane; Y is elevation. SVG projects X/Z.
function hash(input: string, seed: number) {
  let h = seed | 0;
  for (let i=0;i<input.length;i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}
// Quantize persisted placements to avoid last-bit trig differences across JS engines.
const q = (value:number) => Math.round(value*10000)/10000;
function layoutBands(layer:Layer){const size=layer.flower==="gunugu" ? 14 : 17,rows=Math.max(1,Math.round(layer.width/(size*.85)));return Array.from({length:rows},(_,row)=>{const r=Math.max(0,layer.radius-(row+.5)*layer.width/rows);return {row,r,count:Math.max(1,Math.round(2*Math.PI*r/(size/layer.density)))};});}
export function placementCount(design:Design){return design.layers.reduce((sum,l)=>sum+layoutBands(l).reduce((n,b)=>n+b.count,0)+(l.accent?.count||0),0);}
export function generateLayout(design: Design): Placement[] {
  const result: Placement[] = [];
  let elevation = 0;
  for (const layer of design.layers) {
    const bands=layoutBands(layer),rows=bands.length;
    for(const {row,r,count} of bands) {
      for(let slot=0;slot<count;slot++) {
        const id = `${layer.id}:${row}:${slot}`;
        const random = hash(id,design.seed);
        const a = slot/count*Math.PI*2+layer.offset+(layer.pattern === "staggered" && row%2 ? Math.PI/count : 0);
        const radius = r+(random-0.5)*1.8;
        const heightFraction=design.layoutVersion===1 ? .65 : (row+.5)/rows;
        result.push({id,layerId:layer.id,flower:layer.flower,color:layer.color,x:q(Math.cos(a)*radius),y:q(elevation+layer.rise*heightFraction),z:q(Math.sin(a)*radius),rotation:q(a+Math.PI/2+(random-0.5)*0.22),scale:q(0.91+random*0.16)});
      }
    }
    if(layer.accent){
      const r=Math.max(10,layer.radius-layer.width+7);
      for(let slot=0;slot<layer.accent.count;slot++){
        const a=slot/layer.accent.count*Math.PI*2+layer.offset;
        result.push({id:`${layer.id}:accent:${slot}`,layerId:layer.id,flower:layer.accent.flower,color:layer.accent.color,x:q(Math.cos(a)*r),y:q(elevation+layer.rise*.94+3),z:q(Math.sin(a)*r),rotation:q(a+Math.PI/2),scale:1.65,accent:true});
      }
    }
    elevation += layer.rise;
  }
  return result;
}
export function silhouetteWarnings(design: Design): string[] {
  const warnings: string[] = [];
  design.layers.forEach((layer,i) => {if(i>0 && layer.radius >= design.layers[i-1].radius) warnings.push(`Layer ${i+1} is as wide as or wider than the layer below. Reduce its radius for a tapered shape.`);});
  return warnings;
}
