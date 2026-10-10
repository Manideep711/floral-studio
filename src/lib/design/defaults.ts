import type { Design, Layer } from "./schema";
export function defaultDesign(): Design {
  return { schemaVersion: 1, layoutVersion: 2, flowerLibraryVersion: 1, seed: 2026, scene: "studio", personalization: {title:"My Bathukamma",dedication:"",language:"en"}, layers: [
    {id:"layer-base",flower:"tangedu",color:"#F2C643",radius:166,width:32,rise:23,density:0.92,pattern:"staggered",offset:0},
    {id:"layer-two",flower:"gunugu",color:"#EEE4D7",radius:134,width:32,rise:24,density:0.92,pattern:"staggered",offset:0.1},
    {id:"layer-three",flower:"banti",color:"#E98333",radius:102,width:32,rise:25,density:0.92,pattern:"staggered",offset:0.2},
    {id:"layer-four",flower:"gunugu",color:"#DCA7BA",radius:70,width:32,rise:23,density:0.92,pattern:"staggered",offset:0.3},
    {id:"layer-crown",flower:"banti",color:"#F3CE49",radius:38,width:38,rise:24,density:0.9,pattern:"rings",offset:0}
  ] };
}
export function resetLayer(layer: Layer): Layer {
  const original=defaultDesign().layers.find(l=>l.id===layer.id);
  if(original) return original;
  return {...layer,accent:undefined,color: layer.flower === "tangedu" ? "#F2C643" : layer.flower === "gunugu" ? "#EEE4D7" : layer.flower === "rose" ? "#C64A64" : "#E98333",width:Math.min(32,layer.radius),rise:24,density:0.92,pattern:"staggered",offset:0};
}
export function addLayer(design: Design, id: string): Layer {
  const previous = design.layers.at(-1)!;
  const radius=Math.max(8,Math.round(previous.radius*.68));
  return {id,flower:"tangedu",color:"#F2C643",radius,width:Math.min(28,radius),rise:20,density:0.9,pattern:"staggered",offset:0};
}
