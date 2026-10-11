'use client';
// Adapted from ScrollX UI Morphy Button (MIT). https://scrollxui.dev/docs/components/morphy-button
import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {motion,useReducedMotion} from 'motion/react';
import LogoMark from './LogoMark';
export interface MorphyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{size?:'sm'|'default'|'lg';asChild?:boolean;dotClassName?:string;animate?:'normal'|'reverse';placed?:boolean;actionDelay?:number;}
export const MorphyButton=React.forwardRef<HTMLButtonElement,MorphyButtonProps>(function MorphyButton({className='',size='default',asChild=false,children,dotClassName='',animate='normal',placed=false,actionDelay=0,disabled,onClick,onPointerEnter,onPointerLeave,onFocus,onBlur,type='button',...props},ref){
 const [hovered,setHovered]=React.useState(false),[pending,setPending]=React.useState(false),reduced=useReducedMotion();
 const timer=React.useRef<ReturnType<typeof setTimeout>|null>(null),pendingRef=React.useRef(false);
 React.useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const active=placed||pending||(animate==='reverse'?!hovered:hovered),Comp=asChild?Slot:'button';
 return <Comp ref={ref} type={type} disabled={disabled||pending} aria-busy={pending||undefined} data-morph-active={active} data-placed={placed} className={`morphy-button morphy-${size} ${className}`} onPointerEnter={e=>{if(e.pointerType==='mouse')setHovered(true);onPointerEnter?.(e);}} onPointerLeave={e=>{setHovered(false);onPointerLeave?.(e);}} onFocus={e=>{setHovered(true);onFocus?.(e);}} onBlur={e=>{setHovered(false);onBlur?.(e);}} {...props} onClick={e=>{
  if(disabled||pendingRef.current)return;
  setHovered(true);
  if(!reduced&&actionDelay>0){pendingRef.current=true;setPending(true);timer.current=setTimeout(()=>{pendingRef.current=false;setPending(false);setHovered(false);onClick?.(e);},actionDelay);}else onClick?.(e);
 }}><span className="morphy-surface" aria-hidden="true"/><span className={`morphy-disc ${dotClassName}`} aria-hidden="true"/><span className="morphy-flower" aria-hidden="true"><LogoMark size={22}/></span><span className="morphy-label">{children}</span></Comp>;
});
export const MotionMorphyButton=motion.create(MorphyButton);
