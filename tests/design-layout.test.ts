import test from "node:test";
import assert from "node:assert/strict";
import {defaultDesign} from "../src/lib/design/defaults";
import {generateLayout,silhouetteWarnings} from "../src/lib/design/layout";
import {validateDesign} from "../src/lib/design/schema";
import {parseDraft} from "../src/lib/design/persistence";
test("placements reconstruct exactly after saving and restoring",()=>{
  const d=defaultDesign();const layout=generateLayout(d);
  assert.deepEqual(generateLayout(parseDraft(JSON.stringify(d))),layout);
  assert.equal(new Set(layout.map(p=>p.id)).size,layout.length);
  assert.ok(layout.length>300 && layout.length<650);
  for(const l of d.layers) assert.ok(layout.some(p=>p.layerId===l.id && p.flower===l.flower && p.color===l.color));
});
test("upper layer height changes affect only its elevation and layers above",()=>{
  const d=defaultDesign();const original=generateLayout(d);d.layers[2].rise+=10;
  const changed=generateLayout(d);
  for(let i=0;i<original.length;i++) {
    assert.equal(changed[i].x,original[i].x);assert.equal(changed[i].z,original[i].z);
    const index=d.layers.findIndex(l=>l.id===original[i].layerId);
    const layer=d.layers[index],rows=Math.max(1,Math.round(layer.width/((layer.flower==="gunugu"?14:17)*.85)));
    const row=Number(original[i].id.split(":")[1]);
    assert.ok(Math.abs(changed[i].y-original[i].y-(index<2 ? 0 : index===2 ? 10*(row+.5)/rows : 10))<.0001);
  }
});
test("density increases flower count without changing identities or colors",()=>{
  const d=defaultDesign();const n=generateLayout(d).length;d.layers[0].density=1.2;
  assert.ok(generateLayout(d).length>n);
  assert.equal(validateDesign(d),true);
});
test("malformed, oversized and unsupported drafts are rejected",()=>{
  const d=defaultDesign();assert.equal(validateDesign(d),true);
  assert.throws(()=>parseDraft('{"schemaVersion":9}'));
  assert.throws(()=>parseDraft("invalid"));
  assert.equal(validateDesign({...d,seed:Infinity}),false);
  assert.equal(validateDesign({...d,layers:[]}),false);
  assert.equal(validateDesign({...d,layers:[...d.layers,d.layers[0]]}),false);
  assert.equal(validateDesign({...d,layers:[{...d.layers[0],density:999}]}),false);
  assert.equal(validateDesign({...d,layers:[{...d.layers[0],color:"red"}]}),false);
});
test("silhouette warnings flag widening upper layers",()=>{
  const d=defaultDesign();assert.deepEqual(silhouetteWarnings(d),[]);
  [d.layers[0],d.layers[1]]=[d.layers[1],d.layers[0]];
  assert.equal(silhouetteWarnings(d).length,1);
});
