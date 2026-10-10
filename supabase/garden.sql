-- Apply once in the Supabase SQL editor, as the project administrator.
-- No service role key is ever used by the application.
create function public.valid_garden_design(d jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare l jsonb; ids text[] := '{}';
begin
  if jsonb_typeof(d)<>'object' or jsonb_typeof(d->'schemaVersion')<>'number' or jsonb_typeof(d->'layoutVersion')<>'number' or jsonb_typeof(d->'flowerLibraryVersion')<>'number' then return false; end if;
  if pg_catalog.octet_length(d::text)>16000 or d->>'schemaVersion'<>'1' or d->>'layoutVersion' not in ('1','2') or d->>'flowerLibraryVersion'<>'1' or d->>'scene'<>'studio' then return false; end if;
  if jsonb_typeof(d->'seed')<>'number' or (d->>'seed')::numeric<>trunc((d->>'seed')::numeric) or abs((d->>'seed')::numeric)>9007199254740991 then return false; end if;
  if jsonb_typeof(d->'layers')<>'array' or jsonb_array_length(d->'layers') not between 1 and 8 then return false; end if;
  if jsonb_typeof(d->'personalization')<>'object' or jsonb_typeof(d#>'{personalization,title}')<>'string' or length(d#>>'{personalization,title}')>100 or jsonb_typeof(d#>'{personalization,dedication}')<>'string' or d#>>'{personalization,dedication}'<>'' or jsonb_typeof(d#>'{personalization,language}')<>'string' or d#>>'{personalization,language}' not in ('en','te') then return false; end if;
  for l in select value from jsonb_array_elements(d->'layers') loop
    if jsonb_typeof(l->'flower')<>'string' or jsonb_typeof(l->'color')<>'string' or jsonb_typeof(l->'pattern')<>'string' then return false; end if;
    if jsonb_typeof(l)<>'object' or jsonb_typeof(l->'id')<>'string' or length(l->>'id') not between 1 and 80 or l->>'id'=any(ids) then return false; end if;
    ids:=array_append(ids,l->>'id');
    if not ((l->>'flower'='tangedu' and l->>'color' in ('#F2C643','#EFB32B','#F8DC77')) or (l->>'flower'='gunugu' and l->>'color' in ('#EEE4D7','#DCA7BA','#C8587A','#973E68')) or (l->>'flower'='banti' and l->>'color' in ('#E98333','#F3AA36','#F3CE49')) or (l->>'flower'='rose' and l->>'color' in ('#C64A64','#EAA9B7','#F5EADC'))) then return false; end if;
    if jsonb_typeof(l->'radius')<>'number' or jsonb_typeof(l->'width')<>'number' or jsonb_typeof(l->'rise')<>'number' or jsonb_typeof(l->'density')<>'number' or jsonb_typeof(l->'offset')<>'number' then return false; end if;
    if (l->>'radius')::numeric not between 8 and 180 or (l->>'width')::numeric not between 8 and 50 or (l->>'width')::numeric>(l->>'radius')::numeric or (l->>'rise')::numeric not between 10 and 40 or (l->>'density')::numeric not between .55 and 1.2 or abs((l->>'offset')::numeric)>6.283185307179586 or l->>'pattern' not in ('rings','staggered') then return false; end if;
    if not (l ?& array['id','flower','color','radius','width','rise','density','offset','pattern']) then return false; end if;
    if l ? 'accent' then
      if jsonb_typeof(l->'accent')<>'object' or not ((l->'accent') ?& array['flower','color','count']) or jsonb_typeof(l#>'{accent,flower}')<>'string' or jsonb_typeof(l#>'{accent,color}')<>'string' or jsonb_typeof(l#>'{accent,count}')<>'number' then return false; end if;
      if (l#>>'{accent,count}')::numeric not between 4 and 24 or (l#>>'{accent,count}')::numeric<>trunc((l#>>'{accent,count}')::numeric) then return false; end if;
      if not ((l#>>'{accent,flower}'='tangedu' and l#>>'{accent,color}' in ('#F2C643','#EFB32B','#F8DC77')) or (l#>>'{accent,flower}'='gunugu' and l#>>'{accent,color}' in ('#EEE4D7','#DCA7BA','#C8587A','#973E68')) or (l#>>'{accent,flower}'='banti' and l#>>'{accent,color}' in ('#E98333','#F3AA36','#F3CE49')) or (l#>>'{accent,flower}'='rose' and l#>>'{accent,color}' in ('#C64A64','#EAA9B7','#F5EADC'))) then return false; end if;
    end if;
  end loop;
  return d ?& array['schemaVersion','layoutVersion','flowerLibraryVersion','seed','scene','layers','personalization'] and (d->'personalization') ?& array['title','dedication','language'];
exception when others then return false;
end $$;

create table public.garden_entries (
  id uuid primary key default gen_random_uuid(),
  slot bigint generated always as identity unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 100),
  creator_name text not null check (length(btrim(creator_name)) between 1 and 40),
  design jsonb not null check (public.valid_garden_design(design) is true),
  publication_consent boolean not null check (publication_consent = true),
  created_at timestamptz not null default now(),
  hidden boolean not null default false
);
create index garden_entries_public_order on public.garden_entries(slot desc) where hidden=false;
create index garden_entries_owner on public.garden_entries(owner_id);
alter table public.garden_entries enable row level security;
-- Public snapshots contain no email, account profile, or private dedication.
create policy "Read published flowers" on public.garden_entries for select to anon,authenticated using (hidden=false or owner_id=(select auth.uid()));
create policy "Publish with explicit consent" on public.garden_entries for insert to authenticated with check (owner_id=(select auth.uid()) and publication_consent=true and hidden=false and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)=false);
create policy "Remove own flowers" on public.garden_entries for delete to authenticated using (owner_id=(select auth.uid()));
-- Immutable snapshots: no browser updates; hidden is an administrator-only moderation switch.
revoke all on public.garden_entries from anon,authenticated;
grant select on public.garden_entries to anon,authenticated;
grant insert(owner_id,title,creator_name,design,publication_consent) on public.garden_entries to authenticated;
grant delete on public.garden_entries to authenticated;
grant usage on sequence public.garden_entries_slot_seq to authenticated;

-- Serialize inserts by owner to enforce the quota even under concurrent requests.
create function public.limit_garden_entries() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.owner_id::text, 0));
  if (select count(*) from public.garden_entries where owner_id=new.owner_id)>=12 then
    raise exception 'Your garden has 12 creations. Remove one before publishing another.';
  end if;
  return new;
end $$;
revoke all on function public.limit_garden_entries() from public,anon,authenticated;
create trigger limit_garden_entries before insert on public.garden_entries for each row execute function public.limit_garden_entries();
-- Additive spatial upgrade: preserves records, visibility and owner policies.
create or replace function public.garden_hex_cell(p_slot bigint) returns integer[]
language plpgsql immutable strict set search_path='' as $$
declare n bigint:=greatest(0,p_slot-1); k integer; idx bigint; side integer; step integer; q integer; r integer;
  dq integer[]:=array[1,1,0,-1,-1,0]; dr integer[]:=array[0,-1,-1,0,1,1];
begin
  if n=0 then return array[0,0]; end if;
  k:=ceil((sqrt(12*n::numeric+9)-3)/6)::integer;idx:=n-(1+3*k::bigint*(k-1));side:=floor(idx::numeric/k)::integer;step:=(idx%k)::integer;q:=-k;r:=k;
  if side>0 then for i in 1..side loop q:=q+dq[i]*k;r:=r+dr[i]*k;end loop;end if;
  return array[q+dq[side+1]*step,r+dr[side+1]*step];
end $$;
alter table public.garden_entries add column if not exists hex_q integer generated always as ((public.garden_hex_cell(slot))[1]) stored;
alter table public.garden_entries add column if not exists hex_r integer generated always as ((public.garden_hex_cell(slot))[2]) stored;
create index if not exists garden_entries_hex on public.garden_entries(hex_q,hex_r) where hidden=false;
create index if not exists garden_entries_sectors on public.garden_entries ((floor(hex_q/4.0)::integer),(floor(hex_r/4.0)::integer)) where hidden=false;
create or replace function public.garden_nearby(center_q integer,center_r integer,radius integer default 4)
returns setof public.garden_entries language sql stable security invoker set search_path='' as $$
  select e.* from public.garden_entries e where e.hidden=false
    and floor(e.hex_q/4.0)::integer=any(array(select generate_series(floor((center_q-least(4,greatest(0,radius)))/4.0)::integer,floor((center_q+least(4,greatest(0,radius)))/4.0)::integer)))
    and floor(e.hex_r/4.0)::integer=any(array(select generate_series(floor((center_r-least(4,greatest(0,radius)))/4.0)::integer,floor((center_r+least(4,greatest(0,radius)))/4.0)::integer)))
    and e.hex_q between center_q-least(4,greatest(0,radius)) and center_q+least(4,greatest(0,radius))
    and e.hex_r between center_r-least(4,greatest(0,radius)) and center_r+least(4,greatest(0,radius))
    and abs(e.hex_q+e.hex_r-center_q-center_r)<=least(4,greatest(0,radius))
  order by greatest(abs(e.hex_q-center_q),abs(e.hex_r-center_r),abs(e.hex_q+e.hex_r-center_q-center_r)),e.slot desc limit 61
$$;
revoke all on function public.garden_nearby(integer,integer,integer) from public;
grant execute on function public.garden_nearby(integer,integer,integer) to anon,authenticated;
