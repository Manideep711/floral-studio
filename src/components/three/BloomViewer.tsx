"use client";
import dynamic from "next/dynamic";
import {Component,useCallback,useEffect,useState,type ReactNode} from "react";
import ArrangementCanvas from "../studio/ArrangementCanvas";
import Icon from "../ui/Icon";
import LogoMark from "../ui/LogoMark";
import type {Design} from "@/lib/design/schema";
import type {SceneCommand,SceneMetrics} from "./BathukammaScene";
import GardenInvite from "../garden/GardenInvite";
import ShareCard,{type BloomCapture} from "../share/ShareCard";
const Scene=dynamic(()=>import("./BathukammaScene"),{ssr:false,loading:()=>null});
class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed ? null : this.props.children;}
}
export default function BloomViewer({design,onBack,gardenEntry=false}:{design:Design;onBack:()=>void;gardenEntry?:boolean}) {
  const [supported,setSupported]=useState<boolean|null>(null);
  const [illustrated,setIllustrated]=useState(false);
  const [reduced,setReduced]=useState(false);
  const [phase,setPhase]=useState("Preparing your flowers");
  const [ready,setReady]=useState(false);
  const [lowQuality,setLowQuality]=useState(false);
  const [metrics,setMetrics]=useState<SceneMetrics|null>(null);
  const [capture,setCapture]=useState<BloomCapture|null>(null);
  const captureReady=useCallback((fn:BloomCapture|null)=>setCapture(()=>fn),[]);
  const [command,setCommand]=useState<SceneCommand>({type:"replay",id:0});
  useEffect(()=>{
    const media=matchMedia("(prefers-reduced-motion: reduce)");setReduced(media.matches);
    setLowQuality(window.innerWidth<650);
    const changed=()=>{setReduced(media.matches);if(media.matches)setCommand(c=>({type:"skip",id:c.id+1}));};media.addEventListener("change",changed);
    // Let the actual renderer determine support. A disposable probe creates
    // another GPU context and can disagree with renderer initialization.
    setSupported(true);
    return ()=>media.removeEventListener("change",changed);
  },[]);
  const failed=useCallback(()=>{setSupported(false);setReady(false);},[]);
  const loaded=useCallback(()=>setReady(true),[]);
  const measured=useCallback((m:SceneMetrics)=>{setMetrics(m);if(m.revealFps>0 && m.revealFps<28)setLowQuality(true);},[]);
  const action=(type:SceneCommand["type"])=>{if(type==="replay")setPhase(reduced ? "Exploration" : "Anticipation");setCommand(c=>({type,id:c.id+1}));};
  const fallback=illustrated||supported===false;
  const exploring=phase==="Exploration";
  return <main className="bloom-viewer" id={gardenEntry ? undefined : "main-content"} tabIndex={-1}>
    <div className="bloom-header"><button className="text-button" onClick={onBack}><span className="back-arrow" aria-hidden="true">←</span> {gardenEntry ? "Back to garden" : "Back to arranging"}</button><span className="eyebrow">Your arrangement / 3D</span>{!gardenEntry&&<div className="bloom-view-toggle"><button className="text-button" onClick={()=>{if(supported===false){setSupported(true);setLowQuality(true);setIllustrated(false);}else setIllustrated(v=>!v);setReady(false);setPhase("Preparing your flowers");setCommand(c=>({type:"replay",id:c.id+1}));}}>{supported===false ? "Retry 3D" : fallback ? "Explore in 3D" : "Illustrated view"}</button></div>}</div>
    <div className="bloom-title"><p className="eyebrow">{gardenEntry ? "FROM THE COMMUNITY GARDEN" : "Your finished arrangement"}</p><h1>{gardenEntry ? design.personalization.title : "Your Bathukamma"}</h1><p>{gardenEntry ? "Explore the flowers in this shared arrangement." : fallback ? "Your arrangement, beautifully preserved." : "Explore the shape and detail of your flowers."}</p></div>
    <section className="bloom-stage" aria-label="Bathukamma 3D viewer" data-flower-count={metrics?.flowers} data-draw-calls={metrics?.drawCalls} data-triangles={metrics?.triangles} data-reveal-fps={metrics?.revealFps}>
      {!fallback && supported && <SceneBoundary onFailure={failed}><Scene design={design} reducedMotion={reduced} command={command} onPhase={setPhase} onReady={loaded} onFailure={failed} onMetrics={measured} onCapture={captureReady} lowQuality={lowQuality}/></SceneBoundary>}
      {(fallback || !ready) && <div className={`bloom-illustration ${!fallback ? "loading" : ""}`}>{gardenEntry ? <><LogoMark size={40}/><p>{supported===false ? "This view needs 3D support." : "Preparing the flowers…"}</p></> : <><ArrangementCanvas design={design} selected="" onSelect={()=>{}} profile={fallback} decorative/>{!fallback && <p>Preparing your flower sculpture…</p>}</>}</div>}
      {!fallback && ready && <div className="reveal-status" role="status" aria-live="polite"><span className="status-dot"/>{exploring ? "Your Bathukamma is ready" : `${phase} · watch your flowers bloom`}</div>}
      {!fallback && ready && !reduced && phase==="Anticipation" && <div className="reveal-highlight" aria-hidden="true"/>}
      {!fallback && ready && !exploring && <button className="skip-reveal secondary-button" onClick={()=>action("skip")}>Skip reveal <Icon name="arrow" size={15}/></button>}
      {!fallback && ready && exploring && <div className="orbit-hint">Drag to turn · scroll or pinch to zoom</div>}
    </section>
    {fallback ? gardenEntry ? <p className="fallback-message" role="status">3D is unavailable in this browser.</p> : <div className="fallback-message" role="status"><Icon name="leaf"/>{supported===false ? "3D isn’t available here. Your design is safe, and you can keep arranging in 2D." : "Illustrated view. Return to 3D to explore your arrangement."}</div> : <div className="viewer-controls"><div className="camera-controls" role="group" aria-label="Camera controls"><button className="icon-button" aria-label="Rotate left" disabled={!exploring} onClick={()=>action("left")}>↶</button><button className="icon-button" aria-label="Rotate right" disabled={!exploring} onClick={()=>action("right")}>↷</button><span className="toolbar-divider"/><button className="icon-button" aria-label="Zoom in" disabled={!exploring} onClick={()=>action("in")}>+</button><button className="icon-button" aria-label="Zoom out" disabled={!exploring} onClick={()=>action("out")}>−</button><button className="text-button" disabled={!exploring} onClick={()=>action("reset")}>Reset camera</button></div><div className="replay-controls"><label><input type="checkbox" checked={reduced} onChange={e=>{setReduced(e.target.checked);if(e.target.checked)action("skip");}}/> Reduce motion</label><label><input type="checkbox" checked={lowQuality} onChange={e=>setLowQuality(e.target.checked)}/> Lighter rendering</label><button className="secondary-button" disabled={!ready} onClick={()=>action("replay")}><Icon name="reset" size={16}/>{reduced ? "Show finished view" : "Replay the bloom"}</button></div></div>}
    <div className="bloom-share"><div><p className="eyebrow">FLOWERS YOU CAN SEND</p><h2>A little festival in a card.</h2><p>Add a message, download an image, or share from your phone.</p></div><ShareCard design={design} capture={fallback ? null : capture} canCapture={fallback||ready&&exploring} label={gardenEntry ? "Share this Bathukamma" : "Share my Bathukamma"}/></div>
    {!gardenEntry&&<GardenInvite design={design}/>}
    <div className="bloom-footer"><p><span lang="te">బతుకమ్మ</span> A floral celebration of Telangana.</p><span>{design.layers.length} layers · original flower choices{reduced ? " · reduced motion" : ""}</span></div>
  </main>;
}
