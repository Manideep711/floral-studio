-- Preserve duplicate snapshots privately before enforcing one entry per account.
lock table public.garden_entries in share row exclusive mode;
create schema if not exists garden_private;
revoke all on schema garden_private from public,anon,authenticated;
create table if not exists garden_private.duplicate_entries (id uuid primary key, snapshot jsonb not null, archived_at timestamptz not null default now());
revoke all on garden_private.duplicate_entries from public,anon,authenticated;
insert into garden_private.duplicate_entries(id,snapshot)
select e.id,to_jsonb(e) from public.garden_entries e
where exists(select 1 from public.garden_entries newer where newer.owner_id=e.owner_id and newer.slot>e.slot)
on conflict(id) do nothing;
delete from public.garden_entries e where exists(select 1 from public.garden_entries newer where newer.owner_id=e.owner_id and newer.slot>e.slot);
drop trigger if exists limit_garden_entries on public.garden_entries;
drop function if exists public.limit_garden_entries();
alter table public.garden_entries add constraint garden_entries_one_per_owner unique(owner_id);
create policy "Update own published flowers" on public.garden_entries for update to authenticated
using (owner_id=(select auth.uid()) and hidden=false)
with check (owner_id=(select auth.uid()) and hidden=false and publication_consent=true and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)=false);
grant update(title,creator_name,design,publication_consent) on public.garden_entries to authenticated;

-- Atomic publication; ownership, slot, creation date and moderation never change.
create function public.save_garden_entry(p_title text,p_nickname text,p_design jsonb,p_consent boolean)
returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid;
begin
 insert into public.garden_entries(owner_id,title,creator_name,design,publication_consent)
 values ((select auth.uid()),p_title,p_nickname,p_design,p_consent)
 on conflict(owner_id) do update set title=excluded.title,creator_name=excluded.creator_name,design=excluded.design,publication_consent=excluded.publication_consent
 returning id into saved_id;
 return saved_id;
end $$;
revoke all on function public.save_garden_entry(text,text,jsonb,boolean) from public,anon;
grant execute on function public.save_garden_entry(text,text,jsonb,boolean) to authenticated;
