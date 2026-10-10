"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import LogoMark from "../ui/LogoMark";
import dynamic from "next/dynamic";
import {Component,useCallback,useEffect,useState,type ReactNode} from "react";
import {webglAvailable} from "@/lib/three/support";
import type {GardenEntry} from "@/lib/garden/model";
import type {FestivalCommand} from "./FestivalScene";
import type {HexCell} from "@/lib/garden/spatial";
const Scene=dynamic(()=>import("./FestivalScene"),{ssr:false});
class Boundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.onFailure();}render(){return this.state.failed ? null : this.props.children;}}
export default function FestivalCanvas({entries,anchor=entries[0]?.slot||1,onNeighborhood,focus,mine=[],onFocus}:{entries:GardenEntry[];anchor?:number;onNeighborhood?:(cell:HexCell)=>void;focus?:{slot:number;id:number};mine?:GardenEntry[];onFocus?:(entry:GardenEntry)=>void}){
  const {tr,locale}=useLanguage();
 const [rotate,setRotate]=useState(false);
 const [supported,setSupported]=useState<boolean|null>(null),[ready,setReady]=useState(false),[light,setLight]=useState(false),[command,setCommand]=useState<FestivalCommand>({id:0,type:"home"});
 useEffect(()=>{setSupported(webglAvailable(()=>document.createElement("canvas")));setLight(window.innerWidth<650);},[]);
 const failed=useCallback(()=>setSupported(false),[]),loaded=useCallback(()=>setReady(true),[]);
 useEffect(()=>{if(focus)setCommand(c=>({id:c.id+1,type:"jump",slot:focus.slot}));},[focus]);
 function action(type:FestivalCommand["type"]){setCommand(c=>({id:c.id+1,type}));}
 return <section className="festival-section garden-plain" aria-label={tr("Bathukamma garden")}>
  <div className="festival-stage" tabIndex={0} aria-label={tr("Drag to pan. Scroll to zoom. Arrow keys move; Home resets.")}
   onKeyDown={e=>{if(e.target!==e.currentTarget)return;const map:Record<string,FestivalCommand["type"]>={ArrowUp:"forward",ArrowDown:"back",ArrowLeft:"panLeft",ArrowRight:"panRight","+":"in","=":"in","-":"out",Home:"home"};const type=map[e.key];if(type){e.preventDefault();action(type);}}}>
   {supported&&<Boundary onFailure={failed}><Scene entries={entries} anchor={anchor} command={command} onReady={loaded} onFailure={failed} onNeighborhood={onNeighborhood} light={light} rotate={rotate} mineSlots={mine.map(entry=>entry.slot)}/></Boundary>}
   {supported!==false&&!ready&&<div className="festival-loading" role="status" aria-label={tr("Loading garden")}><LogoMark size={32}/></div>}
   {supported===false&&<div className="festival-loading" role="alert"><p>{tr("This garden needs 3D support.")}</p><span className="garden-preview-note">{tr("Try a browser with WebGL enabled.")}</span></div>}
   {!!mine.length&&<button className="primary-button garden-find-mine" disabled={supported!==true||!ready} onClick={()=>{setRotate(false);onFocus?.(mine[0]);}}>{tr("⌖ Find my Bathukamma")}</button>}
  </div>
  <div className="festival-toolbar"><div className="festival-camera" aria-label={tr("Garden camera controls")}><button className="icon-button" aria-label={tr("Zoom into garden")} disabled={supported!==true||!ready} onClick={()=>action("in")}>+</button><button className="icon-button" aria-label={tr("Zoom out of garden")} disabled={supported!==true||!ready} onClick={()=>action("out")}>−</button><button className="text-button" disabled={supported!==true||!ready} onClick={()=>action("home")}>{tr("Recenter")}</button><button className="text-button" aria-pressed={rotate} disabled={supported!==true||!ready} onClick={()=>setRotate(value=>!value)}>{rotate ? tr("Pan view") : tr("Rotate view")}</button><button className="text-button" disabled={supported!==true||!ready} onClick={()=>{setRotate(false);action("angle");}}>{tr("Reset angle")}</button></div><div className="festival-camera garden-pan-controls" aria-label={tr("Pan garden")}>{([{type:"panLeft",label:tr("Pan left"),icon:"←"},{type:"forward",label:tr("Pan forward"),icon:"↑"},{type:"back",label:tr("Pan backward"),icon:"↓"},{type:"panRight",label:tr("Pan right"),icon:"→"}] as const).map(control=><button key={control.type} className="icon-button" aria-label={tr(control.label)} disabled={supported!==true||!ready} onClick={()=>action(control.type)}>{control.icon}</button>)}</div><span className="garden-zoom-hint">{rotate ? tr("Drag to rotate · Pinch or scroll to zoom") : tr("Drag to pan · Zoom for flowers & nicknames")}</span></div>
 </section>;
}
