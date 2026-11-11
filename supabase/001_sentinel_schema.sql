-- Sentinel: isolated demo workspace + persisted prototype state.
-- Run this file in Supabase SQL Editor after creating the demo Auth user.
-- Browser clients use only the publishable/anon key; never expose service_role.

create extension if not exists pgcrypto;

create table if not exists public.sentinel_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'Northstar Systems',
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sentinel_workspace_members (
  workspace_id uuid not null references public.sentinel_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'reviewer', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- One JSONB snapshot per workspace keeps this work sample easy to seed/reset.
-- Production should normalize identities, permissions, reviews, and immutable audit events.
create table if not exists public.sentinel_demo_state (
  workspace_id uuid primary key references public.sentinel_workspaces(id) on delete cascade,
  agents jsonb not null default '[]'::jsonb,
  events jsonb not null default '[]'::jsonb,
  reviews jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint sentinel_agents_is_array check (jsonb_typeof(agents) = 'array'),
  constraint sentinel_events_is_array check (jsonb_typeof(events) = 'array'),
  constraint sentinel_reviews_is_array check (jsonb_typeof(reviews) = 'array')
);

create or replace function public.sentinel_is_workspace_member(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sentinel_workspace_members m
    where m.workspace_id = target_workspace_id and m.user_id = auth.uid());
$$;

create or replace function public.bootstrap_sentinel_workspace()
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare
  current_user_id uuid := auth.uid();
  workspace_id uuid;
  workspace_slug text;
begin
  if current_user_id is null then raise exception 'Authentication is required to open Sentinel.'; end if;
  workspace_slug := 'northstar-' || replace(current_user_id::text, '-', '');
  insert into public.sentinel_workspaces (owner_user_id, name, slug)
  values (current_user_id, 'Northstar Systems', workspace_slug)
  on conflict (owner_user_id) do update set updated_at = now()
  returning id into workspace_id;
  insert into public.sentinel_workspace_members (workspace_id, user_id, role)
  values (workspace_id, current_user_id, 'admin') on conflict (workspace_id, user_id) do nothing;
  insert into public.sentinel_demo_state (workspace_id, agents, events, reviews)
  values (workspace_id, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
  on conflict (workspace_id) do nothing;
  return workspace_id;
end;
$$;

alter table public.sentinel_workspaces enable row level security;
alter table public.sentinel_workspace_members enable row level security;
alter table public.sentinel_demo_state enable row level security;

drop policy if exists sentinel_members_select_self on public.sentinel_workspace_members;
create policy sentinel_members_select_self on public.sentinel_workspace_members
  for select to authenticated using (user_id = auth.uid());
drop policy if exists sentinel_workspace_select_member on public.sentinel_workspaces;
create policy sentinel_workspace_select_member on public.sentinel_workspaces
  for select to authenticated using (public.sentinel_is_workspace_member(id));
drop policy if exists sentinel_state_select_member on public.sentinel_demo_state;
create policy sentinel_state_select_member on public.sentinel_demo_state
  for select to authenticated using (public.sentinel_is_workspace_member(workspace_id));
drop policy if exists sentinel_state_insert_member on public.sentinel_demo_state;
create policy sentinel_state_insert_member on public.sentinel_demo_state
  for insert to authenticated with check (public.sentinel_is_workspace_member(workspace_id));
drop policy if exists sentinel_state_update_member on public.sentinel_demo_state;
create policy sentinel_state_update_member on public.sentinel_demo_state
  for update to authenticated using (public.sentinel_is_workspace_member(workspace_id))
  with check (public.sentinel_is_workspace_member(workspace_id));

revoke all on public.sentinel_workspaces from anon, authenticated;
revoke all on public.sentinel_workspace_members from anon, authenticated;
revoke all on public.sentinel_demo_state from anon, authenticated;
grant select on public.sentinel_workspaces to authenticated;
grant select on public.sentinel_workspace_members to authenticated;
grant select, insert, update on public.sentinel_demo_state to authenticated;
revoke all on function public.sentinel_is_workspace_member(uuid) from public;
grant execute on function public.sentinel_is_workspace_member(uuid) to authenticated;
revoke all on function public.bootstrap_sentinel_workspace() from public;
grant execute on function public.bootstrap_sentinel_workspace() to authenticated;
