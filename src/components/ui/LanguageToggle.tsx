"use client";
import {useRef,useState} from "react";
import {flushSync,createPortal} from "react-dom";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
export default function LanguageToggle(){
 const {locale,setLocale}=useLanguage();
 const button=useRef<HTMLButtonElement>(null),overlay=useRef<HTMLDivElement>(null),busy=useRef(false);
 const [pending,setPending]=useState(false);
 async function toggle(){
  if(busy.current)return;
  const next=locale==="en"?"te":"en";
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){setLocale(next);return;}
  busy.current=true;
  const rect=button.current!.getBoundingClientRect();
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2,w=innerWidth,h=innerHeight;
  const radius=Math.hypot(Math.max(x,w-x),Math.max(y,h-y));
  flushSync(()=>setPending(true));
  const veil=overlay.current!;
  try{
   const spread=veil.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`]},{duration:450,easing:"cubic-bezier(.65,0,.35,1)",fill:"forwards"});
   await spread.finished;
   flushSync(()=>setLocale(next));
   const fade=veil.animate({opacity:[1,0]},{duration:350,easing:"ease-out",fill:"forwards"});
   await fade.finished;
   spread.cancel();fade.cancel();
  }catch{setLocale(next);}
  finally{busy.current=false;setPending(false);}
 }
 return <><button ref={button} type="button" className="language-toggle" disabled={pending} aria-busy={pending} aria-label={locale==="en"?"తెలుగులోకి మార్చండి":"Switch to English"} onClick={toggle}><span lang={locale}>{locale==="en"?"EN":"తె"}</span></button>{pending&&createPortal(<div ref={overlay} aria-hidden="true" className="language-transition-veil"/>,document.body)}</>;
}
