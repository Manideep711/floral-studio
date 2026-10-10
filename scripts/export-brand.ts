import {logoSvg} from "../src/lib/brand/logo";
import {mkdir,writeFile} from "node:fs/promises";
import sharp from "sharp";
await mkdir("public/brand",{recursive:true});
const svg=logoSvg();
await writeFile("public/brand/logo.svg",svg);
await Promise.all([
 sharp(Buffer.from(svg)).resize(32,32).png().toFile("public/brand/icon-32.png"),
 sharp(Buffer.from(svg)).resize(160,160).extend({top:10,bottom:10,left:10,right:10,background:"#f5f7f8"}).flatten({background:"#f5f7f8"}).png().toFile("public/brand/apple-touch-icon.png")
]);
