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
