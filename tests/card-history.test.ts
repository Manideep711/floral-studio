import {test} from "node:test";
import assert from "node:assert/strict";
import {cardHistory,createHistory} from "../src/lib/share/history";
test("a continuous drag undoes once and can be redone",()=>{
 let state=createHistory({x:50});
 state=cardHistory(state,{type:"begin"});
 for(let x=51;x<=80;x++)state=cardHistory(state,{type:"edit",update:()=>({x})});
 state=cardHistory(state,{type:"end"});
 assert.equal(state.past.length,1);
 state=cardHistory(state,{type:"undo"});assert.equal(state.present.x,50);
 state=cardHistory(state,{type:"redo"});assert.equal(state.present.x,80);
});
test("new edits discard redo, restoration clears history, and empty gestures add nothing",()=>{
 let state=createHistory(0);
 state=cardHistory(state,{type:"begin"});state=cardHistory(state,{type:"end"});assert.equal(state.past.length,0);
 state=cardHistory(state,{type:"edit",update:()=>1});state=cardHistory(state,{type:"undo"});
 state=cardHistory(state,{type:"edit",update:()=>2});assert.equal(state.future.length,0);
 state=cardHistory(state,{type:"reset",value:3});assert.deepEqual(state,createHistory(3));
});
test("undo completes an active edit and history stays bounded",()=>{
 let state=createHistory(0);
 for(let i=1;i<=60;i++)state=cardHistory(state,{type:"edit",update:()=>i});
 assert.equal(state.past.length,50);
 state=cardHistory(state,{type:"begin"});state=cardHistory(state,{type:"edit",update:()=>100});
 state=cardHistory(state,{type:"undo"});assert.equal(state.present,60);assert.equal(state.baseline,null);
});
