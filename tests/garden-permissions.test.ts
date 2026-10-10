import {hexCell} from "../src/lib/garden/spatial";
import {PGlite} from "@electric-sql/pglite";
import {readFile} from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import {defaultDesign} from "../src/lib/design/defaults";
import {publicSnapshot} from "../src/lib/garden/model";
test("Postgres enforces public read, consent, owner-only writes, immutable snapshots, moderation and quota",async()=>{
  const db=new PGlite();
  const owner="11111111-1111-4111-8111-111111111111",other="22222222-2222-4222-8222-222222222222";
  try{
    await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); insert into auth.users values ('${owner}'),('${other}'); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; create function auth.jwt() returns jsonb language sql stable as $$ select '{"is_anonymous":false}'::jsonb $$; grant usage on schema auth to anon,authenticated; grant execute on all functions in schema auth to anon,authenticated;`);
    await db.exec(await readFile(new URL("../supabase/garden.sql",import.meta.url),"utf8"));
    await db.exec(await readFile(new URL("../supabase/spatial-upgrade.sql",import.meta.url),"utf8"));
    const design=publicSnapshot(defaultDesign(),"A test bloom");
    const tinyCrown=structuredClone(design);tinyCrown.layers.at(-1)!.radius=8;tinyCrown.layers.at(-1)!.width=8;
    assert.equal((await db.query<{valid:boolean}>("select public.valid_garden_design($1::jsonb) as valid",[JSON.stringify(tinyCrown)])).rows[0].valid,true);
    await db.exec(await readFile(new URL("../supabase/small-crown-upgrade.sql",import.meta.url),"utf8"));
    assert.equal((await db.query<{valid:boolean}>("select public.valid_garden_design($1::jsonb) as valid",[JSON.stringify(tinyCrown)])).rows[0].valid,true);
    tinyCrown.layers.at(-1)!.radius=7;tinyCrown.layers.at(-1)!.width=7;
    assert.equal((await db.query<{valid:boolean}>("select public.valid_garden_design($1::jsonb) as valid",[JSON.stringify(tinyCrown)])).rows[0].valid,false);
    await db.exec(await readFile(new URL("../supabase/flower-library-upgrade.sql",import.meta.url),"utf8"));
    const rose=structuredClone(design);rose.layers[0].flower="rose";rose.layers[0].color="#C64A64";
    rose.layers[1].accent={flower:"rose",color:"#F5EADC",count:12};
    assert.equal((await db.query<{valid:boolean}>("select public.valid_garden_design($1::jsonb) as valid",[JSON.stringify(rose)])).rows[0].valid,true);
    rose.layers[0].color="#000000";
    assert.equal((await db.query<{valid:boolean}>("select public.valid_garden_design($1::jsonb) as valid",[JSON.stringify(rose)])).rows[0].valid,false);
    const insert=(id=owner,consent=true,d:unknown=design)=>db.query("insert into public.garden_entries(owner_id,title,creator_name,design,publication_consent) values ($1,'A test bloom','Tester',$2,$3) returning id",[id,JSON.stringify(d),consent]);
    await db.exec("set role anon");assert.equal((await db.query("select * from public.garden_entries")).rows.length,0);await assert.rejects(insert());
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false)`);
    await assert.rejects(insert(other));await assert.rejects(insert(owner,false));await assert.rejects(insert(owner,true,{...design,layers:[]}));await assert.rejects(insert(owner,true,{...design,personalization:{...design.personalization,dedication:"secret"}}));
    for(const field of ["id","flower","color","pattern","radius","width","rise","density","offset"]){const malformed=structuredClone(design);Object.assign(malformed.layers[0],{[field]:null});await assert.rejects(insert(owner,true,malformed));}
    const accented=structuredClone(design);accented.layers[0].accent={flower:"tangedu",color:"#F8DC77",count:12};
    assert.equal((await db.query<{valid:boolean}>("select public.valid_garden_design($1::jsonb) as valid",[JSON.stringify(accented)])).rows[0].valid,true);
    accented.layers[0].accent.count=25;await assert.rejects(insert(owner,true,accented));
    const result=await insert();const id=(result.rows[0] as {id:string}).id;
    await assert.rejects(db.query("update public.garden_entries set title='Changed' where id=$1",[id]));
    await assert.rejects(db.query("insert into public.garden_entries(owner_id,title,creator_name,design,publication_consent,hidden) values ($1,'title','Tester',$2,true,true)",[owner,JSON.stringify(design)]));
    await db.exec(`select set_config('request.jwt.claim.sub','${other}',false)`);
    assert.equal((await db.query("select * from public.garden_entries")).rows.length,1);
    assert.equal((await db.query("delete from public.garden_entries where id=$1 returning id",[id])).rows.length,0);
    await db.exec("reset role; update public.garden_entries set hidden=true");
    await db.exec("set role anon");assert.equal((await db.query("select * from public.garden_entries")).rows.length,0);assert.equal((await db.query("select * from public.garden_nearby(0,0,999)")).rows.length,0);
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false)`);
    assert.equal((await db.query("select * from public.garden_entries")).rows.length,1);
    for(let i=1;i<12;i++)await insert();await assert.rejects(insert(),/12 creations/);
    assert.equal((await db.query("delete from public.garden_entries where id=$1 returning id",[id])).rows.length,1);
    await insert();assert.equal((await db.query("select * from public.garden_entries")).rows.length,12);
    const neighborhood=await db.query<{slot:number;hex_q:number;hex_r:number}>("select slot,hex_q,hex_r from public.garden_nearby(0,0,999)");assert(neighborhood.rows.length<=61);for(const e of neighborhood.rows){assert.deepEqual(hexCell(Number(e.slot)),{q:e.hex_q,r:e.hex_r});}assert.equal((await db.query("select * from public.garden_nearby(10000,10000,4)")).rows.length,0);
    await db.exec("reset role; alter table public.garden_entries disable trigger limit_garden_entries; create temporary table fixture_owners as select gen_random_uuid() as id from generate_series(1,3000); insert into auth.users select id from fixture_owners;");
    await db.query("insert into public.garden_entries(owner_id,title,creator_name,design,publication_consent) select id,'Load fixture','Fixture',$1::jsonb,true from fixture_owners",[JSON.stringify(design)]);
    await db.exec("alter table public.garden_entries enable trigger limit_garden_entries; analyze public.garden_entries; set role anon");
    assert((await db.query("select * from public.garden_nearby(0,0,999)")).rows.length<=61); // deleted/rejected inserts leave stable empty slots
    const remote=await db.query<{hex_q:number;hex_r:number}>("select hex_q,hex_r from public.garden_nearby(20,-10,4)");assert.equal(remote.rows.length,61);assert(remote.rows.every(e=>Math.max(Math.abs(e.hex_q-20),Math.abs(e.hex_r+10),Math.abs(e.hex_q+e.hex_r-10))<=4));
  }finally{await db.close();}
});
