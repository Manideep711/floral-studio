"use client";
import {useLayoutEffect,useRef,useState,type ReactNode} from "react";
import {motion,useReducedMotion} from "motion/react";

// Sliding hover/focus indicator inspired by Tween UI Sliding Tabs.
export function SlidingChoices({children,className,label,value}:{children:ReactNode;className:string;label:string;value:string}){
  const root=useRef<HTMLDivElement>(null),target=useRef<HTMLButtonElement|null>(null);
  const [box,setBox]=useState<{x:number;y:number;width:number;height:number}|null>(null);
  const reduced=useReducedMotion();
  const move=(button:HTMLButtonElement|null)=>{
    target.current=button;
    if(!button||button.disabled){setBox(null);return;}
    setBox({x:button.offsetLeft,y:button.offsetTop,width:button.offsetWidth,height:button.offsetHeight});
  };
  const restore=()=>move(root.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')??null);
  useLayoutEffect(()=>{
    const element=root.current;if(!element)return;
    restore();
    const observer=new ResizeObserver(()=>move(target.current));observer.observe(element);
    return ()=>observer.disconnect();
  // Selection changes restore the indicator without remounting it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[value]);
  return <div ref={root} className={`${className} sliding-choices`} role="group" aria-label={label}
    onPointerOver={e=>{if(e.pointerType!=="mouse")return;const button=(e.target as HTMLElement).closest<HTMLButtonElement>("button");if(button&&root.current?.contains(button))move(button);}}
    onPointerLeave={()=>{const focused=document.activeElement;move(focused instanceof HTMLButtonElement&&root.current?.contains(focused)?focused:root.current?.querySelector('button[aria-pressed="true"]')??null);}}
    onFocus={e=>{const button=(e.target as HTMLElement).closest<HTMLButtonElement>("button");if(button)move(button);}}
    onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))restore();}}>
    <motion.div aria-hidden="true" className="sliding-choice-indicator" initial={false}
      animate={box?{...box,opacity:1,scale:1}:{opacity:0,scale:.85}}
      transition={reduced?{duration:0}:{duration:.35,ease:[.22,1,.36,1]}}/>
    {children}
  </div>;
}
