import markup from "./flower-markup.json";
import {generateLayout} from "../design/layout";
import {flowerAppearance} from "../flowers/appearance";
import type {Design} from "../design/schema";
// Isolated SVG images are rasterized/cached by the browser rather than repainting
// thousands of interactive SVG flower nodes whenever the canvas moves.
export function gardenThumbnail(design:Design,profile=false){
  const library:Record<string,string>=markup;
  const defs=design.layers.map((l,i)=>`<g id="layer${i}">${library[`${l.flower}:${l.color}`]||""}</g>${l.accent ? `<g id="layer${i}accent">${library[`${l.accent.flower}:${l.accent.color}`]||""}</g>` : ""}`).join("");
  const placements=generateLayout(design);
  const heads=design.layers.map((l,i)=>placements.filter(p=>p.layerId===l.id).map(p=>`<use href="#layer${i}${p.accent ? "accent" : ""}" transform="translate(${p.x} ${p.z}) rotate(${(p.rotation*180/Math.PI).toFixed(4)}) scale(${(p.scale*flowerAppearance[p.flower].svgScale).toFixed(4)})"/>`).join("")).join("");
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-210 -210 420 420" width="420" height="420"><defs><radialGradient id="plate"><stop stop-color="#E7C782"/><stop offset=".96" stop-color="#F0D594"/><stop offset="1" stop-color="#B38D4A"/></radialGradient>${defs}</defs><circle r="188" fill="url(#plate)"/><circle r="181" fill="none" stroke="#AF8A46"/><circle r="${Math.max(...design.layers.map(l=>l.radius))-4}" fill="#405136"/>${heads}<circle r="5" fill="#F7DB7B"/></svg>`;
  if(profile){
    let below=0;
    const fit=Math.min(1,165/design.layers.reduce((sum,l)=>sum+l.rise,0));
    const layers=design.layers.map((l,i)=>{
      const y=20-below;below+=l.rise;
      const heads=placements.filter(p=>p.layerId===l.id&&p.z>=-5).sort((a,b)=>a.z-b.z).map(p=>`<use href="#layer${i}${p.accent ? "accent" : ""}" transform="translate(${p.x} ${y-l.rise*(p.accent ? .94 : .45)+p.z*.09}) scale(${(flowerAppearance[p.flower].svgScale*.9*p.scale).toFixed(4)}) rotate(${((p.rotation*180/Math.PI)%55-25).toFixed(4)})"/>`).join("");
      return `<path d="M${-l.radius} ${y} Q0 ${y+15} ${l.radius} ${y} L${l.radius} ${y-l.rise} Q0 ${y-l.rise-9} ${-l.radius} ${y-l.rise}Z" fill="#405136"/>${heads}`;
    }).join("");
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-210 -185 420 280" width="420" height="280"><defs>${defs}</defs><g transform="scale(${fit})"><ellipse cy="29" rx="181" ry="18" fill="#E7C782"/>${layers}</g></svg>`)}`;
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
