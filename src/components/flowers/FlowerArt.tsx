import type { FlowerId } from "@/lib/flowers/catalog";
import {memo} from "react";
// Original vector artwork. These specifications will also guide the 3D flower heads.
export function FlowerShape({kind,color}: {kind:FlowerId;color:string}) {
  if(kind==="rose")return <g>
    <circle r="12.5" fill={color}/>
    {[{n:9,r:8.5,s:1.1},{n:7,r:5.8,s:.9},{n:5,r:3.3,s:.7},{n:3,r:1.1,s:.5}].map((ring,k)=><g key={k}>{Array.from({length:ring.n},(_,i)=><g key={i} transform={`rotate(${i/ring.n*360+k*31}) translate(0 ${-ring.r}) scale(${ring.s})`}>
      <path d="M-5 2 C-8-1-6-6-1-6 C4-7 7-3 5 1 Q0 5-5 2Z" fill={color} stroke="#842A48" strokeOpacity=".48" strokeWidth=".65"/>
      <path d="M-5-2 Q0-7 4-3" fill="none" stroke="#FFF4EB" strokeOpacity=".65" strokeWidth=".85"/>
    </g>)}</g>)}
    <path d="M-2 1 C-4-3 3-4 3 0 C3 3-2 3-1 0 Q0-2 1 0" fill="none" stroke="#842A48" strokeOpacity=".7" strokeWidth="1"/>
  </g>;
  if(kind === "tangedu") return <g>
    {[0,72,144,216,288].map((a,i)=><g key={a} transform={`rotate(${a})`}>
      <path d={i===0 ? "M0 0 C-6-3-10-12-4-16 C3-20 10-11 6-4Z" : "M0 0 C-7-3-12-11-6-16 C2-20 11-14 8-6 C6-1 2 1 0 0Z"} fill={color} stroke="#BA862D" strokeWidth=".32"/>
      <path d="M1 -3 Q-1 -8 -3 -12" fill="none" stroke="#A96E21" strokeWidth=".5" opacity=".45"/>
    </g>)}
    <ellipse rx="2.1" ry="1.6" fill="#8D7634"/>
    {[-1.5,0,1.5].map((x,i)=><g key={x}><path d={`M${x} 0 Q${x+2} 3 ${x+3} ${4+i}`} stroke="#847131" fill="none" strokeWidth=".65"/><ellipse cx={x+3} cy={4+i} rx=".65" ry="1.2" fill="#76612A"/></g>)}
  </g>;
  if(kind === "gunugu") return <g>
    <path d="M-1 12 L1 12 L.6 -2 L-.6 -2Z" fill="#657348"/>
    <path d="M0 -15 C-3-12-5-8-7-5 C-10 0-10 7-6 10 C-2 14 5 12 8 8 C11 3 8-3 6-7 C4-10 2-13 0-15Z" fill={color} stroke="#92526A" strokeWidth=".35"/>
    {Array.from({length:11},(_,i)=><g key={i} transform={`translate(0 ${-11+i*2})`}><path d={`M0 2 Q${-Math.min(8,2+i*.7)} 0 ${-Math.min(8,2+i*.7)} -1 M0 2 Q${Math.min(8,2+i*.7)} 0 ${Math.min(8,2+i*.7)} -1`} stroke={i%3 ? "#FFF3EC" : "#853F60"} opacity={i%3 ? ".35" : ".2"} fill="none" strokeWidth=".85"/></g>)}
  </g>;
  return <g>
    <circle r="13" fill={color}/>
    {[{n:19,r:11,s:1},{n:16,r:8.7,s:.95},{n:12,r:6.2,s:.87},{n:8,r:3.7,s:.78},{n:5,r:1.3,s:.65}].map((ring,k)=><g key={k}>{Array.from({length:ring.n},(_,i)=><g key={i} transform={`rotate(${(i/ring.n*360+k*23).toFixed(4)}) translate(0 ${-ring.r}) scale(${ring.s})`}>
      <path d="M0 4 C-3 3-5 0-4-3 Q-3-5-1-3 Q0-5 2-3 Q5-4 4-1 C4 2 2 4 0 4Z" fill={color} stroke="#B5742E" strokeWidth=".35"/><path d="M-1 2 Q-2 0-1-2 M1 2 Q2 0 2-1" stroke="#FFE8AD" opacity=".43" strokeWidth=".6"/>
    </g>)}</g>)}
  </g>;
}
function FlowerArt({kind,color,size=44}: {kind:FlowerId;color:string;size?:number}) {
  return <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true"><FlowerShape kind={kind} color={color}/></svg>;
}
export default memo(FlowerArt);
