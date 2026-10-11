"use client";
import {useState,type CSSProperties,type ReactNode} from "react";
const stems=[
 {path:"M 20 60 C 6 45, 18 20, 36 13",x:36,y:13,leaf:"M 16 36 Q 2 24 6 16 Q 22 19 16 36"},
 {path:"M 164 34 C 165 16, 182 22, 185 5",x:185,y:5,leaf:"M 169 22 Q 151 15 155 5 Q 172 9 169 22"},
 {path:"M 361 58 C 380 45, 363 25, 382 14",x:382,y:14,leaf:"M 372 35 Q 389 31 392 42 Q 380 46 372 35"},
 {path:"M 87 76 C 78 88, 99 104, 109 98",x:109,y:98,leaf:"M 89 93 Q 73 93 73 104 Q 88 109 89 93"},
 {path:"M 274 74 C 293 82, 282 96, 305 99",x:305,y:99,leaf:"M 287 89 Q 307 79 307 88 Q 300 98 287 89"},
];
export default function GrowingTitle({children,delay=0}:{children:ReactNode;delay?:number}){
 const [startDelay]=useState(delay);
 return <span className="growing-title" style={{"--grow-delay":`${startDelay}s`} as CSSProperties}>{children}<svg className="title-garden" viewBox="0 0 400 112" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">{stems.map((stem,i)=><g key={stem.path} className={`title-sprout title-sprout-${i}`} style={{"--sprout-delay":`${i*.12}s`} as CSSProperties}><path className="title-stem" d={stem.path} pathLength={1}/><path className="title-leaf" d={stem.leaf}/><g transform={`translate(${stem.x} ${stem.y})`}><g className="title-bloom">{Array.from({length:6},(_,petal)=><ellipse key={petal} cx="0" cy="-5" rx="3.2" ry="5" transform={`rotate(${petal*60})`}/>)}<circle r="2.8" className="title-pollen"/></g></g></g>)}</svg></span>;
}
