import test from "node:test";
import assert from "node:assert/strict";
import {canInspect,detailCandidates,isOwnedEntry} from "../src/lib/garden/inspection";
test("Garden detail is close-only, camera-prioritized and budgeted",()=>{
 const candidate=(id:string,distance:number,count=300,onScreen=true)=>({id,distance,count,onScreen});
 assert.deepEqual(detailCandidates([candidate("far",20),candidate("offscreen",4,300,false)],false),[]);
 assert.deepEqual(detailCandidates([candidate("behind",13),candidate("near",6),candidate("next",8)],true),["near","next"]);
 assert.deepEqual(detailCandidates([candidate("large",7,2000),candidate("next",8)],true),["large"]);
 assert.deepEqual(detailCandidates([candidate("large",12,2000)],true),[]);
});
test("Distant, offscreen and simplified blooms never expose inspection actions",()=>{
 assert.equal(canInspect(11,true,true),false);
 assert.equal(canInspect(5,false,true),false);
 assert.equal(canInspect(5,true,false),false);
 assert.equal(canInspect(9,true,true),true);
});
test("Only entries loaded from the signed-in owner's list offer editing",()=>{
 assert.equal(isOwnedEntry("other",[{id:"mine"}]),false);
 assert.equal(isOwnedEntry("mine",[]),false);
 assert.equal(isOwnedEntry("mine",[{id:"mine"}]),true);
});

test("Detail stays stable near the distance boundary and releases outside the exit band",()=>{
 const candidate=(distance:number)=>[{id:"bloom",distance,count:300,onScreen:true}];
 assert.deepEqual(detailCandidates(candidate(14.5),false),[]);
 assert.deepEqual(detailCandidates(candidate(14.5),false,["bloom"]),["bloom"]);
 assert.deepEqual(detailCandidates(candidate(17.5),false,["bloom"]),[]);
});
