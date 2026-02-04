-- =====================================================
-- FIX FOR 400 & 403 ERRORS (Run this in Supabase)
-- =====================================================

-- 1. Fix 400 Error: Add missing workspace_id column
alter table public.profiles 
add column if not exists workspace_id uuid;

create index if not exists idx_profiles_workspace_id on public.profiles(workspace_id);

-- 2. Fix 403 Error: Add missing INSERT policy
-- Required because the app uses 'upsert', which needs INSERT permission
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

-- 3. Verify it worked
select * from public.profiles limit 1;
