"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import {useEffect,useRef,useState} from "react";
import {templates,sizes,heights,type TemplateId,type TemplateHeight} from "@/lib/design/templates";
import {flowers} from "@/lib/flowers/catalog";
import {MagicCard} from "../ui/magic-card";
import Icon from "../ui/Icon";
import {Select} from "../ui/select";
import {motion,useReducedMotion} from "motion/react";

// Pre-rendered at build time: opening/filtering the gallery never generates or
// rasterizes hundreds of detailed SVG flowers on the user's device.
function preview(id:TemplateId,height?:TemplateHeight){return `/templates/${id}-${height??"original"}.webp`;}
const empty={size:"all",tone:"all",shape:"all",arrangement:"all",flower:"all"};
export default function TemplatePicker({onClose,onChoose,initialSize="all"}: {onClose:()=>void;onChoose:(id:TemplateId,height?:TemplateHeight)=>void;initialSize?:keyof typeof sizes|"all"}) {
  const {tr,locale}=useLanguage();
 const ref=useRef<HTMLDialogElement>(null),[filters,setFilters]=useState<typeof empty>({...empty,size:initialSize});
 const [height,setHeight]=useState<TemplateHeight|undefined>();
 const reduced=useReducedMotion();
 useEffect(()=>{const dialog=ref.current,active=document.activeElement as HTMLElement|null;dialog?.showModal();return ()=>{dialog?.close();active?.focus();};},[]);
 const visible=templates.filter(t=>(filters.size==="all"||t.size===filters.size)&&(filters.tone==="all"||t.tone===filters.tone)&&(filters.shape==="all"||t.shape===filters.shape)&&(filters.arrangement==="all"||t.arrangement===filters.arrangement)&&(filters.flower==="all"||t.flowers.some(f=>f===filters.flower)));
 const options={
 tone:[...new Set(templates.map(t=>t.tone))].map(value=>({value,name:value})),
 shape:[...new Set(templates.map(t=>t.shape))].map(value=>({value,name:value})),
 arrangement:[...new Set(templates.map(t=>t.arrangement))].map(value=>({value,name:value})),
 flower:flowers.map(f=>({value:f.id,name:f.name}))
 };
 return <motion.dialog layoutRoot layoutScroll ref={ref} className="studio-dialog template-dialog" aria-labelledby="templates-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><motion.div className="dialog-inner" initial={reduced ? false : {opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.22,ease:[.22,1,.36,1]}}>
 <button className="icon-button dialog-close" aria-label={tr("Close templates")} onClick={onClose}><Icon name="close"/></button>
 <header className="template-header"><p className="template-kicker">{tr("Templates")}</p><h2 id="templates-title">{tr("Pick a template")}</h2><p>{tr("Choose a size and height.")}</p></header>
 <div className="template-library-body"><motion.aside layoutScroll className="template-sidebar" aria-label={tr("Template choices")}>
 <div className="template-choice-field"><span id="template-size-label">{tr("Size")}</span><div className="template-size-choices" role="group" aria-labelledby="template-size-label"><motion.button type="button" aria-pressed={filters.size==="all"} onClick={()=>setFilters({...filters,size:"all"})} whileTap={reduced ? undefined : {scale:.97}}>{tr("All sizes")}</motion.button>{Object.entries(sizes).map(([value,s])=><motion.button type="button" key={value} aria-pressed={filters.size===value} onClick={()=>setFilters({...filters,size:value})} whileTap={reduced ? undefined : {scale:.97}}><strong>{tr(s.name)}</strong><small>{tr(`${s.layers} layers`)}{value==="large" ? tr(" · wider") : ""}</small></motion.button>)}</div></div>
 <div className="template-choice-field"><span id="template-height-label">{tr("Height")}</span><div className="template-height-choices" role="group" aria-labelledby="template-height-label">{[{value:undefined,name:tr("Original")},...Object.entries(heights).map(([value,h])=>({value:value as TemplateHeight,name:h.name}))].map(h=><motion.button type="button" key={tr(h.name)} aria-pressed={height===h.value} onClick={()=>setHeight(h.value)} whileTap={reduced ? undefined : {scale:.97}}>{tr(h.name)}</motion.button>)}</div></div>
 <details className="template-more-filters"><summary>{tr("More filters")}{Object.entries(filters).filter(([key,value])=>key!=="size"&&value!=="all").length>0 ? ` · ${Object.entries(filters).filter(([key,value])=>key!=="size"&&value!=="all").length} ${tr("active")}` : ""}</summary><div className="template-filters">{(Object.keys(options) as Array<keyof typeof options>).map(key=><Select key={key} label={key==="tone" ? tr("Colour") : key==="flower" ? tr("Flower") : key[0].toUpperCase()+key.slice(1)} value={filters[key]} onValueChange={value=>setFilters({...filters,[key]:value})} options={[{value:"all",label:tr("All")},...options[key].map(option=>({value:option.value,label:option.name}))]}/>)}</div></details>
 <p className="template-choice-note">{tr("Size sets width and layers. Height sets the rise.")}</p><button className="text-button template-reset" onClick={()=>{setFilters(empty);setHeight(undefined);}}><Icon name="reset" size={14}/>{tr("Reset choices")}</button></motion.aside><motion.section layoutScroll className="template-gallery" aria-label={tr("Arrangement collection")}>
 <div className="template-results"><span role="status">{tr(`${visible.length} arrangements`)}</span><span>{tr("Select to use")}</span></div>
 <motion.div className="template-grid" initial={reduced ? false : {opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{duration:.16,ease:"easeOut"}}>{visible.map(t=><motion.button layout={reduced ? false : "position"} initial={reduced ? false : {opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.22,ease:[.22,1,.36,1]}} key={t.id} className="template-option" onClick={()=>onChoose(t.id,height)}><MagicCard className="template-preview"><img src={preview(t.id,height)} width="180" height="128" loading="lazy" decoding="async" alt=""/></MagicCard><div className="template-card-heading"><strong>{tr(t.name)}</strong><Icon name="arrow" size={16}/></div><span className="template-card-meta">{tr(`${t.layers} layers`)} · {tr(t.shape)}{height ? ` · ${tr(heights[height].name)}` : ""}</span><span className="template-card-flowers">{t.flowers.map(id=>tr(flowers.find(f=>f.id===id)!.name)).join(" · ")}</span></motion.button>)}</motion.div>
 {visible.length===0&&<p className="template-empty">{tr("No matches. Try other filters.")}</p>}
 </motion.section></div></motion.div></motion.dialog>;
}
