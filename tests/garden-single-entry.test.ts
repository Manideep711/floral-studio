import {PGlite} from "@electric-sql/pglite";
import {readFile} from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import {defaultDesign} from "../src/lib/design/defaults";
import {publicSnapshot} from "../src/lib/garden/model";
test("One garden entry: archive duplicates, repeat saves keep identity, owners cannot edit others or moderation",async()=>{
 const db=new PGlite(),owner="11111111-1111-4111-8111-111111111111",other="22222222-2222-4222-8222-222222222222";
 try{
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); insert into auth.users values ('${owner}'),('${other}'); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; create function auth.jwt() returns jsonb language sql stable as $$ select '{"is_anonymous":false}'::jsonb $$; grant usage on schema auth to anon,authenticated; grant execute on all functions in schema auth to anon,authenticated;`);
 await db.exec(await readFile(new URL("../supabase/garden.sql",import.meta.url),"utf8"));
 const design=JSON.stringify(publicSnapshot(defaultDesign(),"Test"));
 const save=()=>db.query<{id:string;slot:number}>("insert into public.garden_entries(owner_id,title,creator_name,design,publication_consent) values ($1,'Test','Tester',$2,true) on conflict(owner_id) do update set title='Updated',creator_name=excluded.creator_name,design=excluded.design,publication_consent=true returning id,slot",[owner,design]);
 await db.query("insert into public.garden_entries(owner_id,title,creator_name,design,publication_consent) values ($1,'Old','Tester',$2,true),($1,'Latest','Tester',$2,true)",[owner,design]);
 await db.exec("begin");await db.exec(await readFile(new URL("../supabase/one-per-owner-upgrade.sql",import.meta.url),"utf8"));await db.exec("commit");
 assert.equal((await db.query("select * from garden_private.duplicate_entries")).rows.length,1);
 const original=(await db.query<{id:string;slot:number}>("select id,slot from public.garden_entries")).rows[0];
 await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false)`);
 assert.deepEqual((await save()).rows[0],original);assert.deepEqual((await save()).rows[0],original);
 const rpc=await db.query<{id:string}>("select public.save_garden_entry('RPC title','Tester',$1::jsonb,true) as id",[design]);assert.equal(rpc.rows[0].id,original.id);
 await assert.rejects(db.query("select public.save_garden_entry('RPC title','Tester',$1::jsonb,false)",[design]));
 assert.equal((await db.query("select * from public.garden_entries")).rows.length,1);
 await assert.rejects(db.query("insert into public.garden_entries(owner_id,title,creator_name,design,publication_consent) values ($1,'Duplicate','Tester',$2,true)",[owner,design]),/unique/);
 await assert.rejects(db.exec("select * from garden_private.duplicate_entries"));
 await assert.rejects(db.exec("update public.garden_entries set hidden=true"));
 await assert.rejects(db.query("update public.garden_entries set owner_id=$1",[other]));
 await db.exec(`select set_config('request.jwt.claim.sub','${other}',false)`);
 assert.equal((await db.query("update public.garden_entries set title='Stolen' returning id")).rows.length,0);await assert.rejects(save());
 await db.exec("reset role; update public.garden_entries set hidden=true");
 await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false)`);await assert.rejects(save());
 }finally{await db.close();}
});
