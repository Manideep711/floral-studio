import test from "node:test";
import assert from "node:assert/strict";
import {makeFlowerGeometry,makeGardenFlowerGeometry} from "../src/lib/three/flowers";
import {revealAt,REVEAL_SECONDS} from "../src/lib/three/reveal";
import {defaultDesign} from "../src/lib/design/defaults";
import {generateLayout} from "../src/lib/design/layout";
import {webglAvailable} from "../src/lib/three/support";
test("WebGL detection handles an unavailable or throwing context and releases successful probes",()=>{
  assert.equal(webglAvailable(()=>({getContext:()=>null}) as unknown as HTMLCanvasElement),false);
  assert.equal(webglAvailable(()=>{throw new Error("Context creation failed");}),false);
  let released=false;
  assert.equal(webglAvailable(()=>({getContext:()=>({getExtension:()=>({loseContext:()=>{released=true;}})})}) as unknown as HTMLCanvasElement),true);
  assert.equal(released,true);
});
test("layout v2 preserves v1 top-view placements while adding inward elevation",()=>{
  const d=defaultDesign(),old=generateLayout({...d,layoutVersion:1}),next=generateLayout(d);
  assert.deepEqual(old.map(({y,...p})=>p),next.map(({y,...p})=>p));
  const band=next.filter(p=>p.layerId===d.layers[0].id);assert.ok(new Set(band.map(p=>p.y)).size>1);
});
test("four original flower geometries have valid positions, normals, colors and distinct silhouettes",()=>{
  const geometries=(["tangedu","gunugu","banti","rose"] as const).map(kind=>makeFlowerGeometry(kind));
  const counts=geometries.map(g=>g.attributes.position.count);
  assert.equal(new Set(counts).size,4);
  geometries.forEach(g=>{assert.ok(g.attributes.position.count>100);assert.equal(g.attributes.position.count,g.attributes.normal.count);assert.equal(g.attributes.position.count,g.attributes.color.count);for(const n of g.attributes.position.array)assert.ok(Number.isFinite(n));g.dispose();});
});
test("all layers arrive at the same complete state, including skip and reduced-motion timing",()=>{
  assert.equal(revealAt(0).depth,0);assert.equal(revealAt(0).phase,"Anticipation");
  assert.equal(revealAt(2).phase,"Transformation");assert.equal(revealAt(3.5).phase,"Bloom");
  for(let i=0;i<8;i++){const final=revealAt(REVEAL_SECONDS,i,8);assert.equal(final.depth,1);assert.equal(final.phase,"Exploration");assert.equal(final.camera,1);assert.equal(final.settle,0);}
});
test("detailed and mobile flowers retain finite shading variation and compact yellow petals",()=>{
  for(const light of [false,true])for(const kind of ["tangedu","gunugu","banti","rose"] as const){
    const geometry=makeFlowerGeometry(kind,light);
    for(const attribute of ["position","normal","color"]){for(const value of geometry.attributes[attribute].array)assert.ok(Number.isFinite(value),`${kind}: ${attribute}`);}
    const colors=geometry.attributes.color.array;
    assert.ok(new Set(Array.from(colors).map(v=>v.toFixed(4))).size>50,`${kind} retains pigment detail`);
    if(kind==="tangedu"){geometry.computeBoundingBox();assert.ok(geometry.boundingBox!.max.y<.08);assert.ok(geometry.boundingBox!.max.x-geometry.boundingBox!.min.x<.31);}
    geometry.dispose();
  }
});
test("instanced head reconstruction keeps every canonical flower without resampling",()=>{
  const placements=generateLayout(defaultDesign());
  const grouped=["tangedu","gunugu","banti","rose"].flatMap(id=>placements.filter(p=>p.flower===id));
  assert.equal(grouped.length,placements.length);assert.deepEqual(new Set(grouped.map(p=>p.id)),new Set(placements.map(p=>p.id)));
  const triangles=(["tangedu","gunugu","banti","rose"] as const).reduce((total,id)=>{const g=makeFlowerGeometry(id);const n=g.attributes.position.count/3*placements.filter(p=>p.flower===id).length;g.dispose();return total+n;},0);
  assert.ok(triangles<280000,`Detailed starter geometry contains ${triangles} triangles`);
  const lightTriangles=(["tangedu","gunugu","banti","rose"] as const).reduce((total,id)=>{const g=makeFlowerGeometry(id,true);const n=g.attributes.position.count/3*placements.filter(p=>p.flower===id).length;g.dispose();return total+n;},0);
  assert.ok(lightTriangles<200000,`Mobile geometry contains ${lightTriangles} triangles`);
  assert.ok(lightTriangles<triangles);
});

test("Garden distance meshes retain valid flower surfaces at a fraction of close-up cost",()=>{
 for(const kind of ["tangedu","gunugu","banti","rose"] as const){
  const low=makeGardenFlowerGeometry(kind),high=makeFlowerGeometry(kind,true);
  assert.ok(low.attributes.position.count<high.attributes.position.count*.2,`${kind}: ${low.attributes.position.count}/${high.attributes.position.count}`);
  assert.ok(low.attributes.position.count<=450);
  for(const name of ["position","normal","color"])assert.ok(Array.from(low.attributes[name].array).every(Number.isFinite));
  assert.ok(low.boundingSphere!.radius>0);
  low.dispose();high.dispose();
 }
});
