-- Ademis Horti — Phase 1 / SaaS foundation
-- Requires Supabase Auth and PostgreSQL. Apply through versioned migrations.
create extension if not exists pgcrypto;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 created_at timestamptz not null default now()
);
create table public.organizations (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 50),
 name text not null check (length(trim(name)) between 3 and 120),
 created_by uuid not null references auth.users(id),
 timezone text not null default 'America/Recife',
 currency text not null default 'BRL' check(currency='BRL'),
 status text not null default 'active' check(status in ('active','suspended')),
 created_at timestamptz not null default now()
);
create table public.organization_members (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('ORG_ADMIN','OPERATOR','DELIVERY')),
 status text not null default 'active' check(status in ('active','inactive')),
 created_at timestamptz not null default now(),
 primary key(organization_id,user_id)
);
create index organization_members_user_idx on public.organization_members(user_id, status);

create table public.plans (
 code text primary key check(code in ('ESSENCIAL','PRO')),
 name text not null
);
create table public.features (
 code text primary key,
 description text not null
);
create table public.plan_features (
 plan_code text not null references public.plans(code) on delete cascade,
 feature_code text not null references public.features(code) on delete cascade,
 primary key(plan_code,feature_code)
);
create table public.subscriptions (
 organization_id uuid primary key references public.organizations(id) on delete cascade,
 plan_code text not null references public.plans(code),
 status text not null default 'trialing' check(status in ('trialing','active','past_due','suspended','canceled')),
 current_period_end timestamptz,
 updated_at timestamptz not null default now()
);
create table public.organization_settings (
 organization_id uuid primary key references public.organizations(id) on delete cascade,
 preorder_ratio numeric(4,3) not null default 0.700 check(preorder_ratio between 0 and 1),
 pix_manual_reservation_hours integer not null default 12 check(pix_manual_reservation_hours between 1 and 72),
 gateway_reservation_hours integer not null default 2 check(gateway_reservation_hours between 1 and 24),
 weighing_review_ratio numeric(5,4) not null default 0.0500 check(weighing_review_ratio between 0 and 1)
);
create table public.audit_logs (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 actor_user_id uuid references auth.users(id),
 action text not null,
 resource_type text not null,
 resource_id text,
 occurred_at timestamptz not null default now()
);
create index audit_logs_org_time_idx on public.audit_logs(organization_id,occurred_at desc);

-- Only manually assigned platform admins; clients cannot insert/update.
create table public.app_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);

insert into public.plans(code,name) values
 ('ESSENCIAL','Essencial'),('PRO','Pro');
insert into public.features(code,description) values
 ('products','Cadastro de produtos'),
 ('customers','Clientes'),
 ('suppliers_basic','Cadastro básico de fornecedores'),
 ('stock_basic','Estoque básico'),
 ('catalog','Catálogo digital'),
 ('orders','Pedidos'),
 ('pix_manual','Pix com confirmação manual'),
 ('deliveries_basic','Entregas parciais básicas'),
 ('dashboard_sales','Dashboard comercial'),
 ('preorder_manual','Pré-vendas manuais'),
 ('weighing_adjustment','Ajuste manual de pesagem'),
 ('manual_refund','Restituição manual'),
 ('expiring_reservations','Reserva expirável'),
 ('plantings','Plantios e colheitas'),
 ('supplier_purchases','Compras e fornecedores avançados'),
 ('stock_lots','Lotes e origem'),
 ('customer_segment_prices','Preços por segmento'),
 ('recipes','Fichas técnicas e processamento'),
 ('production_planning','Planejamento de colheita, compra e produção'),
 ('multi_route','Multirrota avançada'),
 ('payment_gateway','Cobrança por gateway'),
 ('whatsapp','Mensagens transacionais oficiais'),
 ('dashboard_operations','Indicadores operacionais');
insert into public.plan_features(plan_code, feature_code)
select 'ESSENCIAL',code from public.features where code in
 ('products','customers','suppliers_basic','stock_basic','catalog','orders',
 'pix_manual','deliveries_basic','dashboard_sales','preorder_manual',
 'weighing_adjustment','manual_refund','expiring_reservations');
insert into public.plan_features(plan_code, feature_code)
select 'PRO', code from public.features;

-- SECURITY DEFINER helpers must be narrow. Owner grants do not authorize
-- arbitrary access. This also avoids recursive RLS on membership tables.
create function public.is_org_member(p_org uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
 select exists(
   select 1 from public.organization_members m
   where m.organization_id=p_org
   and m.user_id=(select auth.uid()) and m.status='active'
 );
$$;
create function public.is_org_admin(p_org uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
 select exists(
  select 1 from public.organization_members m
  where m.organization_id=p_org and m.user_id=(select auth.uid())
    and m.role='ORG_ADMIN' and m.status='active'
 );
$$;
create function public.is_platform_admin()
returns boolean language sql stable security definer
set search_path = '' as $$
 select exists(select 1 from public.app_admins where user_id=(select auth.uid()));
$$;
create function public.org_has_feature(p_org uuid,p_feature text)
returns boolean language sql stable security definer
set search_path = '' as $$
 select public.is_org_member(p_org)
 and exists (
   select 1 from public.subscriptions s
   join public.plan_features pf on pf.plan_code=s.plan_code
   join public.organizations o on o.id=s.organization_id
   where s.organization_id=p_org and pf.feature_code=p_feature
     and s.status in ('trialing','active') and o.status='active'
 );
$$;

revoke all on function public.is_org_member(uuid) from public, anon;
revoke all on function public.is_org_admin(uuid) from public, anon;
revoke all on function public.is_platform_admin() from public, anon;
revoke all on function public.org_has_feature(uuid,text) from public, anon;
grant execute on function public.is_org_member(uuid), public.is_org_admin(uuid),
 public.is_platform_admin(), public.org_has_feature(uuid,text) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.plans enable row level security;
alter table public.features enable row level security;
alter table public.plan_features enable row level security;
alter table public.subscriptions enable row level security;
alter table public.organization_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_admins enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated
 using(id=(select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
 using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy organizations_select_member on public.organizations for select to authenticated
 using(public.is_org_member(id));
-- Organization identity/ownership cannot be altered via a raw client UPDATE.
create policy members_select_member on public.organization_members for select to authenticated
 using(public.is_org_member(organization_id));
create policy plans_select_authenticated on public.plans for select to authenticated using(true);
create policy features_select_authenticated on public.features for select to authenticated using(true);
create policy plan_features_select_authenticated on public.plan_features for select to authenticated using(true);
create policy subscriptions_select_member on public.subscriptions for select to authenticated
 using(public.is_org_member(organization_id));
create policy settings_select_member on public.organization_settings for select to authenticated
 using(public.is_org_member(organization_id));
create policy settings_update_admin on public.organization_settings for update to authenticated
 using(public.is_org_admin(organization_id)) with check(public.is_org_admin(organization_id));
create policy audit_select_admin on public.audit_logs for select to authenticated
 using(public.is_org_admin(organization_id));

-- Do not allow client-side changes to the subscription, membership, admin list,
-- audit trail or plan catalog. Mutations must use audited, checked RPC functions.
revoke insert,update,delete on public.organization_members from authenticated, anon;
revoke insert,update,delete on public.subscriptions from authenticated, anon;
revoke insert,update,delete on public.audit_logs from authenticated, anon;
revoke all on public.app_admins from authenticated, anon;
revoke insert,update,delete on public.plans,public.features,public.plan_features from authenticated, anon;
revoke insert,update,delete on public.organizations from authenticated, anon;
revoke insert,delete on public.organization_settings from authenticated, anon;
revoke update on public.profiles from authenticated, anon;
grant update(display_name) on public.profiles to authenticated;
-- RLS is also enabled and no insert/delete policy is provided.

create function public.create_organization(p_name text,p_slug text)
returns uuid language plpgsql volatile security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_org uuid;
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 if p_name is null or length(btrim(p_name)) < 3 or length(btrim(p_name)) > 120 then
  raise exception 'Organization name must have 3 to 120 characters';
 end if;
 if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
   or length(p_slug) not between 3 and 50 then
  raise exception 'Invalid organization slug';
 end if;
 insert into public.organizations (name,slug,created_by)
 values (btrim(p_name),p_slug,v_user) returning id into v_org;
 insert into public.organization_members(organization_id,user_id,role)
 values(v_org,v_user,'ORG_ADMIN');
 insert into public.organization_settings(organization_id) values(v_org);
 insert into public.subscriptions(organization_id,plan_code) values(v_org,'ESSENCIAL');
 insert into public.audit_logs(organization_id,actor_user_id,action,resource_type,resource_id)
 values(v_org,v_user,'organization.created','organization',v_org::text);
 return v_org;
end; $$;
revoke all on function public.create_organization(text,text) from public, anon;
grant execute on function public.create_organization(text,text) to authenticated;

create function public.add_existing_member(p_org uuid,p_email text,p_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_actor uuid := auth.uid();
begin
 if not public.is_org_admin(p_org) then raise exception 'Not permitted'; end if;
 if p_role not in ('ORG_ADMIN','OPERATOR','DELIVERY') then raise exception 'Invalid role'; end if;
 select id into v_user from auth.users
 where lower(email)=lower(btrim(p_email)) and email_confirmed_at is not null;
 if v_user is null then raise exception 'User not found; they must register first'; end if;
 -- Never demote the last active organization administrator, including self.
 if p_role <> 'ORG_ADMIN' and exists (
  select 1 from public.organization_members where organization_id=p_org
    and user_id=v_user and role='ORG_ADMIN' and status='active'
 ) and (select count(*) from public.organization_members
   where organization_id=p_org and role='ORG_ADMIN' and status='active') <= 1 then
  raise exception 'Cannot demote last administrator';
 end if;
 insert into public.organization_members(organization_id,user_id,role,status)
 values(p_org,v_user,p_role,'active')
 on conflict(organization_id,user_id) do update
   set role=excluded.role,status='active';
 insert into public.audit_logs(organization_id,actor_user_id,action,resource_type,resource_id)
 values(p_org,v_actor,'membership.upsert','organization_member',v_user::text);
end; $$;
revoke all on function public.add_existing_member(uuid,text,text) from public, anon;
grant execute on function public.add_existing_member(uuid,text,text) to authenticated;

-- Role reduction is separate, to protect against removal of the last administrator.
create function public.remove_member(p_org uuid,p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_role text; v_count integer;
begin
 if not public.is_org_admin(p_org) then raise exception 'Not permitted'; end if;
 select role into v_role from public.organization_members
 where organization_id=p_org and user_id=p_user and status='active' for update;
 if v_role is null then raise exception 'Member does not exist'; end if;
 if v_role='ORG_ADMIN' then
   select count(*) into v_count from public.organization_members
   where organization_id=p_org and role='ORG_ADMIN' and status='active';
   if v_count <= 1 then raise exception 'Cannot remove last administrator'; end if;
 end if;
 update public.organization_members set status='inactive'
 where organization_id=p_org and user_id=p_user;
 insert into public.audit_logs(organization_id,actor_user_id,action,resource_type,resource_id)
 values(p_org,auth.uid(),'membership.deactivated','organization_member',p_user::text);
end; $$;
revoke all on function public.remove_member(uuid,uuid) from public, anon;
grant execute on function public.remove_member(uuid,uuid) to authenticated;

create function public.platform_organizations()
returns table(id uuid, name text, slug text, plan_code text, status text, member_count bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
 if not public.is_platform_admin() then raise exception 'Not permitted'; end if;
 return query
 select o.id,o.name,o.slug,s.plan_code,s.status,
    (select count(*) from public.organization_members m
     where m.organization_id=o.id and m.status='active')
 from public.organizations o join public.subscriptions s on s.organization_id=o.id
 order by o.created_at desc;
end; $$;
revoke all on function public.platform_organizations() from public, anon;
grant execute on function public.platform_organizations() to authenticated;

create function public.platform_set_plan(p_org uuid,p_plan text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_platform_admin() then raise exception 'Not permitted'; end if;
 if p_plan not in ('ESSENCIAL','PRO') then raise exception 'Invalid plan'; end if;
 update public.subscriptions set plan_code=p_plan,updated_at=now() where organization_id=p_org;
 if not found then raise exception 'Organization not found'; end if;
 insert into public.audit_logs(organization_id,actor_user_id,action,resource_type,resource_id)
 values(p_org,auth.uid(),'subscription.plan_changed','subscription',p_plan);
end; $$;
revoke all on function public.platform_set_plan(uuid,text) from public, anon;
grant execute on function public.platform_set_plan(uuid,text) to authenticated;

create function public.create_profile_for_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles (id,display_name)
 values(new.id,coalesce(new.raw_user_meta_data ->> 'display_name',''));
 return new;
end; $$;
create trigger on_auth_user_created
 after insert on auth.users for each row execute procedure public.create_profile_for_auth_user();

-- Bootstrap a platform administrator only by manually applying the account's
-- auth.users ID via privileged SQL, never via a public endpoint:
-- INSERT INTO public.app_admins (user_id) VALUES ('<AUTHORIZED_USER_UUID>');

-- The team list must not expose auth.users emails to all organization members.
-- Only the organization's administrator may fetch team contact details.
create function public.list_org_members(p_org uuid)
returns table(user_id uuid,email text,role text,status text)
language plpgsql stable security definer set search_path = '' as $$
begin
 if not public.is_org_admin(p_org) then raise exception 'Not permitted'; end if;
 return query select m.user_id,u.email::text,m.role,m.status
 from public.organization_members m join auth.users u on u.id=m.user_id
 where m.organization_id=p_org and m.status='active'
 order by m.created_at;
end; $$;
revoke all on function public.list_org_members(uuid) from public, anon;
grant execute on function public.list_org_members(uuid) to authenticated;

-- Settings are editable only by admins via RLS; still record every mutation.
create function public.audit_settings_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new is distinct from old then
  insert into public.audit_logs(organization_id,actor_user_id,action,resource_type,resource_id)
  values(new.organization_id,auth.uid(),'settings.updated','organization_settings',new.organization_id::text);
 end if;
 return new;
end; $$;
create trigger audit_settings_update after update on public.organization_settings
for each row execute function public.audit_settings_change();
