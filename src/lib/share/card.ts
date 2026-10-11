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
function loadImage(url:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Could not load card image."));img.src=url;});}
export async function makeCard(image:Blob,settings:CardSettings):Promise<Blob>{
 const fontFamily=(font:string)=>{const css=getComputedStyle(document.documentElement);return font==="Lora"?css.getPropertyValue("--font-editorial").trim():font==="Poppins"?css.getPropertyValue("--font-interface").trim():font.startsWith("Instrument ")?`"Preview ${font}"`:`"${font}"`;};
 await Promise.all(settings.layers.map(l=>document.fonts.load(`${l.size}px ${fontFamily(l.font)}`,l.text||"అ")));await document.fonts.ready;
 const canvas=document.createElement("canvas");canvas.width=CARD_WIDTH;canvas.height=CARD_HEIGHT;const c=canvas.getContext("2d");if(!c)throw new Error("Image export unavailable.");
 c.fillStyle="#fff8e9";c.fillRect(0,0,CARD_WIDTH,CARD_HEIGHT);
 if(settings.background){const bg=await loadImage(settings.background);c.drawImage(bg,0,0,CARD_WIDTH,CARD_HEIGHT);}
 if(settings.bloom.visible){const url=URL.createObjectURL(image);try{const picture=await loadImage(url);const crop=document.createElement("canvas");crop.width=picture.naturalWidth;crop.height=picture.naturalHeight;const cc=crop.getContext("2d")!;cc.drawImage(picture,0,0);const pixels=cc.getImageData(0,0,crop.width,crop.height).data;let left=crop.width,right=0,top=crop.height,bottom=0;for(let y=0;y<crop.height;y++)for(let x=0;x<crop.width;x++)if(pixels[(y*crop.width+x)*4+3]>10){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}if(right>left){const sw=right-left+1,sh=bottom-top+1,width=CARD_WIDTH*settings.bloom.scale/100,height=width*sh/sw;c.save();c.translate(CARD_WIDTH*settings.bloom.x/100,CARD_HEIGHT*settings.bloom.y/100);c.rotate(settings.bloom.rotation*Math.PI/180);c.drawImage(picture,left,top,sw,sh,-width/2,-height/2,width,height);c.restore();}}finally{URL.revokeObjectURL(url);}}
 for(const layer of settings.layers){if(!layer.text.trim())continue;c.save();c.translate(CARD_WIDTH*layer.x/100,CARD_HEIGHT*layer.y/100);c.rotate(layer.rotation*Math.PI/180);c.textAlign=layer.align;c.textBaseline="middle";c.fillStyle=layer.color;c.font=`${layer.size}px ${fontFamily(layer.font)},"Noto Sans Telugu",sans-serif`;wrapCardText(layer.text,s=>c.measureText(s).width,900,6).forEach((line,i)=>c.fillText(line,0,i*layer.size*1.45));c.restore();}
 if(settings.link.visible){const {url,label,qr,x,y}=settings.link;c.textAlign="center";c.fillStyle="#1b5049";c.font='24px "Segoe UI",sans-serif';if(label)c.fillText(label,CARD_WIDTH*x/100,CARD_HEIGHT*y/100,800);if(url)c.fillText(url,CARD_WIDTH*x/100,CARD_HEIGHT*y/100+38,800);if(qr&&/^https?:\/\//.test(url)){const code=await loadImage(await QRCode.toDataURL(url,{margin:1,color:{dark:"#1b5049",light:"#ffffff00"}}));c.drawImage(code,CARD_WIDTH*x/100-55,CARD_HEIGHT*y/100+60,110,110);}}
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Image export failed.")),"image/png"));
}
