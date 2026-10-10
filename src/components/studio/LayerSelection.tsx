export default function LayerSelection({radius,width,rise,y,index,profile=false}:{radius:number;width:number;rise:number;y:number;index:number;profile?:boolean}) {
 const outer=radius+6,inner=Math.max(0,radius-width-3);
 const circle=(r:number)=>`M${r} 0 A${r} ${r} 0 1 0 ${-r} 0 A${r} ${r} 0 1 0 ${r} 0Z`;
 const path=profile ? `M${-outer} ${y+7} Q0 ${y+24} ${outer} ${y+7} L${outer} ${y-rise-8} Q0 ${y-rise-18} ${-outer} ${y-rise-8}Z` : circle(outer)+(inner ? circle(inner) : "");
 return <g pointerEvents="none" aria-hidden="true">
  <path d={path} fill="#1b5049" fillOpacity=".035" fillRule="evenodd" stroke="white" strokeOpacity=".45" strokeWidth="4" strokeLinejoin="round"/>
  <path d={path} fill="none" stroke="#1b5049" strokeOpacity=".5" strokeWidth="1.8" strokeLinejoin="round"/>
  <g transform={`translate(0 ${profile ? 72 : 202})`}>
   <rect x="-47" y="-12" width="94" height="24" rx="5" fill="#1b5049" fillOpacity=".08"/>
   <text textAnchor="middle" dominantBaseline="central" fill="#1b5049" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">Layer {String(index+1).padStart(2,"0")} selected</text>
  </g>
 </g>;
}
