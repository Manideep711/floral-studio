"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import {useEffect,useState} from "react";
import {useReducedMotion} from "motion/react";
import LogoSequence from "./LogoSequence";
export default function BrandLoader() {
  const {tr,locale}=useLanguage();
 const [visible,setVisible]=useState(true),[started,setStarted]=useState(false),reduced=useReducedMotion();
 useEffect(()=>{
  setStarted(true);
  // A bounded fallback also clears the splash if an animation event is missed.
  const timer=setTimeout(()=>setVisible(false),reduced ? 500 : 3100);
  return ()=>clearTimeout(timer);
 },[reduced]);
 if(!visible)return null;
 return <div className={`brand-loader ${started ? "is-started" : ""}`} role="status" aria-label={tr("Opening Bathukamma")} onAnimationEnd={event=>{if(event.target===event.currentTarget&&["brand-loader-exit","brand-loader-fade"].includes(event.animationName))setVisible(false);}}>
  <div className="brand-loader-mark" aria-hidden="true"><LogoSequence/></div>
 </div>;
}
