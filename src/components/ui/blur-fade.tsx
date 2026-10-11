"use client";
import {useEffect,useState,useRef,type ReactNode} from "react";
import {motion,useInView,useReducedMotion,type MotionProps,type UseInViewOptions,type Variants} from "motion/react";
// Magic UI Blur Fade, adapted for reduced motion and sticky editor positioning.
interface BlurFadeProps extends MotionProps{children:ReactNode;className?:string;variant?:Variants;duration?:number;delay?:number;offset?:number;direction?:"up"|"down"|"left"|"right";inView?:boolean;inViewMargin?:UseInViewOptions["margin"];blur?:string;waitForLoader?:boolean}
export function BlurFade({children,className="",variant,duration=.4,delay=0,offset=6,direction="down",inView=false,inViewMargin="-50px",blur="6px",waitForLoader=false,...props}:BlurFadeProps){
 const ref=useRef<HTMLDivElement>(null),visible=useInView(ref,{once:true,margin:inViewMargin}),reduced=useReducedMotion();
 const [loaderCleared,setLoaderCleared]=useState(!waitForLoader);
 useEffect(()=>{if(!waitForLoader)return;const check=()=>{if(!document.querySelector(".brand-loader")){setLoaderCleared(true);observer.disconnect();}};const observer=new MutationObserver(check);observer.observe(document.body,{childList:true,subtree:true});check();return ()=>observer.disconnect();},[waitForLoader]);
 const axis=direction==="left"||direction==="right"?"x":"y";
 const shift=direction==="right"||direction==="down"?-offset:offset;
 const variants:Variants=variant??{hidden:{x:axis==="x"?shift:0,y:axis==="y"?shift:0,opacity:0,filter:`blur(${blur})`},visible:{x:0,y:0,opacity:1,filter:"blur(0px)",transitionEnd:{filter:"none",transform:"none"}}};
 return <motion.div {...props} ref={ref} className={`blur-fade ${className}`} initial={reduced?false:"hidden"} animate={reduced?{opacity:1,filter:"none",transform:"none"}:loaderCleared&&(!inView||visible)?"visible":"hidden"} variants={variants} transition={{duration:reduced?0:duration,delay:reduced?0:delay+.04,ease:"easeOut"}}>{children}</motion.div>;
}
