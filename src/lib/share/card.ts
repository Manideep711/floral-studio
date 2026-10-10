import {LOGO_PATH} from "../brand/logo";
export type CardText={title:string;name:string;message:string};
export const CARD_WIDTH=1080,CARD_HEIGHT=1350;
export function wrapCardText(text:string,measure:(s:string)=>number,width:number,maxLines:number){
  const lines:string[]=[];let line="";
  for(const character of Array.from(text.trim())){if(character==="\n"){lines.push(line);line="";}else if(line&&measure(line+character)>width){lines.push(line.trimEnd());line=character.trimStart();}else line+=character;if(lines.length>=maxLines)break;}
  if(lines.length<maxLines&&line)lines.push(line);
  if(lines.length===maxLines&&text.trim().length>lines.join("").length){let last=lines[maxLines-1];while(last&&measure(last+"…")>width)last=last.slice(0,-1);lines[maxLines-1]=last+"…";}
  return lines;
}
export async function makeCard(image:Blob,text:CardText):Promise<Blob>{
  await document.fonts.load('32px "Noto Sans Telugu"');await document.fonts.ready;
  const canvas=document.createElement("canvas");canvas.width=CARD_WIDTH;canvas.height=CARD_HEIGHT;const context=canvas.getContext("2d");if(!context)throw new Error("Image export is unavailable.");const c:CanvasRenderingContext2D=context;
  c.fillStyle="#faf5e8";c.fillRect(0,0,CARD_WIDTH,CARD_HEIGHT);
  c.strokeStyle="#bb9350";c.lineWidth=2;c.strokeRect(36,36,1008,1278);c.strokeStyle="#e0cc9d";c.strokeRect(46,46,988,1258);
  function blossom(x:number,y:number){c.save();c.translate(x,y);for(let i=0;i<12;i++){c.rotate(Math.PI/6);c.fillStyle=i%2 ? "#ecb342" : "#e6a137";c.beginPath();c.ellipse(0,-21,7,18,0,0,Math.PI*2);c.fill();}c.fillStyle="#bc733b";c.beginPath();c.arc(0,0,10,0,Math.PI*2);c.fill();c.restore();}
  for(const [x,y] of [[90,90],[990,90],[90,1260],[990,1260]])blossom(x,y);
  c.textAlign="center";c.fillStyle="#987745";c.font='18px "Segoe UI", "Noto Sans Telugu", sans-serif';c.fillText("A FLORAL CELEBRATION OF TELANGANA",540,119);
  c.fillStyle="#304f3c";c.font='56px Georgia,"Noto Sans Telugu",serif';const title=wrapCardText(text.title||"My Bathukamma",s=>c.measureText(s).width,840,2);title.forEach((line,i)=>c.fillText(line,540,205+i*67));
  const imageUrl=URL.createObjectURL(image);
  try{const picture=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Image could not load"));img.src=imageUrl;});const scale=Math.min(940/picture.naturalWidth,760/picture.naturalHeight);c.drawImage(picture,540-picture.naturalWidth*scale/2,315+(760-picture.naturalHeight*scale)/2,picture.naturalWidth*scale,picture.naturalHeight*scale);}finally{URL.revokeObjectURL(imageUrl);}
  c.fillStyle="#304f3c";c.font='28px Georgia,"Noto Sans Telugu",serif';if(text.name.trim())c.fillText(`Flowers by ${text.name.trim()}`,540,1120,840);
  c.fillStyle="#777e66";c.font='25px "Segoe UI", "Noto Sans Telugu", sans-serif';wrapCardText(text.message,s=>c.measureText(s).width,820,3).forEach((line,i)=>c.fillText(line,540,1171+i*34));
  c.save();c.translate(365,1258);c.scale(32/470,32/470);c.translate(-280,-280);c.fillStyle="#1b5049";c.fill(new Path2D(LOGO_PATH));c.restore();
  c.fillStyle="#a18857";c.font='18px Georgia,"Noto Sans Telugu",serif';c.fillText("Made by you · Shared with love",540,1280);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob ? resolve(blob) : reject(new Error("Image export failed.")),"image/png"));
}
