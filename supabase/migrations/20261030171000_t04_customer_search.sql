-- T04 searchable, paginated owner/admin customer directory.
create or replace function public.fieldforce_search_customers(p_org uuid,p_query text default '',p_page integer default 1,p_size integer default 20)
returns table(id uuid,name text,email text,phone text,total_count bigint)
language plpgsql stable security invoker set search_path=''
as $fn$
begin
 if (select fieldforce_private.my_role(p_org)) not in ('owner','admin') then
 raise exception 'not authorized' using errcode='42501';end if;
 if p_page is null or p_page<1 or p_page>100000 or p_size is null or p_size<1 or p_size>50 or char_length(coalesce(p_query,''))>120 then
 raise exception 'invalid pagination' using errcode='22023';end if;
 return query
 select c.id,c.name,c.email,c.phone,count(*) over() as total_count
 from fieldforce.customers c
 where c.organization_id=p_org and (coalesce(btrim(p_query),'')='' or
 strpos(lower(c.name),lower(btrim(p_query)))>0 or
 strpos(lower(coalesce(c.email,'')),lower(btrim(p_query)))>0 or
 strpos(lower(coalesce(c.phone,'')),lower(btrim(p_query)))>0)
 order by c.name,c.id limit p_size offset (p_page-1)*p_size;
end $fn$;
revoke all on function public.fieldforce_search_customers(uuid,text,integer,integer) from public,anon;
grant execute on function public.fieldforce_search_customers(uuid,text,integer,integer) to authenticated;
