import {mkdir,writeFile} from "node:fs/promises";
import sharp from "sharp";
import {templates,heights,templateDesign,type TemplateHeight} from "../src/lib/design/templates";
import {gardenThumbnail} from "../src/lib/garden/thumbnail";

// Use Next's existing Sharp renderer during the build, never in the client.
await mkdir("public/templates",{recursive:true});
let bytes=0;
for(const template of templates){
  for(const height of [undefined,...Object.keys(heights)] as (TemplateHeight|undefined)[]){
    const uri=gardenThumbnail(templateDesign(template.id,height),true);
    const svg=decodeURIComponent(uri.slice(uri.indexOf(",")+1));
    const image=await sharp(Buffer.from(svg)).resize(360,240).webp({quality:82}).toBuffer();
    await writeFile(`public/templates/${template.id}-${height??"original"}.webp`,image);
    bytes+=image.length;
  }
}
console.log(`Rendered ${templates.length*4} template previews (${Math.round(bytes/1024)} KB total).`);
