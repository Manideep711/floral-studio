import test from "node:test";
import assert from "node:assert/strict";
import {blankCard} from "../src/lib/share/card";
import {validCardDraft} from "../src/lib/share/draft";
test("card draft accepts saved custom text and image backgrounds, rejects damaged settings",()=>{const s=blankCard();s.background="data:image/png;base64,abcd";s.layers=[{id:"text",text:"బతుకమ్మ",font:"Gidugu",size:56,color:"#1b5049",x:50,y:25,rotation:0,align:"center"}];assert(validCardDraft(s));assert(!validCardDraft(null));assert(!validCardDraft({...s,bloom:{...s.bloom,x:NaN}}));assert(!validCardDraft({...s,layers:[{...s.layers[0],font:"unknown"}]}));assert(!validCardDraft({...s,layers:[{...s.layers[0],size:500}]}));});
