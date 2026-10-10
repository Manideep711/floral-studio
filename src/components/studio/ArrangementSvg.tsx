"use client";
import {useId,useMemo} from "react";
import {FlowerShape} from "../flowers/FlowerArt";
import {generateLayout} from "@/lib/design/layout";
import type {Design} from "@/lib/design/schema";
import {flowerAppearance} from "@/lib/flowers/appearance";
import LayerSelection from "./LayerSelection";
export default function ArrangementSvg({design,selected,onSelect,profile=false,decorative=false}: {design:Design;selected?:string;onSelect?:(id:string)=>void;profile?:boolean;decorative?:boolean}) {
  const uid=useId().replaceAll(":","");
  const placements=useMemo(()=>generateLayout(design),[design]);
  const totalRise=design.layers.reduce((a,l)=>a+l.rise,0);
  return <svg className="arrangement-svg" viewBox={profile ? "-210 -185 420 280" : "-210 -210 420 420"} role={decorative ? "presentation" : "img"} aria-label={decorative ? undefined : `${design.layers.length}-layer Bathukamma, ${placements.length} flower heads. ${profile ? "Side profile" : "Top view"}.`}>
    <defs>
      <radialGradient id={`${uid}plate`}><stop stopColor="#E7C782"/><stop offset=".84" stopColor="#D4AE63"/><stop offset=".96" stopColor="#F0D594"/><stop offset="1" stopColor="#B38D4A"/></radialGradient>
      <filter id={`${uid}shadow`} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#59452C" floodOpacity=".17"/></filter>
      {design.layers.map(l=><symbol key={l.id} id={`${uid}${l.id}`} overflow="visible"><FlowerShape kind={l.flower} color={l.color}/></symbol>)}
      {design.layers.filter(l=>l.accent).map(l=><symbol key={`${l.id}accent`} id={`${uid}${l.id}accent`} overflow="visible"><FlowerShape kind={l.accent!.flower} color={l.accent!.color}/></symbol>)}
    </defs>
    {profile ? <g transform={`scale(${Math.min(1,165/totalRise)})`}>
      <ellipse cy="43" rx="185" ry="22" fill="#6E5439" opacity=".08"/>
      <ellipse cy="29" rx="181" ry="18" fill={`url(#${uid}plate)`}/>
      {design.layers.map((l,i)=>{
        const below=design.layers.slice(0,i).reduce((s,layer)=>s+layer.rise,0);
        const y=20-below;
        const ps=placements.filter(p=>p.layerId===l.id && p.z>=-5).sort((a,b)=>a.z-b.z);
        return <g key={l.id} onClick={()=>onSelect?.(l.id)} className={onSelect ? "selectable-layer" : undefined}>
          <path d={`M${-l.radius} ${y} Q0 ${y+15} ${l.radius} ${y} L${l.radius} ${y-l.rise} Q0 ${y-l.rise-9} ${-l.radius} ${y-l.rise}Z`} fill="#405136"/>
          {ps.map(p=><use key={p.id} href={`#${uid}${l.id}${p.accent ? "accent" : ""}`} transform={`translate(${p.x} ${y-l.rise*(p.accent ? .94 : .45)+p.z*.09}) scale(${(flowerAppearance[p.flower].svgScale*.9*p.scale).toFixed(4)}) rotate(${((p.rotation*180/Math.PI)%55-25).toFixed(4)})`}/>)}
        </g>;
      })}
      {!decorative&&design.layers.map((l,i)=>selected===l.id ? <LayerSelection key={l.id} radius={l.radius} width={l.width} rise={l.rise} y={20-design.layers.slice(0,i).reduce((sum,layer)=>sum+layer.rise,0)} index={i} profile/> : null)}
      <text x="0" y={-totalRise-5} textAnchor="middle" className="svg-label">A preview of your proportions</text>
    </g> : <g filter={`url(#${uid}shadow)`}>
      <circle r="188" fill={`url(#${uid}plate)`}/>
      <circle r="181" fill="none" stroke="#AF8A46" strokeWidth=".7"/>
      {Array.from({length:64},(_,i)=><path key={i} d="M0 -183l1 -3 1 3" transform={`rotate(${i/64*360})`} stroke="#92723E" opacity=".6" fill="none" strokeWidth=".7"/>)}
      <circle r={Math.max(...design.layers.map(l=>l.radius))-4} fill="#405136"/>
      {design.layers.map((l,i)=><g key={l.id}>
        <path d={ringPath(l.radius,Math.max(0,l.radius-l.width))} fill={l.color} opacity=".2"/>
        {placements.filter(p=>p.layerId===l.id).map(p=><use key={p.id} href={`#${uid}${l.id}${p.accent ? "accent" : ""}`} transform={`translate(${p.x} ${p.z}) rotate(${(p.rotation*180/Math.PI).toFixed(4)}) scale(${(p.scale*flowerAppearance[p.flower].svgScale).toFixed(4)})`}/>)}
        {onSelect && <path d={ringPath(l.radius, Math.max(0,l.radius-l.width))} fill="transparent" fillRule="evenodd" className="selectable-layer" onClick={()=>onSelect(l.id)} aria-hidden="true"><title>{`Select layer ${i+1}`}</title></path>}
      </g>)}
      <circle r="5" fill="#F7DB7B" stroke="#AD7A2C" strokeWidth=".6"/>
      {!decorative&&design.layers.map((l,i)=>selected===l.id ? <LayerSelection key={l.id} radius={l.radius} width={l.width} rise={l.rise} y={0} index={i}/> : null)}
    </g>}
  </svg>;
}
function ringPath(outer:number,inner:number) {
  const circle=(r:number)=>`M${r} 0 A${r} ${r} 0 1 0 ${-r} 0 A${r} ${r} 0 1 0 ${r} 0Z`;
  return circle(outer)+(inner>0 ? circle(inner) : "");
}
