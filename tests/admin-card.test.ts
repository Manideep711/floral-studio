import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {blankCard,CARD_FONTS,CARD_TEMPLATES} from '../src/lib/share/card';
test('new cards have no preset words or links and support saved Telugu fonts',()=>{const card=blankCard();assert.deepEqual(card.layers,[]);assert.equal(card.link.visible,false);assert.equal(card.link.label,'');assert.equal(card.link.url,'');assert.equal(CARD_TEMPLATES.length,5);assert(CARD_FONTS.includes('Mallanna')&&CARD_FONTS.includes('Gidugu'));});
test('admin RLS denies ordinary users template writes, analytics reads and garden moderation',async()=>{
 const db=new PGlite(),admin='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222';
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${admin}'),('${user}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;create table public.garden_entries(id uuid primary key,owner_id uuid,hidden boolean default false);alter table public.garden_entries enable row level security;grant select on public.garden_entries to anon,authenticated;create policy "Public" on public.garden_entries for select to anon,authenticated using(not hidden);create policy "Owner updates" on public.garden_entries for update to authenticated using(owner_id=(select auth.uid()) and not hidden) with check(owner_id=(select auth.uid()) and not hidden);insert into public.garden_entries values('${admin}','${admin}',false),('${user}','${user}',false);create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid,bucket_id text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert,delete on storage.objects to authenticated;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261011132911_admin_card_library.sql',import.meta.url),'utf8'));
 await db.exec(`insert into public.admin_members values('${admin}');set role anon;`);
 assert.equal((await db.query('select * from public.card_templates')).rows.length,5);await assert.rejects(db.exec("insert into public.card_templates values('bad','Bad','/cards/bad.webp',true,0)"));await assert.rejects(db.exec('select * from public.usage_daily'));
 await db.exec("select public.record_usage('page_view','/');");await assert.rejects(db.exec("select public.record_usage('private','/secret');"));
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${user}',false);`);
 assert.equal((await db.query<{allowed:boolean}>('select public.is_studio_admin() allowed')).rows[0].allowed,false);
 assert.equal((await db.query('select * from public.usage_daily')).rows.length,0);
 await assert.rejects(db.exec("update public.garden_entries set hidden=true where owner_id=auth.uid()"));
 assert.equal((await db.query(`update public.garden_entries set hidden=true where owner_id='${admin}' returning id`)).rows.length,0);
 await assert.rejects(db.exec(`insert into public.admin_members values('${user}')`));await assert.rejects(db.exec("insert into storage.objects values(gen_random_uuid(),'card-backgrounds')"));
 await assert.rejects(db.exec("insert into public.card_templates values('bad','Bad','/cards/bad.webp',true,0)"));
 await db.exec(`select set_config('request.jwt.claim.sub','${admin}',false);`);
 assert.equal((await db.query<{allowed:boolean}>('select public.is_studio_admin() allowed')).rows[0].allowed,true);
 assert.equal((await db.query('select * from public.usage_daily')).rows.length,1);
 await db.exec("insert into public.card_templates values('new','New','/cards/new.webp',true,6);insert into storage.objects values(gen_random_uuid(),'card-backgrounds');");
 assert.equal((await db.query(`update public.garden_entries set hidden=true where owner_id='${user}' returning id`)).rows.length,1);
 await db.exec("update public.card_templates set enabled=false where id='new';");
 assert.equal((await db.query('select * from public.card_templates')).rows.length,6);
 await db.exec('set role anon;');assert.equal((await db.query('select * from public.card_templates')).rows.length,5);assert.equal((await db.query('select * from public.garden_entries')).rows.length,1);
 }finally{await db.close();}
});
