import type {CSSProperties} from "react";
// Magic UI Progressive Blur (MIT), with masks derived from the layer count.
export interface ProgressiveBlurProps{className?:string;height?:string;position?:"top"|"bottom"|"both";blurLevels?:number[]}
export function ProgressiveBlur({className="",height="64px",position="bottom",blurLevels=[.5,2,4,8]}:ProgressiveBlurProps){
 const levels=blurLevels.filter(n=>Number.isFinite(n)&&n>=0);
 const edge=(side:"top"|"bottom")=><div key={side} aria-hidden="true" className={`progressive-blur progressive-blur-${side} ${className}`} style={{height}}>{levels.map((blur,i)=>{
  const step=100/Math.max(1,levels.length),start=i*step,peak=(i+1)*step;
  const mask=i===levels.length-1?`linear-gradient(to ${side},transparent ${start}%,black 100%)`:`linear-gradient(to ${side},transparent ${Math.max(0,start-step)}%,black ${start}%,black ${peak}%,transparent ${Math.min(100,peak+step)}%)`;
  return <div key={i} style={{position:"absolute",inset:0,backdropFilter:`blur(${blur}px)`,WebkitBackdropFilter:`blur(${blur}px)`,maskImage:mask,WebkitMaskImage:mask,zIndex:i+1} as CSSProperties}/>;
 })}</div>;
 return position==="both"?<>{edge("top")}{edge("bottom")}</>:edge(position);
}
