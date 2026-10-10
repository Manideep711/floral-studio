"use client";
import {useEffect,useRef,useState} from "react";

const options=[
  {id:"original",name:"Fraunces + Manrope",description:"Current · expressive and warm",heading:"var(--font-editorial)",body:"var(--font-interface)"},
  {id:"poppins",name:"Poppins",description:"Round, geometric and friendly",heading:'"Preview Poppins"',body:'"Preview Poppins"'},
  {id:"satoshi",name:"Satoshi",description:"Clean, contemporary and understated",heading:'"Preview Satoshi"',body:'"Preview Satoshi"'},
  {id:"instrument",name:"Instrument Serif + Sans",description:"Editorial character, quiet interface",heading:'"Preview Instrument Serif"',body:'"Preview Instrument Sans"'},
] as const;
type FontChoice=typeof options[number]["id"];
const storageKey="bathukamma:typography:v1";

export default function TypographyController(){
  const [choice,setChoice]=useState<FontChoice>("original");
  const [storageUnavailable,setStorageUnavailable]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    try{
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
  return <>
    <button className="typography-trigger" type="button" aria-label="Open typography controller" aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}><span aria-hidden="true">Aa</span><span>Typography</span></button>
    <dialog className="typography-dialog" ref={dialog} aria-labelledby="typography-title" data-lenis-prevent>
      <div className="typography-panel">
        <div className="typography-header"><div><p className="eyebrow">Design preview</p><h2 id="typography-title">Find the right voice.</h2></div><button type="button" className="icon-button" aria-label="Close typography controller" onClick={()=>dialog.current?.close()}>×</button></div>
        <p className="typography-intro">Compare fonts across the site. This changes your browser’s preview.</p>
        <fieldset className="typography-options"><legend className="sr-only">Font pairing</legend>{options.map(option=><label key={option.id} className="typography-option" data-selected={choice===option.id}>
          <input type="radio" name="typography" value={option.id} checked={choice===option.id} onChange={()=>select(option.id)}/>
          <span><strong style={{fontFamily:option.body}}>{option.name}</strong><span className="typography-description">{option.description}</span><span className="typography-specimen" style={{fontFamily:option.heading}}>Flowers, made yours.</span><span className="typography-body-sample" style={{fontFamily:option.body}}>Layer by layer, a little celebration.</span></span>
        </label>)}</fieldset>
        <div className="typography-footer"><button className="text-button" type="button" onClick={()=>select("original")}>Restore current fonts</button><span role="status">{storageUnavailable ? "Preview active · saving unavailable" : "Saved in this browser"}</span></div>
      </div>
    </dialog>
  </>;
}
