-- Apply once in the Supabase SQL editor, as the project administrator.
-- No service role key is ever used by the application.
create or replace function public.valid_garden_design(d jsonb) returns boolean
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
