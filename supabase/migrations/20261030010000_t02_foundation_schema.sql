-- VE-FFP-PLAN-001 / T02. Schema only; RLS policies are T03.
-- Default-deny for anon and authenticated until authorized policies are reviewed.
create extension if not exists pgcrypto with schema extensions;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  created_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','technician')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 180),
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text,
  status text not null default 'open' check (status in ('open','assigned','in_progress','completed','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  scheduled_for timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, customer_id) references public.customers(organization_id,id) on delete restrict,
  constraint work_orders_closed_consistency check (
    (status in ('completed','cancelled') and closed_at is not null)
    or (status not in ('completed','cancelled') and closed_at is null)
  )
);

create table public.work_order_assignments (
  organization_id uuid not null,
  work_order_id uuid not null,
  technician_id uuid not null,
  assigned_at timestamptz not null default now(),
  primary key (organization_id, work_order_id, technician_id),
  foreign key (organization_id, work_order_id) references public.work_orders(organization_id,id) on delete cascade,
  foreign key (organization_id, technician_id) references public.memberships(organization_id,user_id) on delete restrict
);

create table public.work_order_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  work_order_id uuid not null,
  actor_id uuid,
  event_type text not null check (event_type in ('created','assigned','status_changed','updated','closed')),
  old_status text,
  new_status text,
  occurred_at timestamptz not null default now(),
  foreign key (organization_id, work_order_id) references public.work_orders(organization_id,id) on delete cascade,
  foreign key (organization_id, actor_id) references public.memberships(organization_id,user_id) on delete set null (actor_id)
);

create index memberships_user_idx on public.memberships(user_id);
create index customers_org_name_idx on public.customers(organization_id, name);
create index work_orders_org_status_idx on public.work_orders(organization_id, status, created_at desc);
create index work_orders_org_schedule_idx on public.work_orders(organization_id, scheduled_for);
create index work_order_assignments_technician_idx on public.work_order_assignments(organization_id, technician_id);
create index work_order_events_order_idx on public.work_order_events(organization_id, work_order_id, occurred_at desc);

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.customers enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_assignments enable row level security;
alter table public.work_order_events enable row level security;

-- No policies in T02: deny access from Data API roles.
-- T03 must add explicit scoped policies and authorization regression tests.
