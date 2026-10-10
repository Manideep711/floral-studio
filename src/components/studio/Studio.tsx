"use client";
import SiteHeader from "../ui/SiteHeader";
import {SelectionGroup,SelectionHighlight} from "../ui/selection-motion";
import SiteFooter from "../ui/SiteFooter";
import Button from "../ui/Button";
import {useEffect,useRef,useState} from "react";
import ArrangementCanvas from "./ArrangementCanvas";
import TemplatePicker from "./TemplatePicker";
import {templateDesign,templates,type sizes} from "@/lib/design/templates";
import LayerControls from "./LayerControls";
import FlowerArt from "../flowers/FlowerArt";
import Icon from "../ui/Icon";
import {Tooltip} from "../ui/tooltip";
import {defaultDesign,addLayer,resetLayer} from "@/lib/design/defaults";
import {initialHistory,commit,undo,redo,type History} from "@/lib/design/history";
import {DRAFT_KEY,parseDraft,saveDraft} from "@/lib/design/persistence";
import {GUIDED_KEY} from "@/lib/design/guided";
import {GARDEN_COPY_KEY} from "@/lib/garden/inspection";
import {placementCount,silhouetteWarnings} from "@/lib/design/layout";
import {LIMITS,type Design,type Layer} from "@/lib/design/schema";
import {flowerById} from "@/lib/flowers/catalog";
import dynamic from "next/dynamic";
const BloomViewer=dynamic(()=>import("../three/BloomViewer"),{ssr:false,loading:()=> <div className="viewer-loading" role="status">Opening your flower sculpture…</div>});

export default function Studio() {
  const [history,setHistory]=useState<History>(()=>initialHistory(defaultDesign()));
  const [live,setLive]=useState<Design|null>(null);
  const [selected,setSelected]=useState("layer-base");
  const [profile,setProfile]=useState(true);
  const [ready,setReady]=useState(false);
  const [saveEnabled,setSaveEnabled]=useState(true);
  const [saveState,setSaveState]=useState("Opening your studio…");
  const [notice,setNotice]=useState("");
  const [dialog,setDialog]=useState<"reset"|"about"|null>(null);
  const [draftError,setDraftError]=useState(false);
  const [blooming,setBlooming]=useState(false);
  const [templatesOpen,setTemplatesOpen]=useState(false);
  const [templateSize,setTemplateSize]=useState<keyof typeof sizes|"all">("all");
  const liveFrame=useRef<number|null>(null);
  const initialized=useRef(false);
  const fileInput=useRef<HTMLInputElement>(null);
  const backupMenu=useRef<HTMLDetailsElement>(null);
  const dragBase=useRef<Design|null>(null);
  const liveRef=useRef<Design|null>(null);
  const design=live || history.present;
  const index=Math.max(0,design.layers.findIndex(l=>l.id===selected));
  const layer=design.layers[index];
  const flowerCount=placementCount(design);
  const warnings=silhouetteWarnings(design);

  useEffect(()=>{
    if(initialized.current)return;initialized.current=true;
    try {
      const raw=localStorage.getItem(DRAFT_KEY);
      const restored=raw ? parseDraft(raw) : defaultDesign();
      let nextHistory=initialHistory(restored);
      if(new URLSearchParams(window.location.search).get("guided")==="1"){
        try{
          const pending=sessionStorage.getItem(GUIDED_KEY);
          if(pending){nextHistory=commit(nextHistory,parseDraft(pending));sessionStorage.removeItem(GUIDED_KEY);setNotice("Your guided arrangement is ready. Undo restores your previous draft.");}
        }catch{setNotice("Could not open the guided arrangement. Your saved draft is restored.");}
      }
      if(new URLSearchParams(window.location.search).get("garden-copy")==="1"){
        try{const copy=sessionStorage.getItem(GARDEN_COPY_KEY);if(copy){nextHistory=commit(nextHistory,parseDraft(copy));sessionStorage.removeItem(GARDEN_COPY_KEY);setNotice("Your published Bathukamma is open for editing. Undo restores your previous draft; the published snapshot stays unchanged.");}}
        catch{setNotice("The garden copy could not be opened. Your existing draft is restored.");}
      }
      setHistory(nextHistory);setSelected(nextHistory.present.layers[0].id);setSaveState(raw ? "Your draft is restored" : "Your studio is ready");
    } catch {setSaveEnabled(false);setDraftError(true);setSaveState("Draft could not be restored");}
    setReady(true);
  },[]);
  useEffect(()=>{
    if(!ready || !saveEnabled || live) return;
    const timer=setTimeout(()=>{try {saveDraft(history.present);setSaveState("Saved on this device");} catch {setSaveState("Could not save · download a backup");}},450);
    return ()=>clearTimeout(timer);
  },[history.present,ready,saveEnabled,live]);
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(document.querySelector("dialog[open]"))return;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z" && !(e.target instanceof HTMLElement && ["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))) {
        e.preventDefault();setHistory(h=>e.shiftKey ? redo(h) : undo(h));
      }
    };
    const outside=(e:PointerEvent)=>{if(backupMenu.current?.open&&e.target instanceof Node&&!backupMenu.current.contains(e.target))backupMenu.current.removeAttribute("open");};
    window.addEventListener("keydown",handler);window.addEventListener("pointerdown",outside);return ()=>{window.removeEventListener("keydown",handler);window.removeEventListener("pointerdown",outside);};
  },[]);
  useEffect(()=>()=>{if(liveFrame.current!==null)cancelAnimationFrame(liveFrame.current);},[]);
  const cancelLiveFrame=()=>{if(liveFrame.current!==null)cancelAnimationFrame(liveFrame.current);liveFrame.current=null;};
  const change=(next:Design)=>{cancelLiveFrame();setLive(null);liveRef.current=null;dragBase.current=null;setHistory(h=>commit(h,next));setSaveState(saveEnabled ? "Saving your draft…" : "Automatic saving paused");};
  const begin=()=>{if(!dragBase.current) dragBase.current=history.present;};
  const finish=()=>{
    cancelLiveFrame();
    if(liveRef.current) {const next=liveRef.current;setHistory(h=>commit(h,next));setSaveState(saveEnabled ? "Saving your draft…" : "Automatic saving paused");}
    setLive(null);liveRef.current=null;dragBase.current=null;
  };
  const openTemplates=(size:keyof typeof sizes|"all"="all")=>{finish();setTemplateSize(size);setTemplatesOpen(true);};
  const update=(patch:Partial<Layer>,isLive=false)=>{
    const source=liveRef.current || history.present;
    const next={...source,layers:source.layers.map(l=>l.id===layer.id ? {...l,...patch,width:Math.min(patch.width??l.width,patch.radius??l.radius)} : l)};
    if(isLive) {liveRef.current=next;if(liveFrame.current===null)liveFrame.current=requestAnimationFrame(()=>{liveFrame.current=null;setLive(liveRef.current);});} else change(next);
  };
  const move=(direction:number)=>{
    const layers=[...design.layers];const target=index+direction;
    [layers[index],layers[target]]=[layers[target],layers[index]];
    change({...design,layers});setNotice("Layer order updated. Check the side profile for your new silhouette.");
  };
  const backup=()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(design,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="my-bathukamma.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice("Your design backup has been downloaded.");
  };
  const importFile=async(file?:File)=>{
    if(!file) return;
    try {if(file.size>100_000) throw new Error("File too large");const imported=parseDraft(await file.text());change(imported);setSelected(imported.layers[0].id);setNotice("Your design backup is restored.");} catch {setNotice("That file could not be restored. Choose a valid Bathukamma JSON backup.");}
    if(fileInput.current) fileInput.current.value="";
  };
  const recoverDraft=()=>{
    try {
      const raw=localStorage.getItem(DRAFT_KEY);
      if(!raw) {setNotice("No previous draft is available in this browser.");return;}
      const url=URL.createObjectURL(new Blob([raw],{type:"application/json"}));
      const a=document.createElement("a");a.href=url;a.download="unreadable-draft.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    } catch {setNotice("Browser storage is unavailable. You can still download a backup of this design.");}
  };
  if(blooming) return <BloomViewer design={design} onBack={()=>setBlooming(false)}/>;
  return <div className="studio-page">
    <SiteHeader active="studio"><button className="text-button about-button" aria-label="About the flowers" onClick={()=>setDialog("about")}><span>About the flowers</span><Icon name="info" size={18}/></button></SiteHeader>
    <main id="main-content" tabIndex={-1}>
      <div className="studio-heading"><div><p className="eyebrow">Create / Arrange</p><h1>Flower studio</h1><p>A starting point, then your own finishing touches.</p></div><div className={`draft-status ${/could|paused/i.test(saveState) ? "save-warning" : ""}`} role="status"><span className="status-dot"/>{saveState}</div></div>
      {draftError && <div className="draft-error" role="alert">We couldn’t read a previous draft. Automatic saving is paused; no stored draft was overwritten.<button className="text-button" onClick={recoverDraft}>Download previous draft</button><button className="text-button" onClick={()=>{setSaveEnabled(true);setDraftError(false);}}>Replace with this design</button></div>}
      <section className="template-launcher" aria-labelledby="template-launcher-title"><div className="template-launcher-copy"><p className="eyebrow">Start here</p><h2 id="template-launcher-title">Find your arrangement.</h2><p>24 templates. Your size, height and flowers.</p><Button disabled={!ready} onClick={()=>openTemplates()}>Browse templates <Icon name="arrow" size={16}/></Button></div><div className="template-starters" role="group" aria-label="Browse templates by size">{templates.slice(0,4).map(t=><button key={t.id} disabled={!ready} onClick={()=>openTemplates(t.size)} aria-label={`Browse ${t.name.toLowerCase()} templates`}><img src={`/templates/${t.id}-original.webp`} width="144" height="96" alt="" decoding="async"/><span><strong>{t.name}</strong><small>{t.layers} layers{t.size==="large" ? " · wider" : ""}</small></span></button>)}</div></section>
      <details className="studio-explainer"><summary><Icon name="info" size={15}/> How to arrange</summary><ol><li><strong>Choose a starting point</strong><span>Browse templates, or keep editing your draft. Size and height are independent.</span></li><li><strong>Make each layer yours</strong><span>Select a layer. Choose Flowers, Shape or Accents to change its details.</span></li><li><strong>Bring it into 3D</strong><span>Bloom your arrangement when you’re ready. Your changes save on this device.</span></li></ol></details>
      <div className="studio-bottom"><details ref={backupMenu} className="backup-menu" onKeyDown={e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();backupMenu.current?.removeAttribute("open");backupMenu.current?.querySelector<HTMLElement>("summary")?.focus();}}}><summary><Icon name="download" size={17}/> Design file</summary><div className="backup-actions"><button className="text-button" onClick={()=>{backup();backupMenu.current?.removeAttribute("open");backupMenu.current?.querySelector<HTMLElement>("summary")?.focus();}}><Icon name="download" size={17}/> Download backup</button><button className="text-button" onClick={()=>{fileInput.current?.click();backupMenu.current?.removeAttribute("open");}}>Restore a backup</button><input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={e=>void importFile(e.target.files?.[0])}/></div></details><div className="bloom-next"><span>Your arrangement, brought to life</span><Button disabled={!ready} onClick={()=>{finish();if(design.layoutVersion===1)change({...design,layoutVersion:2});setBlooming(true);window.scrollTo({top:0,behavior:"instant"});}}><Icon name="flower" size={18}/> Bloom into 3D <Icon name="arrow" size={17}/></Button></div></div>
      <div className="studio-layout">
        <aside className="layers-panel" aria-label="Layers"><div className="panel-top"><h2>Your layers <span>{design.layers.length}</span></h2><span className="muted">Base to crown</span></div><p className="panel-intro">Select a ring to edit its flowers and shape.</p>
          <SelectionGroup className="layers-list">{design.layers.map((l,i)=><button key={l.id} className={`layer-card ${layer.id===l.id ? "selected" : ""}`} aria-pressed={layer.id===l.id} onClick={()=>{finish();setSelected(l.id);}}>
            {layer.id===l.id&&<SelectionHighlight className="layer-selection-highlight"/>}<span className="layer-number">{String(i+1).padStart(2,"0")}</span><FlowerArt kind={l.flower} color={l.color} size={43}/><span className="layer-name"><strong>{flowerById(l.flower).name}</strong><span>{i===0 ? "Base layer" : i===design.layers.length-1 ? "Crown layer" : "Flower layer"}</span></span><span className="layer-color" style={{background:l.color}}/>
          </button>)}</SelectionGroup>
          <button className="add-layer" disabled={design.layers.length>=LIMITS.layers} onClick={()=>{const next=addLayer(design,`layer-${crypto.randomUUID()}`);change({...design,layers:[...design.layers,next]});setSelected(next.id);}}><Icon name="plus" size={17}/> Add a layer <span>{design.layers.length}/{LIMITS.layers}</span></button>
          <div className="layer-actions"><button disabled={index===0} className="icon-button" aria-label="Move selected layer toward base" title="Move toward base" onClick={()=>move(-1)}><Icon name="up"/></button><button disabled={index===design.layers.length-1} className="icon-button" aria-label="Move selected layer toward crown" title="Move toward crown" onClick={()=>move(1)}><Icon name="down"/></button><span/><button disabled={design.layers.length===1} className="icon-button" aria-label="Remove selected layer" title="Remove layer" onClick={()=>{const layers=design.layers.filter(l=>l.id!==layer.id);change({...design,layers});setSelected(layers[Math.min(index,layers.length-1)].id);}}><Icon name="trash" size={18}/></button></div>
          <div className="studio-tip"><Icon name="leaf" size={22}/><p>Start wide at the base.<br/>Let each layer grow a little smaller.</p></div>
        </aside>
        <section className="canvas-panel" aria-label="Arrangement preview"><div className="canvas-toolbar"><SelectionGroup className="segmented" role="group" aria-label="Preview view"><button aria-pressed={!profile} className={!profile ? "active" : ""} onClick={()=>setProfile(false)}>{!profile&&<SelectionHighlight/>}Top view</button><button aria-pressed={profile} className={profile ? "active" : ""} onClick={()=>setProfile(true)}>{profile&&<SelectionHighlight/>}Side profile</button></SelectionGroup><div className="history-controls"><Tooltip text="Undo · Ctrl/⌘ Z"><button className="icon-button" aria-label="Undo" disabled={!history.past.length || !!live} onClick={()=>setHistory(undo)}><Icon name="undo" size={18}/></button></Tooltip><Tooltip text="Redo · Ctrl/⌘ Shift Z"><button className="icon-button" aria-label="Redo" disabled={!history.future.length || !!live} onClick={()=>setHistory(redo)}><Icon name="redo" size={18}/></button></Tooltip><span className="toolbar-divider"/><Tooltip text="Reset entire design"><button className="icon-button" aria-label="Reset entire design" onClick={()=>setDialog("reset")}><Icon name="reset" size={18}/></button></Tooltip></div></div>
          <div className="canvas-area"><div className="canvas-note">Arrangement preview</div><ArrangementCanvas design={design} selected={layer.id} onSelect={id=>{finish();setSelected(id);}} profile={profile}/><p className="canvas-hint">{profile ? "Layer heights shape the silhouette." : "Your selected layer is outlined."}</p></div>
          <div className="canvas-bottom"><span><span className="status-dot"/>{flowerCount} flowers · {design.layers.length} layers</span><button className="text-button" disabled={!ready} onClick={()=>openTemplates()}>Change template</button></div>
          {!!warnings.length && <div className="shape-warning" role="status"><Icon name="info" size={16}/>{warnings[0]}</div>}
        </section>
        <LayerControls layer={layer} index={index} onChange={update} onBegin={begin} onFinish={finish} onReset={()=>update(resetLayer(layer))}/>
      </div>

      <p className="notice" role="status" aria-live="polite">{notice}</p>
    </main><SiteFooter/>
    {dialog && <StudioDialog type={dialog} onClose={()=>setDialog(null)} onReset={()=>{change(defaultDesign());setSelected("layer-base");setDialog(null);setNotice("Starter arrangement restored. Undo can bring back your previous design.");}}/>}
    {templatesOpen && <TemplatePicker initialSize={templateSize} onClose={()=>setTemplatesOpen(false)} onChoose={(id,height)=>{const next={...templateDesign(id,height),personalization:{...design.personalization}};change(next);setSelected(next.layers[0].id);setTemplatesOpen(false);setNotice("Template applied. Undo restores your previous arrangement.");}}/>}
  </div>;
}
function StudioDialog({type,onClose,onReset}: {type:"reset"|"about";onClose:()=>void;onReset:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current,active=document.activeElement as HTMLElement|null;dialog?.showModal();return ()=>{dialog?.close();active?.focus();};},[]);
  return <dialog ref={ref} className="studio-dialog" aria-labelledby="studio-dialog-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget) onClose();}}><div className="dialog-inner"><button className="icon-button dialog-close" aria-label="Close dialog" onClick={onClose}><Icon name="close"/></button><p className="eyebrow">THE FLOWER STUDIO</p><h2 id="studio-dialog-title">{type==="reset" ? "Reset your arrangement?" : "Rooted in Telangana."}</h2>{type==="reset" ? <><p>This restores the five-layer starter arrangement. You can undo it if you change your mind.</p><div className="dialog-actions"><button className="secondary-button" onClick={onClose}>Keep arranging</button><Button variant="danger" onClick={onReset}>Reset arrangement</Button></div></> : <><p>Bathukamma is Telangana’s floral festival. Flowers are arranged in circular layers, often on a wide plate, to form a tapering mound.</p><p>This studio uses original illustrations of Tangedu, spike-form Gunugu, and a selected Banti marigold form. Flower choices and arrangements vary across families and regions. Traditional arrangements may include a pumpkin flower and a turmeric Gouramma crown on a leaf; these finishing elements are not yet represented in this studio.</p><p>Decorative colors are creative choices. This experience is a digital celebration, not a guide to ritual practice.</p><div className="source-links"><a href="https://www.telangana.gov.in/about/language-culture/" target="_blank" rel="noreferrer">Telangana cultural reference ↗</a><a href="https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A518328-1" target="_blank" rel="noreferrer">Botanical reference: Tangedu ↗</a></div><button className="primary-button" onClick={onClose}>Back to my flowers</button></>}</div></dialog>;
}
