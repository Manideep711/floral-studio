"use client";
// Adapted from Magic UI Ripple Button (MIT), Sidd5arth.
import {forwardRef,useRef,useState,type ButtonHTMLAttributes,type CSSProperties} from "react";
import {motion,useReducedMotion} from "motion/react";
type Props=ButtonHTMLAttributes<HTMLButtonElement>&{rippleColor?:string;duration?:string};
export const RippleButton=forwardRef<HTMLButtonElement,Props>(function RippleButton({children,className="",rippleColor="#fff",duration="600ms",onClick,type="button",...props},ref){
 const [ripples,setRipples]=useState<Array<{x:number;y:number;size:number;key:number}>>([]),id=useRef(0),reduced=useReducedMotion();
 return <button ref={ref} type={type} className={`ripple-button ${className}`} {...props} onClick={e=>{if(!reduced){const r=e.currentTarget.getBoundingClientRect(),size=Math.hypot(r.width,r.height)*2;setRipples(old=>[...old.slice(-7),{x:(e.detail===0?r.width/2:e.clientX-r.left)-size/2,y:(e.detail===0?r.height/2:e.clientY-r.top)-size/2,size,key:++id.current}]);}onClick?.(e);}}><span className="ripple-button-label">{children}</span><span className="ripple-button-waves" aria-hidden="true">{ripples.map(r=><span key={r.key} onAnimationEnd={()=>setRipples(old=>old.filter(item=>item.key!==r.key))} className="button-ripple" style={{width:r.size,height:r.size,left:r.x,top:r.y,backgroundColor:rippleColor,"--ripple-duration":duration} as CSSProperties}/>)}</span></button>;
});
export const MotionRippleButton=motion.create(RippleButton);
