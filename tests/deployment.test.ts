import test from "node:test";
import assert from "node:assert/strict";
import {checkDeploymentEnvironment} from "../src/lib/deployment/environment";
const configured={NEXT_PUBLIC_SUPABASE_URL:"https://example.supabase.co",NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_example"};
test("Deployment allows deliberate sample mode and validates complete public configuration",()=>{
 assert.equal(checkDeploymentEnvironment({}),"sample");assert.equal(checkDeploymentEnvironment(configured),"live");
 assert.throws(()=>checkDeploymentEnvironment({REQUIRE_LIVE_GARDEN:"1"}));
 assert.throws(()=>checkDeploymentEnvironment({NEXT_PUBLIC_SUPABASE_URL:configured.NEXT_PUBLIC_SUPABASE_URL}));
 assert.throws(()=>checkDeploymentEnvironment({...configured,NEXT_PUBLIC_SUPABASE_URL:"http://example.com"}));
});
test("Deployment refuses privileged keys in a browser export",()=>{
 assert.throws(()=>checkDeploymentEnvironment({...configured,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"sb_secret_example"}));
 const jwt=(role:string)=>`header.${Buffer.from(JSON.stringify({role})).toString("base64url")}.signature`;
 assert.throws(()=>checkDeploymentEnvironment({...configured,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:jwt("service_role")}));
 assert.equal(checkDeploymentEnvironment({...configured,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:jwt("anon")}),"live");
});
