/** Snap within six screen pixels, keeping touch and desktop alignment consistent. */
export function snapCardPosition(x:number,y:number,width:number,height:number){
 const snap=(value:number,pixels:number)=>Math.abs(value-50)*pixels/100<=6?50:Math.max(0,Math.min(100,value));
 return {x:snap(x,width),y:snap(y,height)};
}
/** Leave nine percent of the card clear on each edge. */
export function fittedBloom(width:number,height:number){
 if(width<=0||height<=0||!Number.isFinite(width+height))throw new Error("Invalid arrangement dimensions");
 return {visible:true,x:50,y:50,scale:Math.min(82,82*1.5*width/height),rotation:0};
}
