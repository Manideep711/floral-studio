import test from "node:test";
import assert from "node:assert/strict";
import {defaultDesign} from "../src/lib/design/defaults";
import {initialHistory,commit,undo,redo} from "../src/lib/design/history";
test("undo and redo restore complete designs",()=>{
  const before=defaultDesign();const after={...before,layers:before.layers.map((l,i)=>i===0 ? {...l,density:1.1} : l)};
  const h=commit(initialHistory(before),after);
  assert.deepEqual(undo(h).present,before);
  assert.deepEqual(redo(undo(h)).present,after);
  assert.equal(h.past.length,1);
});
test("a new edit after undo clears redo; identical edit adds no history",()=>{
  const d=defaultDesign();const h=initialHistory(d);
  assert.equal(commit(h,structuredClone(d)),h);
  const edited=commit(h,{...d,seed:1});
  const branched=commit(undo(edited),{...d,seed:2});
  assert.equal(branched.future.length,0);
  assert.equal(branched.present.seed,2);
});
test("history is bounded and empty undo/redo are safe",()=>{
  let h=initialHistory(defaultDesign());assert.equal(undo(h),h);assert.equal(redo(h),h);
  for(let i=0;i<100;i++) h=commit(h,{...h.present,seed:i});
  assert.equal(h.past.length,60);
});
