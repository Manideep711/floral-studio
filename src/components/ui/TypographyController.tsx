"use client";
import {useLanguage,TELUGU_ENABLED} from "@/lib/i18n/LanguageProvider";
import {Select} from "./select";
import LanguageToggle from "./LanguageToggle";
import {useEffect,useRef,useState} from "react";

const options=[
  {id:"original",name:"Fraunces + Manrope",description:"Current",heading:"var(--font-editorial)",body:"var(--font-interface)"},
  {id:"poppins",name:"Poppins",description:"Round and friendly",heading:'"Preview Poppins"',body:'"Preview Poppins"'},
  {id:"satoshi",name:"Satoshi",description:"Clean and simple",heading:'"Preview Satoshi"',body:'"Preview Satoshi"'},
  {id:"instrument",name:"Instrument Serif + Sans",description:"Serif headings, clean controls",heading:'"Preview Instrument Serif"',body:'"Preview Instrument Sans"'},
  {id:"clash",name:"Clash Display + Satoshi",description:"Bold headings, clean controls",heading:'"Clash Display"',body:'"Satoshi"'},
] as const;
type FontChoice=typeof options[number]["id"];
const teluguOptions=[{value:"noto",label:"Noto Sans Telugu"},{value:"gidugu",label:"Gidugu"},{value:"lohit",label:"Lohit Telugu"},{value:"mallanna",label:"Mallanna"},{value:"annamayya",label:"Annamayya"},{value:"chathura",label:"Chathura"},{value:"ravi",label:"Ravi Prakash"},{value:"lakki",label:"Lakki Reddy"}];
const teluguFamilies:Record<string,string>={noto:"Noto Sans Telugu",gidugu:"Gidugu",lohit:"Lohit Telugu",mallanna:"Mallanna",annamayya:"Annamayya",chathura:"Chathura",ravi:"RaviPrakash",lakki:"LakkiReddy"};
const storageKey="bathukamma:typography:v1";

export default function TypographyController(){
  const {tr,locale,setLocale}=useLanguage();
  const [telugu,setTelugu]=useState("noto");
  const [choice,setChoice]=useState<FontChoice>("original");
  const [storageUnavailable,setStorageUnavailable]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    try{
      const savedTelugu=localStorage.getItem("bathukamma:telugu-font:v1");
      if(savedTelugu&&teluguFamilies[savedTelugu]){setTelugu(savedTelugu);document.documentElement.dataset.teluguFont=savedTelugu;}
      const saved=localStorage.getItem(storageKey);
      if(options.some(option=>option.id===saved)){
        setChoice(saved as FontChoice);
        document.documentElement.dataset.typography=saved!;
      }
    }catch{setStorageUnavailable(true);}
  },[]);
  function select(next:FontChoice){
    setChoice(next);document.documentElement.dataset.typography=next;
    try{localStorage.setItem(storageKey,next);}catch{setStorageUnavailable(true);}
  }
  function selectTelugu(next:string){setTelugu(next);setLocale("te");document.documentElement.dataset.teluguFont=next;try{localStorage.setItem("bathukamma:telugu-font:v1",next);}catch{setStorageUnavailable(true);}}
  return <>
    <button className="typography-trigger" type="button" aria-label={tr("Open typography controller")} aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}><span aria-hidden="true">Aa</span><span>{tr("Typography")}</span></button>
    <dialog className="typography-dialog" ref={dialog} aria-labelledby="typography-title" data-lenis-prevent>
      <div className="typography-panel">
        <div className="typography-header"><div><p className="eyebrow">{tr("Fonts")}</p><h2 id="typography-title">{tr("Choose fonts")}</h2></div><button type="button" className="icon-button" aria-label={tr("Close typography controller")} onClick={()=>dialog.current?.close()}>×</button></div>
        <div className="typography-language"><p className="typography-intro">{tr("Preview in this browser.")}</p><LanguageToggle/></div>
        {TELUGU_ENABLED&&<div className="typography-telugu"><Select label={tr("Telugu font")} value={telugu} onValueChange={selectTelugu} options={teluguOptions}/><p lang="te" className="typography-telugu-sample" style={{fontFamily:`"${teluguFamilies[telugu]}", "Noto Sans Telugu", sans-serif`}}>మీ బతుకమ్మ<br/><span>పూలు ఎంచుకోండి. ఒక్కో వరుస పేర్చండి.</span></p></div>}
        <fieldset className="typography-options"><legend className="sr-only">{tr("Font pairing")}</legend>{options.map(option=><label key={option.id} className="typography-option" data-selected={choice===option.id}>
          <input type="radio" name="typography" value={option.id} checked={choice===option.id} onChange={()=>select(option.id)}/>
          <span><strong style={{fontFamily:option.body}}>{tr(option.name)}</strong><span className="typography-description">{tr(option.description)}</span><span className="typography-specimen" style={{fontFamily:option.heading}}>{tr("Make a Bathukamma.")}</span><span className="typography-body-sample" style={{fontFamily:option.body}}>{tr("Choose flowers. Add a layer.")}</span></span>
        </label>)}</fieldset>
        <div className="typography-footer"><button className="text-button" type="button" onClick={()=>{select("original");if(!TELUGU_ENABLED)return;setTelugu("noto");document.documentElement.dataset.teluguFont="noto";try{localStorage.removeItem("bathukamma:telugu-font:v1");}catch{setStorageUnavailable(true);}}}>{tr("Restore current fonts")}</button><span role="status">{storageUnavailable ? tr("Preview active · saving unavailable") : tr("Saved in this browser")}</span></div>
      </div>
    </dialog>
  </>;
}
