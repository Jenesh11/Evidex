-- =====================================================
-- CRITICAL: Run this SQL in your Supabase SQL Editor
-- =====================================================
-- This creates the profiles table and auto-creates profiles on signup

-- 1. CREATE PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'ADMIN',
  plan text default 'STARTER',
  plan_expires_at timestamptz,
  created_at timestamptz default now()
);

-- 2. ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;

-- 3. DROP EXISTING POLICIES (if any)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- 4. CREATE RLS POLICIES
-- Allow users to read their own profile
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

-- Allow users to update their own profile
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id);

-- NOTE: We do NOT create an INSERT policy for users
-- Profiles are ONLY created by the trigger (which runs as security definer)

-- 5. AUTO-CREATE PROFILE ON SIGNUP (CRITICAL)
-- This trigger ensures a profile row is created immediately after auth signup
-- SECURITY DEFINER means it runs with elevated privileges and bypasses RLS
create or replace function public.handle_new_user()
returns trigger 
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, email, role, plan)
  values (new.id, new.email, 'ADMIN', 'STARTER');
  return new;
exception
  when others then
    -- Log error but don't fail the signup
    raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 6. BACKFILL EXISTING USERS (if any)
-- This ensures any existing auth users get a profile
insert into public.profiles (id, email, role, plan)
select 
  id, 
  email,
  'ADMIN',
  'STARTER'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
