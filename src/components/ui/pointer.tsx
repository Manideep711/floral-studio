"use client";
// Adapted from Magic UI Pointer (MIT), enabled only on explicitly marked Studio action buttons.
import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {AnimatePresence,motion,useMotionValue,useReducedMotion} from "motion/react";
import LogoMark from "./LogoMark";
export default function FlowerPointer(){
 const x=useMotionValue(0),y=useMotionValue(0),reduced=useReducedMotion();
 const [host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  if(reduced)return;
  const media=matchMedia("(any-hover: hover) and (any-pointer: fine)");
  let current:HTMLElement|null=null;
  const hide=()=>{current?.removeAttribute("data-custom-pointer");current=null;setHost(null);};
  const eligible=(target:EventTarget|null)=>target instanceof Element?target.closest<HTMLElement>('button[data-flower-cursor]:not(:disabled)'):null;
  const enter=(e:PointerEvent)=>{
   const next=eligible(e.target);
   if(!media.matches||e.pointerType!=="mouse"||!next){if(current)hide();return;}
   if(current===next)return;
   current?.removeAttribute("data-custom-pointer");current=next;current.setAttribute("data-custom-pointer","active");
   x.set(e.clientX);y.set(e.clientY);setHost(next.closest<HTMLDialogElement>('dialog[open]')??document.body);
  };
  const move=(e:PointerEvent)=>{if(current&&e.pointerType==="mouse"){x.set(e.clientX);y.set(e.clientY);}};
  const leave=(e:PointerEvent)=>{if(current&&eligible(e.relatedTarget)!==current)hide();};
  document.addEventListener("pointerover",enter);document.addEventListener("pointermove",move);document.addEventListener("pointerout",leave);
  document.addEventListener("scroll",hide,true);window.addEventListener("blur",hide);media.addEventListener("change",hide);
  return ()=>{hide();document.removeEventListener("pointerover",enter);document.removeEventListener("pointermove",move);document.removeEventListener("pointerout",leave);document.removeEventListener("scroll",hide,true);window.removeEventListener("blur",hide);media.removeEventListener("change",hide);};
 },[x,y,reduced]);
 return host&&createPortal(<AnimatePresence><motion.div aria-hidden="true" style={{position:"fixed",left:0,top:0,x,y,translateX:"-50%",translateY:"-50%",zIndex:10000,pointerEvents:"none"}} initial={{scale:.7,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:.14}}><span className="botanical-pointer"><motion.span className="botanical-pointer-flower" animate={{rotate:360}} transition={{duration:9,repeat:Infinity,ease:"linear"}}><LogoMark size={20}/></motion.span></span></motion.div></AnimatePresence>,host);
}
