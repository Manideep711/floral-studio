"use client";
import {useEffect,useRef} from "react";
import {usePathname} from "next/navigation";
import {ProgressiveBlur} from "./progressive-blur";
export default function PageEdgeBlur(){
 const host=useRef<HTMLDivElement>(null),path=usePathname();
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   frame=0;const edge=host.current?.querySelector<HTMLElement>(".page-edge-blur");if(!edge)return;
   const remaining=Math.max(0,document.documentElement.scrollHeight-window.innerHeight-window.scrollY);
   edge.style.opacity=String(Math.min(1,remaining/90));
   const bar=document.querySelector<HTMLElement>(".studio-bottom");
   const pinned=bar&&getComputedStyle(bar).position==="fixed";
   edge.style.bottom=pinned ? `${Math.max(0,window.innerHeight-bar.getBoundingClientRect().top)}px` : "0px";
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const observer=new ResizeObserver(schedule);observer.observe(document.body);observer.observe(document.documentElement);
  const mutations=new MutationObserver(schedule);mutations.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);schedule();
  return ()=>{cancelAnimationFrame(frame);observer.disconnect();mutations.disconnect();window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
 },[path]);
 return <div ref={host}><ProgressiveBlur className="page-edge-blur" blurLevels={[1,4]}/></div>;
}
