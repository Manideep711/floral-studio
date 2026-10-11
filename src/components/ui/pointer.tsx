"use client";
// Adapted from Magic UI Pointer (MIT), scoped to the studio; sliders keep native input.
import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {AnimatePresence,motion,useMotionValue,useReducedMotion} from "motion/react";
import LogoMark from "./LogoMark";
const sliders='[role="slider"],[data-slot="slider"],input[type="range"],.ui-slider';
export default function FlowerPointer(){
 const x=useMotionValue(0),y=useMotionValue(0),reduced=useReducedMotion();
 const [host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  if(reduced)return;
  const media=matchMedia("(any-hover: hover) and (any-pointer: fine)");
  let current:HTMLElement|null=null;
  const hide=()=>{current?.removeAttribute("data-custom-pointer");current=null;setHost(null);};
  const move=(e:PointerEvent)=>{
   const target=e.target instanceof HTMLElement ? e.target : e.target instanceof Element ? e.target.parentElement : null;
   if(!media.matches||e.pointerType!=="mouse"||!target||target.closest(sliders)){hide();return;}
   x.set(e.clientX);y.set(e.clientY);
   if(current!==target){current?.removeAttribute("data-custom-pointer");current=target;current.setAttribute("data-custom-pointer","active");}
   setHost(target.closest<HTMLDialogElement>('dialog[open]')??document.body);
  };
  const leave=(e:PointerEvent)=>{if(!e.relatedTarget)hide();};
  document.addEventListener("pointermove",move);document.addEventListener("pointerout",leave);
  document.addEventListener("scroll",hide,true);window.addEventListener("blur",hide);media.addEventListener("change",hide);
  return ()=>{hide();document.removeEventListener("pointermove",move);document.removeEventListener("pointerout",leave);document.removeEventListener("scroll",hide,true);window.removeEventListener("blur",hide);media.removeEventListener("change",hide);};
 },[x,y,reduced]);
 return host&&createPortal(<AnimatePresence><motion.div aria-hidden="true" style={{position:"fixed",left:0,top:0,x,y,translateX:"-50%",translateY:"-50%",zIndex:10000,pointerEvents:"none"}} initial={{scale:.7,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:.14}}><span className="botanical-pointer"><motion.span className="botanical-pointer-flower" animate={{rotate:360}} transition={{duration:9,repeat:Infinity,ease:"linear"}}><LogoMark size={20}/></motion.span></span></motion.div></AnimatePresence>,host);
}
