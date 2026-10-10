"use client";
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
 const [rotate,setRotate]=useState(false);
 const [supported,setSupported]=useState<boolean|null>(null),[ready,setReady]=useState(false),[light,setLight]=useState(false),[command,setCommand]=useState<FestivalCommand>({id:0,type:"home"});
 useEffect(()=>{setSupported(webglAvailable(()=>document.createElement("canvas")));setLight(window.innerWidth<650);},[]);
 const failed=useCallback(()=>setSupported(false),[]),loaded=useCallback(()=>setReady(true),[]);
 useEffect(()=>{if(focus)setCommand(c=>({id:c.id+1,type:"jump",slot:focus.slot}));},[focus]);
 function action(type:FestivalCommand["type"]){setCommand(c=>({id:c.id+1,type}));}
 return <section className="festival-section garden-plain" aria-label="Bathukamma garden">
  <div className="festival-stage" tabIndex={0} aria-label="Bathukammas on a plain surface. Drag to pan; scroll or pinch to zoom. Choose Rotate view to change the angle. Arrow keys move; plus and minus zoom; Home resets."
   onKeyDown={e=>{if(e.target!==e.currentTarget)return;const map:Record<string,FestivalCommand["type"]>={ArrowUp:"forward",ArrowDown:"back",ArrowLeft:"panLeft",ArrowRight:"panRight","+":"in","=":"in","-":"out",Home:"home"};const type=map[e.key];if(type){e.preventDefault();action(type);}}}>
   {supported&&<Boundary onFailure={failed}><Scene entries={entries} anchor={anchor} command={command} onReady={loaded} onFailure={failed} onNeighborhood={onNeighborhood} light={light} rotate={rotate} mineSlots={mine.map(entry=>entry.slot)}/></Boundary>}
   {supported!==false&&!ready&&<div className="festival-loading" role="status" aria-label="Loading garden"><LogoMark size={32}/></div>}
   {supported===false&&<div className="festival-loading" role="alert"><p>This garden needs 3D support.</p><span className="garden-preview-note">Try a browser with WebGL enabled.</span></div>}
   {!!mine.length&&<button className="primary-button garden-find-mine" disabled={supported!==true||!ready} onClick={()=>{setRotate(false);onFocus?.(mine[0]);}}>⌖ Find my Bathukamma</button>}
  </div>
  <div className="festival-toolbar"><div className="festival-camera" aria-label="Garden camera controls"><button className="icon-button" aria-label="Zoom into garden" disabled={supported!==true||!ready} onClick={()=>action("in")}>+</button><button className="icon-button" aria-label="Zoom out of garden" disabled={supported!==true||!ready} onClick={()=>action("out")}>−</button><button className="text-button" disabled={supported!==true||!ready} onClick={()=>action("home")}>Recenter</button><button className="text-button" aria-pressed={rotate} disabled={supported!==true||!ready} onClick={()=>setRotate(value=>!value)}>{rotate ? "Pan view" : "Rotate view"}</button><button className="text-button" disabled={supported!==true||!ready} onClick={()=>{setRotate(false);action("angle");}}>Reset angle</button></div><div className="festival-camera garden-pan-controls" aria-label="Pan garden">{([{type:"panLeft",label:"Pan left",icon:"←"},{type:"forward",label:"Pan forward",icon:"↑"},{type:"back",label:"Pan backward",icon:"↓"},{type:"panRight",label:"Pan right",icon:"→"}] as const).map(control=><button key={control.type} className="icon-button" aria-label={control.label} disabled={supported!==true||!ready} onClick={()=>action(control.type)}>{control.icon}</button>)}</div><span className="garden-zoom-hint">{rotate ? "Drag to rotate · Pinch or scroll to zoom" : "Drag to pan · Zoom for flowers & nicknames"}</span></div>
 </section>;
}
