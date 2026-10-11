"use client";
import {useRef,useState} from "react";
import {flushSync} from "react-dom";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
// Magic UI Theme Toggler circular reveal adapted to language switching.
export default function LanguageToggle(){
 const {locale,setLocale}=useLanguage();
 const button=useRef<HTMLButtonElement>(null),busy=useRef(false);
 const [pending,setPending]=useState(false);
 async function toggle(){
  if(busy.current)return;
  const next=locale==="en"?"te":"en";
  if(!document.startViewTransition||matchMedia("(prefers-reduced-motion: reduce)").matches){setLocale(next);return;}
  busy.current=true;setPending(true);
  const root=document.documentElement,rect=button.current!.getBoundingClientRect();
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2,w=innerWidth,h=innerHeight;
  const radius=Math.hypot(Math.max(x,w-x),Math.max(y,h-y));
  root.dataset.languageTransition="active";
  try{
   const transition=document.startViewTransition(()=>flushSync(()=>setLocale(next)));
   await transition.ready;
   const animation=root.animate({clipPath:[`circle(0% at ${x/w*100}% ${y/h*100}%)`,`circle(${radius/(Math.hypot(w,h)/Math.SQRT2)*100}% at ${x/w*100}% ${y/h*100}%)`]},{duration:500,easing:"ease-in-out",pseudoElement:"::view-transition-new(root)",fill:"forwards"});
   await animation.finished;
   animation.cancel();
   await transition.finished;
  }catch{setLocale(next);}
  finally{delete root.dataset.languageTransition;busy.current=false;setPending(false);}
 }
 return <button ref={button} type="button" className="language-toggle" disabled={pending} aria-busy={pending} aria-label={locale==="en"?"తెలుగులోకి మార్చండి":"Switch to English"} onClick={toggle}><span lang="en">EN</span><span aria-hidden="true"> / </span><span lang="te">తెలుగు</span></button>;
}
