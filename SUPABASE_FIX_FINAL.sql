-- =====================================================
-- FINAL FIX FOR ALL PERMISSION ERRORS
-- =====================================================

-- 1. Ensure workspace_id exists
alter table public.profiles 
add column if not exists workspace_id uuid;

create index if not exists idx_profiles_workspace_id on public.profiles(workspace_id);

-- 2. RESET POLICIES (Clear out any bad/restrictive ones)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- 3. CREATE SIMPLE, WORKING POLICIES
-- Allow users to Read their own profile
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

-- Allow users to Create their own profile
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

-- Allow users to Update their own profile (Unrestricted)
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

-- 4. FIX BAD DATA
-- Ensure all profiles have a role (fixes constraint violations)
update public.profiles
set role = 'ADMIN'
where role is null;

-- 5. Verify
select * from public.profiles limit 1;
