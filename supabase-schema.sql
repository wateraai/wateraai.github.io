-- ---------------------------------------------------------------
-- Water AI — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ---------------------------------------------------------------

-- A profile row for each authenticated user.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text default 'free' check (plan in ('free','paid')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Each user can only see their own profile.
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Each user can only update their own profile.
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
