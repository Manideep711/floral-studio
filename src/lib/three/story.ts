import {guidedDesign} from "../design/guided";
import {generateLayout} from "../design/layout";
import {smooth} from "./reveal";
export function guidedFrames(){const complete=guidedDesign(),placements=generateLayout(complete);return Array.from({length:5},(_,step)=>{const design=step===0||step===4?complete:guidedDesign(step),ids=new Set(design.layers.map(l=>l.id));return {design,placements:placements.filter(p=>ids.has(p.layerId))};});}
export function storyLayerDepth(seconds:number,added:boolean,reduced:boolean){return added&&!reduced?smooth(seconds/.5):1;}
