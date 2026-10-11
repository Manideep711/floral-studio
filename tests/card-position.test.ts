import {test} from "node:test";
import assert from "node:assert/strict";
import {fittedBloom,snapCardPosition} from "../src/lib/share/position";
test("center snapping uses screen pixels and clamps beyond the card",()=>{
 assert.deepEqual(snapCardPosition(51,49,200,300),{x:50,y:50});
 assert.deepEqual(snapCardPosition(54,46,200,300),{x:54,y:46});
 assert.deepEqual(snapCardPosition(-20,120,200,300),{x:0,y:100});
 assert.equal(snapCardPosition(51,50,1000,1500).x,51);
});
test("fit keeps wide plates and tall arrangements within the inset on all edges",()=>{
 for(const [width,height] of [[1200,500],[600,1400],[1000,1000]]){
  const bloom=fittedBloom(width,height),renderWidth=1080*bloom.scale/100,renderHeight=renderWidth*height/width;
  assert.ok(renderWidth<=1080*.82+.001);assert.ok(renderHeight<=1620*.82+.001);
  assert.equal(bloom.x,50);assert.equal(bloom.y,50);assert.equal(bloom.rotation,0);
 }
 assert.throws(()=>fittedBloom(0,100));
});
