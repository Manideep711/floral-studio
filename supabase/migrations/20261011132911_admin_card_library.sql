begin;
create table public.admin_members(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admin_members enable row level security;
revoke all on public.admin_members from anon,authenticated;
grant select on public.admin_members to authenticated;
create policy "Read own admin membership" on public.admin_members for select to authenticated using(user_id=(select auth.uid()));
create function public.is_studio_admin() returns boolean language sql stable security invoker set search_path='' as $$ select exists(select 1 from public.admin_members where user_id=(select auth.uid())) $$;
revoke all on function public.is_studio_admin() from public,anon;
grant execute on function public.is_studio_admin() to authenticated;
create table public.card_templates(id text primary key check(length(id) between 1 and 80),name text not null check(length(name) between 1 and 80),image_url text not null check(length(image_url)<2048 and (image_url like '/cards/%' or image_url like 'https://%')),enabled boolean not null default true,sort_order integer not null default 0);
alter table public.card_templates enable row level security;
revoke all on public.card_templates from anon,authenticated;
grant select on public.card_templates to anon;
grant select,insert,update,delete on public.card_templates to authenticated;
create policy "Read enabled cards" on public.card_templates for select to anon,authenticated using(enabled);
create policy "Admin cards" on public.card_templates for all to authenticated using((select public.is_studio_admin())) with check((select public.is_studio_admin()));
insert into public.card_templates(id,name,image_url,sort_order) values ('floral-1','Petal frame','/cards/floral-1.webp',0),('floral-2','Festival arch','/cards/floral-2.webp',1),('floral-3','Floral corners','/cards/floral-3.webp',2),('floral-4','Golden garlands','/cards/floral-4.webp',3),('floral-5','Garden light','/cards/floral-5.webp',4);
create policy "Admin read garden" on public.garden_entries for select to authenticated using((select public.is_studio_admin()));
create policy "Admin moderate garden" on public.garden_entries for update to authenticated using((select public.is_studio_admin())) with check((select public.is_studio_admin()));
grant update(hidden) on public.garden_entries to authenticated;
create table public.usage_daily(day date not null,event text not null check(event in ('page_view','card_download','card_share')),path text not null check(path in ('/','/studio/','/garden/')),count integer not null default 0 check(count between 0 and 100000),primary key(day,event,path));
alter table public.usage_daily enable row level security;
revoke all on public.usage_daily from anon,authenticated;
grant select on public.usage_daily to authenticated;
create policy "Admin analytics" on public.usage_daily for select to authenticated using((select public.is_studio_admin()));
create schema if not exists studio_private;
revoke all on schema studio_private from public;
grant usage on schema studio_private to anon,authenticated;
-- Only aggregate counters are collected: no email, IP, unique device or draft contents.
create function studio_private.record_usage(event_name text,page_path text) returns void language plpgsql security definer set search_path='' as $$
begin
 if event_name not in ('page_view','card_download','card_share') or page_path not in ('/','/studio/','/garden/') then raise exception 'Invalid event';end if;
 insert into public.usage_daily(day,event,path,count) values(current_date,event_name,page_path,1)
 on conflict(day,event,path) do update set count=least(public.usage_daily.count+1,100000);
end $$;
revoke all on function studio_private.record_usage(text,text) from public;
grant execute on function studio_private.record_usage(text,text) to anon,authenticated;
create function public.record_usage(event_name text,page_path text) returns void language sql security invoker set search_path='' as $$ select studio_private.record_usage(event_name,page_path) $$;
revoke all on function public.record_usage(text,text) from public;
grant execute on function public.record_usage(text,text) to anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('card-backgrounds','card-backgrounds',true,10485760,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy "Admin upload card assets" on storage.objects for insert to authenticated with check(bucket_id='card-backgrounds' and (select public.is_studio_admin()));
create policy "Admin read card assets" on storage.objects for select to authenticated using(bucket_id='card-backgrounds' and (select public.is_studio_admin()));
create policy "Admin remove card assets" on storage.objects for delete to authenticated using(bucket_id='card-backgrounds' and (select public.is_studio_admin()));
commit;
