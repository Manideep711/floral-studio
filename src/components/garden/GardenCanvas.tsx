"use client";
import LogoMark from "../ui/LogoMark";
import {memo,useEffect,useMemo,useRef,useState} from "react";
import {gardenThumbnail} from "@/lib/garden/thumbnail";
import {gardenPosition,visibleAt,zoomAt,type GardenEntry,type Viewport} from "@/lib/garden/model";
import {irregularPosition,worldHex,type HexCell} from "@/lib/garden/spatial";
const Tile=memo(function Tile({entry,onOpen}:{entry:GardenEntry;onOpen:(e:GardenEntry)=>void}){
  const p=gardenPosition(entry.slot);
  const thumbnail=useMemo(()=>gardenThumbnail(entry.design),[entry.design]);
  return <button className="garden-tile" aria-label={`Open ${entry.title}`} style={{left:p.x,top:p.y}} onClick={()=>onOpen(entry)}><div className="garden-flower"><img src={thumbnail} alt="" width={200} height={200} draggable={false}/></div></button>;
});
export default function GardenCanvas({entries,onOpen,anchor=entries[0]?.slot,onNeighborhood}:{entries:GardenEntry[];onOpen:(e:GardenEntry)=>void;anchor?:number;onNeighborhood?:(cell:HexCell)=>void}){
  const surface=useRef<HTMLDivElement>(null),pointers=useRef(new Map<number,{x:number;y:number}>());
  const moved=useRef(false),start=useRef({x:0,y:0});
  const [view,setView]=useState<Viewport>({x:0,y:0,zoom:.85}),[size,setSize]=useState({width:1000,height:700});
  useEffect(()=>{const origin=irregularPosition(1);onNeighborhood?.(worldHex(-view.x/view.zoom/54+origin.x,-view.y/view.zoom/54+origin.z));},[view,onNeighborhood]);
  function recenter(){const p=gardenPosition(anchor||1);setView({x:-p.x*.85,y:-p.y*.85,zoom:.85});}
  useEffect(()=>{const p=gardenPosition(anchor||1);setView({x:-p.x*.85,y:-p.y*.85,zoom:.85});},[anchor]);
  useEffect(()=>{const el=surface.current!;const observer=new ResizeObserver(([e])=>setSize({width:e.contentRect.width,height:e.contentRect.height}));observer.observe(el);
    const wheel=(e:WheelEvent)=>{e.preventDefault();const r=el.getBoundingClientRect();setView(v=>zoomAt(v,Math.exp(-e.deltaY*.0015),e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2));};el.addEventListener("wheel",wheel,{passive:false});
    return ()=>{observer.disconnect();el.removeEventListener("wheel",wheel);};},[]);
  return <div className="garden-canvas" ref={surface} role="region" aria-label="Community garden canvas. Arrow keys pan, plus and minus zoom, Home recenters." tabIndex={0}
    onKeyDown={e=>{if(e.target!==e.currentTarget)return;const keys=["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","Home"];if(!keys.includes(e.key))return;e.preventDefault();if(e.key==="Home"){recenter();return;}setView(v=>e.key==="+"||e.key==="=" ? zoomAt(v,1.2,0,0) : e.key==="-" ? zoomAt(v,1/1.2,0,0) : {...v,x:v.x+(e.key==="ArrowLeft" ? 80 : e.key==="ArrowRight" ? -80 : 0),y:v.y+(e.key==="ArrowUp" ? 80 : e.key==="ArrowDown" ? -80 : 0)});}}
    onPointerDown={e=>{moved.current=false;if(e.button!==0||(e.target as HTMLElement).closest(".garden-map-controls"))return;start.current={x:e.clientX,y:e.clientY};pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});}}
    onPointerMove={e=>{const before=pointers.current.get(e.pointerId);if(!before)return;const next={x:e.clientX,y:e.clientY};if(Math.hypot(next.x-start.current.x,next.y-start.current.y)>5){moved.current=true;e.currentTarget.setPointerCapture(e.pointerId);}
      const others=[...pointers.current.entries()].filter(([id])=>id!==e.pointerId);pointers.current.set(e.pointerId,next);
      if(others.length){moved.current=true;const other=others[0][1],oldDistance=Math.hypot(before.x-other.x,before.y-other.y),newDistance=Math.hypot(next.x-other.x,next.y-other.y);const r=e.currentTarget.getBoundingClientRect();setView(v=>{const panned={...v,x:v.x+(next.x-before.x)/2,y:v.y+(next.y-before.y)/2};return oldDistance>1 ? zoomAt(panned,newDistance/oldDistance,(next.x+other.x)/2-r.left-r.width/2,(next.y+other.y)/2-r.top-r.height/2) : panned;});}
      else if(moved.current)setView(v=>({...v,x:v.x+next.x-before.x,y:v.y+next.y-before.y}));}}
    onPointerUp={e=>{pointers.current.delete(e.pointerId);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
    onPointerCancel={e=>pointers.current.delete(e.pointerId)} onClickCapture={e=>{if(moved.current){e.preventDefault();e.stopPropagation();moved.current=false;}}}
    style={{backgroundPosition:`${size.width/2+view.x}px ${size.height/2+view.y}px`,backgroundSize:`${28*view.zoom}px ${28*view.zoom}px`}}>
    <div className="garden-world" style={{transform:`translate(${size.width/2+view.x}px,${size.height/2+view.y}px) scale(${view.zoom})`}}>
      {entries.filter(e=>visibleAt(e.slot,view,size.width,size.height)).map(e=><Tile key={e.id} entry={e} onOpen={onOpen}/>)}
    </div>
    {!entries.length&&<div className="garden-empty"><span><LogoMark size={32}/></span><h2>A garden waiting to bloom.</h2><p>Your creation could be the first flower here.</p></div>}
    <div className="garden-map-controls" aria-label="Garden controls"><button aria-label="Zoom out of garden" onClick={()=>setView(v=>zoomAt(v,1/1.2,0,0))}>−</button><output aria-label="Garden zoom">{Math.round(view.zoom*100)}%</output><button aria-label="Zoom into garden" onClick={()=>setView(v=>zoomAt(v,1.2,0,0))}>+</button><button onClick={recenter}>Recenter</button></div>
    <p className="garden-map-hint">Drag to wander · scroll or pinch to zoom</p>
  </div>;
}
