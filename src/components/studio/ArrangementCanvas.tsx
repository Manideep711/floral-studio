"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import {useEffect,useMemo,useRef,useState} from "react";
import markup from "@/lib/garden/flower-markup.json";
import {generateLayout} from "@/lib/design/layout";
import {flowerAppearance} from "@/lib/flowers/appearance";
import type {Design} from "@/lib/design/schema";
import ArrangementSvg from "./ArrangementSvg";
import LayerSelection from "./LayerSelection";

// Rasterize each original flower once. Slider frames only transform and stamp
// these small bitmaps, rather than repainting every petal in an SVG <use> tree.
const sprites=new Map<string,Promise<HTMLCanvasElement>>();
function sprite(key:string) {
  let pending=sprites.get(key);
  if(!pending) {
    pending=new Promise<HTMLCanvasElement>((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>{
        const canvas=document.createElement("canvas");canvas.width=canvas.height=144;
        const context=canvas.getContext("2d");
        if(!context){reject(new Error("Canvas unavailable"));return;}
        context.drawImage(image,0,0,144,144);resolve(canvas);
      };
      image.onerror=()=>reject(new Error("Flower artwork unavailable"));
      const art=(markup as Record<string,string>)[key];
      if(!art){reject(new Error("Unknown flower"));return;}
      image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="-24 -24 48 48">${art}</svg>`)}`;
    });
    sprites.set(key,pending);
  }
  return pending;
}
export default function ArrangementCanvas({design,selected,onSelect,profile=false,decorative=false}: {design:Design;selected:string;onSelect:(id:string)=>void;profile?:boolean;decorative?:boolean}) {
  const {tr,locale}=useLanguage();
  const ref=useRef<HTMLCanvasElement>(null);
  const layerCache=useRef(new Map<string,{key:string;canvas:HTMLCanvasElement}>());
  const [width,setWidth]=useState(420);
  const [fallback,setFallback]=useState(false);
  const placements=useMemo(()=>generateLayout(design),[design]);
  const fit=profile ? Math.min(1,165/design.layers.reduce((sum,l)=>sum+l.rise,0)) : 1;
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const observer=new ResizeObserver(entries=>setWidth(Math.round(entries[0].contentRect.width)));
    observer.observe(canvas);return ()=>observer.disconnect();
  },[fallback]);
  useEffect(()=>{
    let cancelled=false,frame=0;
    const keys=[...new Set(placements.map(p=>`${p.flower}:${p.color}`))];
    void Promise.all(keys.map(async key=>[key,await sprite(key)] as const)).then(entries=>{
      if(cancelled)return;
      frame=requestAnimationFrame(()=>{
        const canvas=ref.current,context=canvas?.getContext("2d");
        if(!canvas||!context){setFallback(true);return;}
        const started=performance.now();
        const images=new Map(entries),height=profile ? 280 : 420;
        const pixels=Math.min(960,Math.max(64,width*Math.min(2,window.devicePixelRatio||1)));
        const nextWidth=Math.round(pixels),nextHeight=Math.round(pixels*height/420);
        if(canvas.width!==nextWidth)canvas.width=nextWidth;
        if(canvas.height!==nextHeight)canvas.height=nextHeight;
        context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,canvas.width,canvas.height);
        context.setTransform(canvas.width/420,0,0,canvas.height/height,canvas.width/2,canvas.height*(profile ? 185/280 : .5));
        context.scale(fit,fit);
        const plate=context.createRadialGradient(0,0,0,0,0,188);
        plate.addColorStop(0,"#E7C782");plate.addColorStop(.96,"#F0D594");plate.addColorStop(1,"#B38D4A");
        context.fillStyle=plate;context.beginPath();
        if(profile)context.ellipse(0,29,181,18,0,0,Math.PI*2);else context.arc(0,0,188,0,Math.PI*2);
        context.fill();
        if(!profile){context.fillStyle="#405136";context.beginPath();context.arc(0,0,Math.max(...design.layers.map(l=>l.radius))-4,0,Math.PI*2);context.fill();}
        let below=0;
        let painted=0;
        const alive=new Set(design.layers.map(l=>l.id));
        for(const id of layerCache.current.keys())if(!alive.has(id))layerCache.current.delete(id);
        for(const layer of design.layers){
          const y=20-below;
          const key=JSON.stringify([layer,design.seed,design.layoutVersion,profile,profile ? y : 0,fit,canvas.width,canvas.height]);
          let cached=layerCache.current.get(layer.id);
          if(cached?.key!==key){
          const bitmap=document.createElement("canvas");bitmap.width=canvas.width;bitmap.height=canvas.height;
          const brush=bitmap.getContext("2d");if(!brush){setFallback(true);return;}
          brush.setTransform(canvas.width/420,0,0,canvas.height/height,canvas.width/2,canvas.height*(profile ? 185/280 : .5));brush.scale(fit,fit);
          if(profile){brush.fillStyle="#405136";brush.beginPath();brush.moveTo(-layer.radius,y);brush.quadraticCurveTo(0,y+15,layer.radius,y);brush.lineTo(layer.radius,y-layer.rise);brush.quadraticCurveTo(0,y-layer.rise-9,-layer.radius,y-layer.rise);brush.closePath();brush.fill();}
          const heads=placements.filter(p=>p.layerId===layer.id && (!profile||p.z>=-5));
          if(profile)heads.sort((a,b)=>a.z-b.z);
          for(const p of heads){
            brush.save();
            brush.translate(p.x,profile ? y-layer.rise*(p.accent ? .94 : .45)+p.z*.09 : p.z);
            // Keep projection identical to the vector/3D placement contract.
            if(profile){brush.scale(p.scale*flowerAppearance[p.flower].svgScale*.9,p.scale*flowerAppearance[p.flower].svgScale*.9);brush.rotate(((p.rotation*180/Math.PI)%55-25)*Math.PI/180);}
            else{brush.rotate(p.rotation);brush.scale(p.scale*flowerAppearance[p.flower].svgScale,p.scale*flowerAppearance[p.flower].svgScale);}
            brush.drawImage(images.get(`${p.flower}:${p.color}`)!,-24,-24,48,48);brush.restore();
          }
          cached={key,canvas:bitmap};layerCache.current.set(layer.id,cached);painted++;
          }
          context.save();context.setTransform(1,0,0,1,0,0);context.drawImage(cached.canvas,0,0);context.restore();
          below+=layer.rise;
        }
        if(!profile){context.fillStyle="#F7DB7B";context.beginPath();context.arc(0,0,5,0,Math.PI*2);context.fill();}
        canvas.dataset.drawMs=(performance.now()-started).toFixed(2);
        canvas.dataset.flowerCount=String(placements.length);
        canvas.dataset.paintedLayers=String(painted);
      });
    }).catch(()=>{if(!cancelled)setFallback(true);});
    return ()=>{cancelled=true;cancelAnimationFrame(frame);};
  },[design,placements,profile,width]);
  if(fallback)return <ArrangementSvg design={design} selected={selected} onSelect={onSelect} profile={profile} decorative={decorative}/>;
  let below=0;
  return <div className={`arrangement-canvas ${profile ? "profile" : ""}`}>
    <canvas ref={ref} role="img" aria-label={`${tr(`${design.layers.length} layers`)} · ${tr(`${placements.length} flowers`)} · ${profile ? tr("Side profile") : tr("Top view")}`}/>
    {!decorative&&<svg viewBox={profile ? "-210 -185 420 280" : "-210 -210 420 420"} aria-hidden="true">
      <g transform={`scale(${fit})`}>
      {design.layers.map(l=>{
        const y=20-below;below+=l.rise;
        const outer=l.radius,inner=Math.max(0,l.radius-l.width);
        const circle=(r:number)=>`M${r} 0 A${r} ${r} 0 1 0 ${-r} 0 A${r} ${r} 0 1 0 ${r} 0Z`;
        return <g key={l.id}>
          <path d={profile ? `M${-outer} ${y+8}h${outer*2}v${-l.rise-16}h${-outer*2}Z` : circle(outer)+(inner ? circle(inner) : "")} fill="transparent" fillRule="evenodd" className="selectable-layer" onClick={()=>onSelect(l.id)}/>
        </g>;
      })}
      {design.layers.map((l,i)=>selected===l.id ? <LayerSelection key={l.id} radius={l.radius} width={l.width} rise={l.rise} y={20-design.layers.slice(0,i).reduce((sum,layer)=>sum+layer.rise,0)} index={i} profile={profile}/> : null)}
      </g>
    </svg>}
  </div>;
}
