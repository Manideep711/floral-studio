export const REVEAL_SECONDS=4.4;
export const smooth=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function revealAt(seconds:number,layerIndex=0,layerCount=1) {
  const depth=smooth((seconds-.65-layerIndex/Math.max(1,layerCount)*.45)/2.35);
  return {phase:seconds<.65 ? "Anticipation" : seconds<3.2 ? "Transformation" : seconds<REVEAL_SECONDS ? "Bloom" : "Exploration",depth,camera:smooth((seconds-.65)/2.7),settle:Math.sin(Math.max(0,seconds-3.2)*Math.PI*2)*.025*(1-smooth((seconds-3.2)/1.2))};
}
