"use client";
import FlowerPointer from "../ui/pointer";
import EditorEntrance from "./EditorEntrance";
import ViewerLoading from "../ui/ViewerLoading";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import SiteHeader from "../ui/SiteHeader";
import {SelectionGroup,SelectionHighlight} from "../ui/selection-motion";
import SiteFooter from "../ui/SiteFooter";
import Button from "../ui/Button";
import {ShinyButton} from "../ui/shiny-button";
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
const BloomViewer=dynamic(()=>import("../three/BloomViewer"),{ssr:false,loading:()=> <StudioLoading/>});

export default function Studio() {
  const {tr,locale}=useLanguage();
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
  return <div className="studio-page"><FlowerPointer/>
    <SiteHeader active="studio"><button className="text-button about-button" aria-label={tr("About the flowers")} onClick={()=>setDialog("about")}><span>{tr("About the flowers")}</span><Icon name="info" size={18}/></button></SiteHeader>
    <EditorEntrance><main id="main-content" tabIndex={-1}>
      <div className="studio-heading"><div><p className="eyebrow">{tr("Create")}</p><h1>{tr("Studio")}</h1><p>{tr("Choose a layer to edit.")}</p></div><div className={`draft-status ${/could|paused/i.test(saveState) ? "save-warning" : ""}`} role="status"><span className="status-dot"/>{tr(saveState)}</div></div>
      {draftError && <div className="draft-error" role="alert">{tr("Draft unavailable. Saving is paused.")}<button className="text-button" onClick={recoverDraft}>{tr("Download previous draft")}</button><button className="text-button" onClick={()=>{setSaveEnabled(true);setDraftError(false);}}>{tr("Replace with this design")}</button></div>}
      <section className="template-launcher" aria-labelledby="template-launcher-title"><div className="template-launcher-copy"><p className="eyebrow">{tr("Templates")}</p><h2 id="template-launcher-title">{tr("Pick a starting point")}</h2><p>{tr("24 templates, ready to edit.")}</p><Button disabled={!ready} onClick={()=>openTemplates()}>{tr("See templates")} <Icon name="arrow" size={16}/></Button></div><div className="template-starters" role="group" aria-label={tr("See templates by size")}>{templates.slice(0,4).map(t=><button key={t.id} disabled={!ready} onClick={()=>openTemplates(t.size)} aria-label={`${tr("Templates")} · ${tr(t.name)}`}><img src={`/templates/${t.id}-original.webp`} width="144" height="96" alt="" decoding="async"/><span><strong>{tr(t.name)}</strong><small>{tr(`${t.layers} layers`)}{t.size==="large" ? tr(" · wider") : ""}</small></span></button>)}</div></section>
      <details className="studio-explainer"><summary><Icon name="info" size={15}/> {tr("How to arrange")}</summary><ol><li><strong>{tr("Pick a template")}</strong><span>{tr("Choose a template or edit your draft.")}</span></li><li><strong>{tr("Edit a layer")}</strong><span>{tr("Change its flowers, shape or accents.")}</span></li><li><strong>{tr("View in 3D")}</strong><span>{tr("Your draft saves on this device.")}</span></li></ol></details>
      <div className="studio-bottom"><details ref={backupMenu} className="backup-menu" onKeyDown={e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();backupMenu.current?.removeAttribute("open");backupMenu.current?.querySelector<HTMLElement>("summary")?.focus();}}}><summary><Icon name="download" size={17}/> {tr("Design file")}</summary><div className="backup-actions"><button className="text-button" onClick={()=>{backup();backupMenu.current?.removeAttribute("open");backupMenu.current?.querySelector<HTMLElement>("summary")?.focus();}}><Icon name="download" size={17}/> {tr("Download backup")}</button><button className="text-button" onClick={()=>{fileInput.current?.click();backupMenu.current?.removeAttribute("open");}}>{tr("Restore a backup")}</button><input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={e=>void importFile(e.target.files?.[0])}/></div></details><div className="bloom-next"><span></span><ShinyButton disabled={!ready} onClick={()=>{finish();if(design.layoutVersion===1)change({...design,layoutVersion:2});setBlooming(true);window.scrollTo({top:0,behavior:"instant"});}}><Icon name="flower" size={18}/>{tr("View in 3D")}<Icon name="arrow" size={17}/></ShinyButton></div></div>
      <div className="studio-layout">
        <aside className="layers-panel" aria-label={tr("Layers")}><div className="panel-top"><h2>{tr("Your layers")} <span>{design.layers.length}</span></h2><span className="muted">{tr("Base to crown")}</span></div><p className="panel-intro">{tr("Select a layer.")}</p>
          <SelectionGroup className="layers-list">{design.layers.map((l,i)=><button key={l.id} className={`layer-card ${layer.id===l.id ? "selected" : ""}`} aria-pressed={layer.id===l.id} onClick={()=>{finish();setSelected(l.id);}}>
            {layer.id===l.id&&<SelectionHighlight className="layer-selection-highlight"/>}<span className="layer-number">{String(i+1).padStart(2,"0")}</span><FlowerArt kind={l.flower} color={l.color} size={43}/><span className="layer-name"><strong>{tr(flowerById(l.flower).name)}</strong><span>{i===0 ? tr("Base layer") : i===design.layers.length-1 ? tr("Crown layer") : tr("Flower layer")}</span></span><span className="layer-color" style={{background:l.color}}/>
          </button>)}</SelectionGroup>
          <button className="add-layer" disabled={design.layers.length>=LIMITS.layers} onClick={()=>{const next=addLayer(design,`layer-${crypto.randomUUID()}`);change({...design,layers:[...design.layers,next]});setSelected(next.id);}}><Icon name="plus" size={17}/> {tr("Add a layer")} <span>{design.layers.length}/{LIMITS.layers}</span></button>
          <div className="layer-actions"><button disabled={index===0} className="icon-button" aria-label={tr("Move selected layer toward base")} title={tr("Move toward base")} onClick={()=>move(-1)}><Icon name="up"/></button><button disabled={index===design.layers.length-1} className="icon-button" aria-label={tr("Move selected layer toward crown")} title={tr("Move toward crown")} onClick={()=>move(1)}><Icon name="down"/></button><span/><button disabled={design.layers.length===1} className="icon-button" aria-label={tr("Remove selected layer")} title={tr("Remove layer")} onClick={()=>{const layers=design.layers.filter(l=>l.id!==layer.id);change({...design,layers});setSelected(layers[Math.min(index,layers.length-1)].id);}}><Icon name="trash" size={18}/></button></div>
          <div className="studio-tip"><Icon name="leaf" size={22}/><p>{tr("Keep the base wide.")}<br/>{tr("Make each layer smaller.")}</p></div>
        </aside>
        <section className="canvas-panel" aria-label={tr("Arrangement preview")}><div className="canvas-toolbar"><SelectionGroup className="segmented" role="group" aria-label={tr("Preview view")}><button aria-pressed={!profile} className={!profile ? "active" : ""} onClick={()=>setProfile(false)}>{!profile&&<SelectionHighlight/>}{tr("Top view")}</button><button aria-pressed={profile} className={profile ? "active" : ""} onClick={()=>setProfile(true)}>{profile&&<SelectionHighlight/>}{tr("Side profile")}</button></SelectionGroup><div className="history-controls"><Tooltip text={tr("Undo · Ctrl/⌘ Z")}><button className="icon-button" aria-label={tr("Undo")} disabled={!history.past.length || !!live} onClick={()=>setHistory(undo)}><Icon name="undo" size={18}/></button></Tooltip><Tooltip text={tr("Redo · Ctrl/⌘ Shift Z")}><button className="icon-button" aria-label={tr("Redo")} disabled={!history.future.length || !!live} onClick={()=>setHistory(redo)}><Icon name="redo" size={18}/></button></Tooltip><span className="toolbar-divider"/><Tooltip text={tr("Reset entire design")}><button className="icon-button" aria-label={tr("Reset entire design")} onClick={()=>setDialog("reset")}><Icon name="reset" size={18}/></button></Tooltip></div></div>
          <div className="canvas-area"><div className="canvas-note">{tr("Arrangement preview")}</div><ArrangementCanvas design={design} selected={layer.id} onSelect={id=>{finish();setSelected(id);}} profile={profile}/><p className="canvas-hint">{profile ? tr("Adjust height in Shape.") : tr("Selected layer")}</p></div>
          <div className="canvas-bottom"><span><span className="status-dot"/>{tr(`${flowerCount} flowers · ${design.layers.length} layers`)}</span><button className="text-button" disabled={!ready} onClick={()=>openTemplates()}>{tr("Change template")}</button></div>
          {!!warnings.length && <div className="shape-warning" role="status"><Icon name="info" size={16}/>{tr(warnings[0])}</div>}
        </section>
        <LayerControls layer={layer} index={index} onChange={update} onBegin={begin} onFinish={finish} onReset={()=>update(resetLayer(layer))}/>
      </div>

      <p className="notice" role="status" aria-live="polite">{tr(notice)}</p>
    </main></EditorEntrance><SiteFooter/>
    {dialog && <StudioDialog type={dialog} onClose={()=>setDialog(null)} onReset={()=>{change(defaultDesign());setSelected("layer-base");setDialog(null);setNotice("Starter arrangement restored. Undo can bring back your previous design.");}}/>}
    {templatesOpen && <TemplatePicker initialSize={templateSize} onClose={()=>setTemplatesOpen(false)} onChoose={(id,height)=>{const next={...templateDesign(id,height),personalization:{...design.personalization}};change(next);setSelected(next.layers[0].id);setTemplatesOpen(false);setNotice("Template applied. Undo restores your previous arrangement.");}}/>}
  </div>;
}
function StudioDialog({type,onClose,onReset}: {type:"reset"|"about";onClose:()=>void;onReset:()=>void}) {
  const {tr,locale}=useLanguage();
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current,active=document.activeElement as HTMLElement|null;dialog?.showModal();return ()=>{dialog?.close();active?.focus();};},[]);
  return <dialog ref={ref} className="studio-dialog" aria-labelledby="studio-dialog-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget) onClose();}}><div className="dialog-inner"><button className="icon-button dialog-close" aria-label={tr("Close dialog")} onClick={onClose}><Icon name="close"/></button><p className="eyebrow">{tr("Flowers")}</p><h2 id="studio-dialog-title">{type==="reset" ? tr("Reset your arrangement?") : tr("About Bathukamma")}</h2>{type==="reset" ? <><p>{tr("Restore the starter. You can undo this.")}</p><div className="dialog-actions"><button className="secondary-button" onClick={onClose}>{tr("Keep arranging")}</button><Button variant="danger" onClick={onReset}>{tr("Reset arrangement")}</Button></div></> : <><p>{tr("Bathukamma is Telangana’s flower festival. Flowers are stacked in circles, wider at the base.")}</p><p>{tr("This digital version includes Tangedu, Gunugu, Banti and rose. The pumpkin flower and turmeric Gouramma are not modelled yet.")}</p><p>{tr("A creative studio, rather than a ritual guide.")}</p><div className="source-links"><a href="https://www.telangana.gov.in/about/language-culture/" target="_blank" rel="noreferrer">{tr("Telangana cultural reference ↗")}</a><a href="https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A518328-1" target="_blank" rel="noreferrer">{tr("Botanical reference: Tangedu ↗")}</a></div><button className="primary-button" onClick={onClose}>{tr("Back to my flowers")}</button></>}</div></dialog>;
}

function StudioLoading(){return <ViewerLoading/>;}
