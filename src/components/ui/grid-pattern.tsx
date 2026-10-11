"use client";
import {useId,type SVGProps} from "react";
// Static SVG pattern inspired by Magic UI Grid Pattern (MIT).
export function GridPattern({width=40,height=40,x=-1,y=-1,squares=[],strokeDasharray="0",className="",...props}:Omit<SVGProps<SVGSVGElement>,"width"|"height"|"x"|"y">&{width?:number;height?:number;x?:number;y?:number;squares?:[number,number][];strokeDasharray?:string}){
 const id=useId();
 return <svg aria-hidden="true" className={className} {...props}><defs><pattern id={id} width={width} height={height} x={x} y={y} patternUnits="userSpaceOnUse"><path d={`M ${width} 0 L 0 0 0 ${height}`} fill="none" stroke="currentColor" strokeWidth=".5" strokeDasharray={strokeDasharray}/></pattern></defs><rect width="100%" height="100%" fill={`url(#${id})`}/>{squares.map(([col,row],i)=><rect key={i} x={col*width+x} y={row*height+y} width={width} height={height} fill="currentColor" fillOpacity=".15"/>)}</svg>;
}
