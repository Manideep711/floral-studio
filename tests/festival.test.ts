import assert from "node:assert/strict";
import test from "node:test";
import {defaultDesign} from "../src/lib/design/defaults";
import {validateDesign} from "../src/lib/design/schema";
import {generateLayout} from "../src/lib/design/layout";
import {publicSnapshot,sampleEntries} from "../src/lib/garden/model";
import {festivalHeads,festivalPosition,nearbyEntries,stableNearbyEntries,FESTIVAL_LIMIT} from "../src/lib/garden/festival";
test("Accent ring adds exactly the requested equally spaced heads without changing the original placements",()=>{
  const d=defaultDesign(),original=generateLayout(d);d.layers[0].accent={flower:"gunugu",color:"#DCA7BA",count:12};const withAccents=generateLayout(d),accents=withAccents.filter(p=>p.accent);assert.equal(accents.length,12);assert.deepEqual(withAccents.filter(p=>!p.accent),original);assert.equal(new Set(withAccents.map(p=>p.id)).size,withAccents.length);
  const radius=Math.hypot(accents[0].x,accents[0].z);for(let i=0;i<12;i++){assert(Math.abs(Math.hypot(accents[i].x,accents[i].z)-radius)<.001);if(i>0)assert(Math.abs(accents[i].rotation-accents[i-1].rotation-2*Math.PI/12)<.001);assert(accents[i].scale>1.5);}
  assert.deepEqual(generateLayout(JSON.parse(JSON.stringify(d))),withAccents);
});
test("Accent validation rejects malformed flowers, colors and counts and public snapshots preserve only visual fields",()=>{const d=defaultDesign();for(const count of [0,3,25,Infinity,12.5]){d.layers[0].accent={flower:"banti",color:"#E98333",count};assert(!validateDesign(d));}d.layers[0].accent={flower:"banti",color:"#E98333",count:12};Object.assign(d.layers[0].accent,{private:"secret"});const copy=publicSnapshot(d,"title");assert(validateDesign(copy));assert.deepEqual(copy.layers[0].accent,{flower:"banti",color:"#E98333",count:12});});
test("Festival world preserves every design placement and positions stable slots without overlaps",()=>{const entries=sampleEntries(),heads=festivalHeads(entries,entries[0].slot);assert.equal(heads.length,entries.reduce((s,e)=>s+generateLayout(e.design).length,0));for(const e of entries){const p=festivalPosition(e.slot,entries[0].slot),own=heads.filter(h=>h.entryId===e.id);assert(own.every(h=>Math.abs(h.worldX-p.x-h.x*.01)<1e-9));}const positions=entries.map(e=>festivalPosition(e.slot,1));for(let i=0;i<positions.length;i++)for(let j=0;j<i;j++)assert(Math.hypot(positions[i].x-positions[j].x,positions[i].z-positions[j].z)>4);});
test("Festival limits active arrangements while allowing traversal to distant loaded entries",()=>{const sample=sampleEntries()[0],many=Array.from({length:200},(_,i)=>({...sample,id:`entry-${i}`,slot:i+1}));assert.equal(nearbyEntries(many,1,0,0).length,FESTIVAL_LIMIT);const p=festivalPosition(200,1);assert.equal(nearbyEntries(many,1,p.x,p.z)[0].entry.slot,200);});

test("Panning keeps existing visible slots and only replaces arrangements outside the view",()=>{
 const sample=sampleEntries()[0],entries=Array.from({length:100},(_,i)=>({...sample,id:`entry-${i}`,slot:i+1}));
 const inView=new Set(entries.map(e=>e.id));
 const original=stableNearbyEntries(entries,1,0,0,[],inView,12);
 const moved=stableNearbyEntries(entries,1,6,0,original.map(p=>p.entry.id),inView,12);
 assert.deepEqual(moved.map(p=>({id:p.entry.id,x:p.x,z:p.z})),original.map(p=>({id:p.entry.id,x:p.x,z:p.z})));
 inView.delete(original[0].entry.id);
 const next=stableNearbyEntries(entries,1,6,0,original.map(p=>p.entry.id),inView,12);
 assert.equal(next.length,12);
 assert.ok(!next.some(p=>p.entry.id===original[0].entry.id));
 for(const p of original.slice(1))assert.deepEqual(next.find(n=>n.entry.id===p.entry.id),p);
});
