"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import {AnimatePresence} from "motion/react";
import ViewerLoading from "../ui/ViewerLoading";
import dynamic from "next/dynamic";
import {Component,useCallback,useEffect,useState,type ReactNode} from "react";
import ArrangementCanvas from "../studio/ArrangementCanvas";
import LanguageToggle from "../ui/LanguageToggle";
import Icon from "../ui/Icon";
import LogoMark from "../ui/LogoMark";
import type {Design} from "@/lib/design/schema";
import type {SceneCommand,SceneMetrics,StageStyle} from "./BathukammaScene";
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
  const {tr,locale}=useLanguage();
  const [stage,setStage]=useState<StageStyle>("studio");
  const [supported,setSupported]=useState<boolean|null>(null);
  const [illustrated,setIllustrated]=useState(false);
  const [reduced,setReduced]=useState(false);
  const [phase,setPhase]=useState("Loading flowers");
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
    <AnimatePresence>{!fallback&&!ready&&<ViewerLoading key="loading"/>}</AnimatePresence>
    <div className="bloom-header"><button className="text-button" onClick={onBack}><span className="back-arrow" aria-hidden="true">←</span> {gardenEntry ? tr("Back to garden") : tr("Back to arranging")}</button><span className="eyebrow">{tr("Your arrangement / 3D")}</span>{!gardenEntry&&<div className="bloom-view-toggle"><button className="text-button" onClick={()=>{if(supported===false){setSupported(true);setLowQuality(true);setIllustrated(false);}else setIllustrated(v=>!v);setReady(false);setPhase("Loading flowers");setCommand(c=>({type:"replay",id:c.id+1}));}}>{supported===false ? tr("Retry 3D") : fallback ? tr("Explore in 3D") : tr("Illustrated view")}</button></div>}<LanguageToggle/></div>
    <div className="bloom-title"><p className="eyebrow">{gardenEntry ? "FROM THE COMMUNITY GARDEN" : tr("Finished")}</p><h1>{gardenEntry ? design.personalization.title : tr("Your Bathukamma")}</h1><p>{gardenEntry ? "Explore the flowers in this shared arrangement." : fallback ? tr("Your Bathukamma.") : tr("Drag to rotate. Scroll to zoom.")}</p></div>
    {!fallback&&<div className="lighting-options" role="group" aria-label="Lighting stage">{(["studio","daylight","evening"] as const).map(value=><button key={value} type="button" aria-pressed={stage===value} onClick={()=>setStage(value)}>{value==="studio"?"Studio":value==="daylight"?"Daylight":"Evening"}</button>)}</div>}
    <section data-lighting={stage} className="bloom-stage" aria-label={tr("Bathukamma 3D viewer")} data-flower-count={metrics?.flowers} data-draw-calls={metrics?.drawCalls} data-triangles={metrics?.triangles} data-reveal-fps={metrics?.revealFps}>
      {!fallback && supported && <SceneBoundary onFailure={failed}><Scene stage={stage} design={design} reducedMotion={reduced} command={command} onPhase={setPhase} onReady={loaded} onFailure={failed} onMetrics={measured} onCapture={captureReady} lowQuality={lowQuality}/></SceneBoundary>}
      {fallback && <div className={`bloom-illustration ${!fallback ? "loading" : ""}`}>{gardenEntry ? <><LogoMark size={40}/><p>{supported===false ? tr("This view needs 3D support.") : tr("Preparing the flowers…")}</p></> : <><ArrangementCanvas design={design} selected="" onSelect={()=>{}} profile={fallback} decorative/>{!fallback && <p>{tr("Preparing your flower sculpture…")}</p>}</>}</div>}
      {!fallback && ready && <div className="reveal-status" role="status" aria-live="polite"><span className="status-dot"/>{exploring ? tr("Your Bathukamma is ready") : tr(phase)}</div>}
      {!fallback && ready && !reduced && phase==="Anticipation" && <div className="reveal-highlight" aria-hidden="true"/>}
      {!fallback && ready && !exploring && <button className="skip-reveal secondary-button" onClick={()=>action("skip")}>{tr("Skip reveal")} <Icon name="arrow" size={15}/></button>}
      {!fallback && ready && exploring && <div className="orbit-hint">{tr("Drag to turn · scroll or pinch to zoom")}</div>}
    </section>
    {fallback ? gardenEntry ? <p className="fallback-message" role="status">{tr("3D is unavailable in this browser.")}</p> : <div className="fallback-message" role="status"><Icon name="leaf"/>{supported===false ? tr("3D isn’t available here. Your design is safe, and you can keep arranging in 2D.") : tr("Illustrated view. Return to 3D to explore your arrangement.")}</div> : <div className="viewer-controls"><div className="camera-controls" role="group" aria-label={tr("Camera controls")}><button className="icon-button" aria-label={tr("Rotate left")} disabled={!exploring} onClick={()=>action("left")}>↶</button><button className="icon-button" aria-label={tr("Rotate right")} disabled={!exploring} onClick={()=>action("right")}>↷</button><span className="toolbar-divider"/><button className="icon-button" aria-label={tr("Zoom in")} disabled={!exploring} onClick={()=>action("in")}>+</button><button className="icon-button" aria-label={tr("Zoom out")} disabled={!exploring} onClick={()=>action("out")}>−</button><button className="text-button" disabled={!exploring} onClick={()=>action("reset")}>{tr("Reset camera")}</button></div><div className="replay-controls"><label><input type="checkbox" checked={reduced} onChange={e=>{setReduced(e.target.checked);if(e.target.checked)action("skip");}}/> {tr("Reduce motion")}</label><label><input type="checkbox" checked={lowQuality} onChange={e=>setLowQuality(e.target.checked)}/> {tr("Lighter rendering")}</label><button className="secondary-button" disabled={!ready} onClick={()=>action("replay")}><Icon name="reset" size={16}/>{reduced ? tr("Show finished view") : tr("Replay the bloom")}</button></div></div>}
    <div className="bloom-share"><div><p className="eyebrow">{tr("Share")}</p><h2>{tr("Share your Bathukamma")}</h2><p>{tr("Download a card or share it.")}</p></div><ShareCard design={design} capture={fallback ? null : capture} canCapture={fallback||ready&&exploring} label={gardenEntry ? tr("Share this Bathukamma") : tr("Share my Bathukamma")}/></div>
    {!gardenEntry&&<GardenInvite design={design}/>}
    <div className="bloom-footer"><p><span lang="te">బతుకమ్మ</span> {tr("A floral celebration of Telangana.")}</p><span>{tr(`${design.layers.length} layers`)}</span></div>
  </main>;
}
