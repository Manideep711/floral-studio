import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
// A tiny static tile. No live noise filter or animation on the user's device.
const pixels=Buffer.alloc(64*64*4);let seed=9173;
for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=seed%22;}
await mkdir('public/textures',{recursive:true});
await sharp(pixels,{raw:{width:64,height:64,channels:4}}).png().toFile('public/textures/surface-grain.png');
