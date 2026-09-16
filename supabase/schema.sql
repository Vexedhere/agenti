create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  type text not null check (type in ('coding','business','research','general','custom')),
  code text not null unique check (code ~ '^[a-f0-9]{6}-[a-f0-9]{4}$'),
  created_at timestamptz not null default now()
);

alter table public.agents enable row level security;
create policy "agents_select_own" on public.agents for select using (auth.uid() = owner_id);
create policy "agents_insert_own" on public.agents for insert with check (auth.uid() = owner_id);
create policy "agents_update_own" on public.agents for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "agents_delete_own" on public.agents for delete using (auth.uid() = owner_id);