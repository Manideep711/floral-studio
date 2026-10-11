import test from "node:test";
import assert from "node:assert/strict";
import {guidedFrames,storyLayerDepth} from "../src/lib/three/story";
import {generateLayout} from "../src/lib/design/layout";
test("guided steps reuse exact flower placements without changing the completed arrangement",()=>{const frames=guidedFrames();for(const frame of frames)assert.deepEqual(frame.placements,generateLayout(frame.design));for(const p of frames[1].placements)assert(frames[2].placements.includes(p));assert.equal(frames[0].design,frames[4].design);});
test("new story layers ease over half a second while settled layers and reduced motion stay complete",()=>{assert.equal(storyLayerDepth(0,false,false),1);assert.equal(storyLayerDepth(0,true,false),0);assert.equal(storyLayerDepth(.25,true,false),.5);assert.equal(storyLayerDepth(.5,true,false),1);assert.equal(storyLayerDepth(0,true,true),1);});
