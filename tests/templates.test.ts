import test from "node:test";
import assert from "node:assert/strict";
import {templates,templateDesign,heights,type TemplateHeight} from "../src/lib/design/templates";
import {validateDesign} from "../src/lib/design/schema";
import {generateLayout,placementCount,silhouetteWarnings} from "../src/lib/design/layout";
import {commit,initialHistory,undo} from "../src/lib/design/history";
import {defaultDesign} from "../src/lib/design/defaults";
import markup from "../src/lib/garden/flower-markup.json";
import {gardenThumbnail} from "../src/lib/garden/thumbnail";
import {readFile} from "node:fs/promises";
import sharp from "sharp";

test("all template height previews are ready-to-display images within the mobile budget",async()=>{
  for(const {id} of templates){
    for(const height of ["original",...Object.keys(heights)]){
      const data=await readFile(new URL(`../public/templates/${id}-${height}.webp`,import.meta.url));
      assert.ok(data.length<20_000,`${id}/${height} exceeds the preview budget`);
      const metadata=await sharp(data).metadata();
      assert.equal(metadata.format,"webp");
      assert.equal(metadata.width,360);assert.equal(metadata.height,240);
    }
  }
});

test("height presets are independent of footprint, flower arrangement and layer count",()=>{
  for(const {id} of templates){
    const original=templateDesign(id);
    for(const height of Object.keys(heights) as TemplateHeight[]){
      const design=templateDesign(id,height);
      assert.ok(validateDesign(design),`${id}/${height}`);
      assert.deepEqual(design.layers.map(({rise,...rest})=>rest),original.layers.map(({rise,...rest})=>rest));
      assert.ok(design.layers.every(l=>l.rise===heights[height].rise));
      const profile=decodeURIComponent(gardenThumbnail(design,true).split(",")[1]);
      assert.equal((profile.match(/<use /g)||[]).length,generateLayout(design).filter(p=>p.z>=-5).length);
    }
  }
  const wideShort=templateDesign("big","short"),narrowTall=templateDesign("small","tall");
  assert.ok(wideShort.layers[0].radius>narrowTall.layers[0].radius);
  assert.ok(wideShort.layers.reduce((sum,l)=>sum+l.rise,0)<narrowTall.layers.reduce((sum,l)=>sum+l.rise,0));
});

test("every template survives validation and has artwork for every canonical head",()=>{
  for(const {id} of templates){
    const design=templateDesign(id);
    assert.ok(validateDesign(design),id);
    assert.deepEqual(silhouetteWarnings(design),[],id);
    const heads=generateLayout(design);
    assert.equal(heads.length,placementCount(design));
    for(const head of heads)assert.ok((markup as Record<string,string>)[`${head.flower}:${head.color}`]);
  }
});
test("template application is undoable and editing one copy never mutates another",()=>{
  const original=defaultDesign();original.layers[0].radius=170;
  const template=templateDesign("colourful");
  const history=commit(initialHistory(original),template);
  assert.deepEqual(undo(history).present,original);
  template.layers[0].radius=150;template.layers[2].accent!.count=24;
  assert.equal(templateDesign("colourful").layers[0].radius,180);
  assert.equal(templateDesign("colourful").layers[2].accent!.count,12);
});
