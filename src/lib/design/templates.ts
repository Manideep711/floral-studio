import {defaultDesign} from "./defaults";
import type {Design,Layer} from "./schema";
import type {FlowerId} from "../flowers/catalog";
export const sizes={mini:{name:"Mini",layers:3,base:92},small:{name:"Small",layers:5,base:122},medium:{name:"Medium",layers:7,base:150},large:{name:"Large",layers:7,base:180}} as const;
type Size=keyof typeof sizes;
export const heights={short:{name:"Short",rise:16},medium:{name:"Medium",rise:24},tall:{name:"Tall",rise:32}} as const;
export type TemplateHeight=keyof typeof heights;
type Tone="Festival"|"Colourful"|"Soft"|"Ivory"|"Rose";
type Shape="Gopuram"|"Dome"|"Tall"|"Wide";
type Arrangement="Bands"|"Alternating"|"Accents";
const palettes:Record<Tone,Array<Pick<Layer,"flower"|"color">>>={
 Festival:[{flower:"tangedu",color:"#F2C643"},{flower:"gunugu",color:"#EEE4D7"},{flower:"banti",color:"#E98333"},{flower:"gunugu",color:"#DCA7BA"}],
 Colourful:[{flower:"tangedu",color:"#F2C643"},{flower:"gunugu",color:"#973E68"},{flower:"banti",color:"#E98333"},{flower:"rose",color:"#C64A64"},{flower:"gunugu",color:"#EEE4D7"}],
 Soft:[{flower:"tangedu",color:"#F8DC77"},{flower:"rose",color:"#EAA9B7"},{flower:"gunugu",color:"#EEE4D7"},{flower:"gunugu",color:"#DCA7BA"}],
 Ivory:[{flower:"tangedu",color:"#F8DC77"},{flower:"gunugu",color:"#EEE4D7"},{flower:"rose",color:"#F5EADC"}],
 Rose:[{flower:"tangedu",color:"#F2C643"},{flower:"rose",color:"#C64A64"},{flower:"rose",color:"#EAA9B7"},{flower:"rose",color:"#F5EADC"}]
};
const definitions=[
 ["mini","Mini","mini","Festival","Gopuram","Bands"],
 ["small","Small","small","Festival","Gopuram","Bands"],
 ["medium","Medium","medium","Festival","Gopuram","Bands"],
 ["big","Large","large","Festival","Wide","Bands"],
 ["colourful","Festival confetti","large","Colourful","Gopuram","Accents"],
 ["mini-sunrise","Little sunrise","mini","Festival","Dome","Alternating"],
 ["mini-rose","Rose miniature","mini","Rose","Dome","Bands"],
 ["mini-ivory","Ivory miniature","mini","Ivory","Gopuram","Bands"],
 ["mini-bright","Pocket festival","mini","Colourful","Tall","Accents"],
 ["small-soft","Soft celebration","small","Soft","Dome","Bands"],
 ["small-rose","Rose circles","small","Rose","Gopuram","Alternating"],
 ["small-ivory","Ivory and gold","small","Ivory","Tall","Bands"],
 ["small-bright","Colour parade","small","Colourful","Gopuram","Alternating"],
 ["small-accent","Petal garland","small","Festival","Wide","Accents"],
 ["medium-soft","Blush gopuram","medium","Soft","Gopuram","Bands"],
 ["medium-rose","Rose tower","medium","Rose","Tall","Alternating"],
 ["medium-ivory","Quiet ivory","medium","Ivory","Dome","Bands"],
 ["medium-bright","Seven bright bands","medium","Colourful","Gopuram","Bands"],
 ["medium-accent","Festival garlands","medium","Festival","Gopuram","Accents"],
 ["large-soft","Blush abundance","large","Soft","Wide","Bands"],
 ["large-rose","Rose celebration","large","Rose","Dome","Accents"],
 ["large-ivory","Ivory crown","large","Ivory","Tall","Alternating"],
 ["large-bright","Grand colour parade","large","Colourful","Wide","Alternating"],
 ["large-tower","Temple silhouette","large","Festival","Tall","Bands"]
] as const satisfies readonly (readonly [string,string,Size,Tone,Shape,Arrangement])[];
export type TemplateId=typeof definitions[number][0];
export const templates=definitions.map(([id,name,size,tone,shape,arrangement])=>({
 id,name,size,tone,shape:shape==="Tall" ? "Stepped" as const : shape,arrangement,layers:sizes[size].layers,
 flowers:[...new Set<FlowerId>([...palettes[tone].slice(0,sizes[size].layers).map(p=>p.flower),...(arrangement==="Accents" ? ["rose" as const] : [])])],
 description:`${sizes[size].layers} layers · ${sizes[size].name.toLowerCase()} · ${shape==="Tall" ? "stepped" : shape.toLowerCase()} · ${arrangement.toLowerCase()}`
}));
export function templateDesign(id:TemplateId,height?:TemplateHeight):Design {
 const template=templates.find(t=>t.id===id);if(!template)throw new Error("Unknown arrangement template");
 const design=defaultDesign(),{layers:count,base}=sizes[template.size],palette=palettes[template.tone],crown=22;
 const radii=Array.from({length:count},(_,i)=>Math.round(base-(base-crown)*Math.pow(i/(count-1),template.shape==="Dome" ? .85 : template.shape==="Wide" ? 1.25 : template.shape==="Stepped" ? 1.15 : 1)));
 design.layers=radii.map((radius,i)=>({id:`template-${id}-${i}`,...palette[i%palette.length],radius,
 width:i===count-1 ? crown : Math.min(50,radius-radii[i+1]),
 rise:height ? heights[height].rise : template.shape==="Stepped" ? 32 : template.shape==="Wide" ? 16 : template.shape==="Dome" ? 20 : 24,
 density:1.02,pattern:template.arrangement==="Alternating"&&i%2===0 ? "rings" : "staggered",offset:i*.12,
 ...(template.arrangement==="Accents"&&i%2===0&&i<count-1 ? {accent:{flower:"rose" as const,color:"#C64A64",count:Math.max(4,16-i*2)}} : {})}));
 return design;
}
