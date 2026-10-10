import test from "node:test";
import assert from "node:assert/strict";
import {guidedDesign} from "../src/lib/design/guided";
import {defaultDesign,addLayer} from "../src/lib/design/defaults";
import {validateDesign} from "../src/lib/design/schema";
import {generateLayout,silhouetteWarnings} from "../src/lib/design/layout";
import {parseDraft} from "../src/lib/design/persistence";
import {commit,initialHistory,undo} from "../src/lib/design/history";
import {templateDesign,templates} from "../src/lib/design/templates";
test("guided layers build progressively from Tangedu and transfer with one-step draft recovery",()=>{
  for(const step of [1,2,3,4]){
    const design=guidedDesign(step);assert.ok(validateDesign(design));
    assert.equal(design.layers.length,step===4 ? 5 : step);
    assert.equal(design.layers[0].flower,"tangedu");assert.deepEqual(silhouetteWarnings(design),[]);
  }
  const original=defaultDesign();original.personalization.title="My saved flowers";
  const restored=parseDraft(JSON.stringify(guidedDesign()));
  assert.deepEqual(undo(commit(initialHistory(original),restored)).present,original);
});
test("added upper layers taper through layer eight and tiny crowns survive save/restore",()=>{
  const design=defaultDesign();
  for(let i=5;i<8;i++){
    const previous=design.layers.at(-1)!,next=addLayer(design,`added-${i}`);
    assert.ok(next.radius<previous.radius);assert.ok(next.width<=next.radius);design.layers.push(next);
  }
  assert.ok(validateDesign(design));assert.deepEqual(silhouetteWarnings(design),[]);
  design.layers.at(-1)!.radius=8;design.layers.at(-1)!.width=8;
  assert.ok(validateDesign(design));assert.deepEqual(generateLayout(parseDraft(JSON.stringify(design))),generateLayout(design));
});
test("size templates use clear names and distinct size/layer combinations",()=>{
  assert.deepEqual(templates.slice(0,4).map(t=>t.name),["Mini","Small","Medium","Large"]);
  const designs=(["mini","small","medium","big"] as const).map(id=>templateDesign(id));
  assert.deepEqual(designs.map(d=>d.layers.length),[3,5,7,7]);
  assert.ok(designs[0].layers[0].radius<designs[1].layers[0].radius);
  assert.ok(designs[1].layers[0].radius<designs[2].layers[0].radius);
  assert.ok(designs[2].layers[0].radius<designs[3].layers[0].radius);
});
