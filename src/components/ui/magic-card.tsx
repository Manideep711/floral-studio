"use client";
// Adapted from Magic UI Magic Card (MIT), dillionverma and Yeom-JinHo.
import type {ReactNode} from "react";
import {motion,useMotionTemplate,useMotionValue,useReducedMotion} from "motion/react";
export function MagicCard({children,className="",gradientSize=200,gradientColor="#91b5a1",gradientOpacity=.18,gradientFrom="#6d9f87",gradientTo="#d4b970"}:{children?:ReactNode;className?:string;gradientSize?:number;gradientColor?:string;gradientOpacity?:number;gradientFrom?:string;gradientTo?:string}){
 const x=useMotionValue(-gradientSize),y=useMotionValue(-gradientSize),reduced=useReducedMotion();
 const border=useMotionTemplate`radial-gradient(${gradientSize}px circle at ${x}px ${y}px,${gradientFrom},${gradientTo},#dce6df 100%)`;
 const glow=useMotionTemplate`radial-gradient(${gradientSize}px circle at ${x}px ${y}px,${gradientColor},transparent 100%)`;
 const reset=()=>{x.set(-gradientSize);y.set(-gradientSize);};
 return <motion.div className={`magic-card ${className}`} onPointerMove={e=>{if(reduced||e.pointerType!=="mouse")return;const rect=e.currentTarget.getBoundingClientRect();x.set(e.clientX-rect.left);y.set(e.clientY-rect.top);}} onPointerLeave={reset} style={{background:reduced ? "#dce6df" : border}}><div className="magic-card-surface"/><motion.div className="magic-card-glow" aria-hidden="true" style={{background:glow,opacity:reduced ? 0 : gradientOpacity}}/><div className="magic-card-content">{children}</div></motion.div>;
}
