import {fittedBloom} from "./position";
import QRCode from "qrcode";
import {gardenClient} from "../garden/client";
export type CardText={title:string;name:string;message:string};
export type CardLayer={id:string;text:string;font:string;size:number;color:string;x:number;y:number;rotation:number;align:"left"|"center"|"right"};
export type CardTemplate={id:string;name:string;image_url:string;enabled:boolean;sort_order:number};
export const CARD_FONTS=["Lora","Poppins","Instrument Serif","Instrument Sans","Satoshi","Clash Display","Mallanna","Gidugu","Lohit Telugu","Annamayya","Chathura","RaviPrakash","LakkiReddy"];
export const CARD_TEMPLATES:CardTemplate[]=Array.from({length:5},(_,i)=>({id:`floral-${i+1}`,name:["Petal frame","Festival arch","Floral corners","Golden garlands","Garden light"][i],image_url:`/cards/floral-${i+1}.webp`,enabled:true,sort_order:i}));
export type CardSettings={background:string;layers:CardLayer[];bloom:{visible:boolean;x:number;y:number;scale:number;rotation:number};link:{visible:boolean;url:string;label:string;qr:boolean;x:number;y:number}};
export function blankCard():CardSettings{return {background:CARD_TEMPLATES[0].image_url,layers:[],bloom:{visible:true,x:50,y:62,scale:82,rotation:0},link:{visible:false,url:"",label:"",qr:false,x:50,y:89}};}
export async function cardTemplates(){const client=gardenClient();if(!client)return CARD_TEMPLATES;const {data,error}=await client.from("card_templates").select("*").eq("enabled",true).order("sort_order");return error?CARD_TEMPLATES:(data as CardTemplate[]);}
export function shareSiteUrl(){return location.hostname==="localhost"||location.hostname==="127.0.0.1" ? "https://floral-studio-eotc.vercel.app/" : location.origin+"/";}
export const CARD_WIDTH=1080,CARD_HEIGHT=1620;
export function wrapCardText(text:string,measure:(s:string)=>number,width:number,maxLines:number){
 const lines:string[]=[];let line="";
 for(const character of Array.from(text.trim())){if(character==="\n"){lines.push(line);line="";}else if(line&&measure(line+character)>width){lines.push(line.trimEnd());line=character.trimStart();}else line+=character;if(lines.length>=maxLines)break;}
 if(lines.length<maxLines&&line)lines.push(line);
 if(lines.length===maxLines&&text.trim().length>lines.join("").length){let last=lines[maxLines-1];while(last&&measure(last+"…")>width)last=last.slice(0,-1);lines[maxLines-1]=last+"…";}
 return lines;
}
const imageCache=new Map<string,Promise<HTMLImageElement>>();
function loadImage(url:string){const cached=imageCache.get(url);if(cached)return cached;const pending=new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.crossOrigin="anonymous";const fail=()=>{clearTimeout(timer);img.onload=null;img.onerror=null;imageCache.delete(url);reject(new Error("Could not load card image."));};const timer=setTimeout(fail,15000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=fail;img.src=url;});if(!url.startsWith("blob:")){if(imageCache.size>=16)imageCache.delete(imageCache.keys().next().value!);imageCache.set(url,pending);}return pending;}
const crops=new WeakMap<Blob,Promise<HTMLCanvasElement>>();
function cropArrangement(image:Blob){const cached=crops.get(image);if(cached)return cached;const pending=(async()=>{const url=URL.createObjectURL(image);try{const picture=await loadImage(url),source=document.createElement("canvas");source.width=picture.naturalWidth;source.height=picture.naturalHeight;const c=source.getContext("2d")!;c.drawImage(picture,0,0);const pixels=c.getImageData(0,0,source.width,source.height).data;let left=source.width,right=-1,top=source.height,bottom=-1;for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(pixels[(y*source.width+x)*4+3]>10){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}if(right<left)throw new Error("The arrangement capture was empty. Capture it again.");const crop=document.createElement("canvas");crop.width=Math.max(1,right-left+1);crop.height=Math.max(1,bottom-top+1);if(right>=left)crop.getContext("2d")!.drawImage(source,left,top,crop.width,crop.height,0,0,crop.width,crop.height);return crop;}finally{URL.revokeObjectURL(url);}})();crops.set(image,pending);pending.catch(()=>crops.delete(image));return pending;}
export async function fitCardArrangement(image:Blob){const crop=await cropArrangement(image);return fittedBloom(crop.width,crop.height);}
export async function makeCard(image:Blob,settings:CardSettings,preview=false,onProgress:(message:string)=>void=()=>{}):Promise<Blob>{
 const fontFamily=(font:string)=>font==="Lora"?'"Preview Lora"':font==="Poppins"?'"Preview Poppins"':font.startsWith("Instrument ")?`"Preview ${font}"`:`"${font}"`;
 // A failed optional remote font must not discard an otherwise valid card.
 onProgress("Loading your fonts…");
 await Promise.allSettled(settings.layers.map(l=>document.fonts.load(`${l.size}px ${fontFamily(l.font)}`,l.text||"అ")));await document.fonts.ready;
 const canvas=document.createElement("canvas");canvas.width=preview?360:CARD_WIDTH;canvas.height=preview?540:CARD_HEIGHT;const c=canvas.getContext("2d");if(!c)throw new Error("Image export unavailable.");
 c.scale(canvas.width/CARD_WIDTH,canvas.height/CARD_HEIGHT);
 c.fillStyle="#fff8e9";c.fillRect(0,0,CARD_WIDTH,CARD_HEIGHT);
 onProgress("Preparing the background…");
 if(settings.background){const bg=await loadImage(settings.background);c.drawImage(bg,0,0,CARD_WIDTH,CARD_HEIGHT);}
 onProgress("Rendering your arrangement…");
 if(settings.bloom.visible){const crop=await cropArrangement(image),width=CARD_WIDTH*settings.bloom.scale/100,height=width*crop.height/crop.width;c.save();c.translate(CARD_WIDTH*settings.bloom.x/100,CARD_HEIGHT*settings.bloom.y/100);c.rotate(settings.bloom.rotation*Math.PI/180);c.drawImage(crop,-width/2,-height/2,width,height);c.restore();}
 onProgress("Adding your text and link…");
 for(const layer of settings.layers){if(!layer.text.trim())continue;c.save();c.translate(CARD_WIDTH*layer.x/100,CARD_HEIGHT*layer.y/100);c.rotate(layer.rotation*Math.PI/180);c.textAlign=layer.align;c.textBaseline="middle";c.fillStyle=layer.color;c.font=`${layer.size}px ${fontFamily(layer.font)},"Noto Sans Telugu",sans-serif`;wrapCardText(layer.text,s=>c.measureText(s).width,900,6).forEach((line,i)=>c.fillText(line,0,i*layer.size*1.45));c.restore();}
 if(settings.link.visible){const {url,label,qr,x,y}=settings.link;c.textAlign="center";c.fillStyle="#1b5049";c.font='24px "Segoe UI",sans-serif';if(label)c.fillText(label,CARD_WIDTH*x/100,CARD_HEIGHT*y/100,800);if(url)c.fillText(url,CARD_WIDTH*x/100,CARD_HEIGHT*y/100+38,800);if(qr&&/^https?:\/\//.test(url)){const code=await loadImage(await QRCode.toDataURL(url,{margin:1,color:{dark:"#1b5049",light:"#ffffff00"}}));c.drawImage(code,CARD_WIDTH*x/100-55,CARD_HEIGHT*y/100+60,110,110);}}
 onProgress("Creating your image…");
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Image export failed.")),"image/png"));
}
