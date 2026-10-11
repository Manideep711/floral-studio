import {test} from "node:test";
import assert from "node:assert/strict";
import {createCardExport} from "../src/lib/share/export";
test("concurrent exports share a render; changes to capture or settings render again",async()=>{
 let calls=0;const render=createCardExport(async()=>{calls++;return new Blob(["card"]);});
 const capture=new Blob(["capture"]),settings={font:"Mallanna"},progress=()=>{};
 const first=render(capture,settings,progress),second=render(capture,settings,progress);
 assert.equal(first,second);await first;await render(capture,settings,progress);assert.equal(calls,1);
 await render(capture,{font:"Gidugu"},progress);await render(new Blob(["new angle"]),settings,progress);assert.equal(calls,3);
});
test("failed renders can retry the same edits instead of retaining a rejected promise",async()=>{
 let attempts=0;const render=createCardExport(async()=>{if(++attempts===1)throw new Error("Network unavailable");return new Blob(["recovered"]);});
 const capture=new Blob(),settings={text:"బతుకమ్మ"};
 await assert.rejects(render(capture,settings,()=>{}));
 assert.equal(await (await render(capture,settings,()=>{})).text(),"recovered");assert.equal(attempts,2);
 assert.equal(settings.text,"బతుకమ్మ");
});
