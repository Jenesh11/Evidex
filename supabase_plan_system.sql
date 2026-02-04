-- =====================================================
-- PLAN/LICENSE SYSTEM - COMPLETE RESET
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This replaces the old profiles setup with trial support

-- 1. DROP EXISTING POLICIES (clean slate)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- 2. UPDATE PROFILES TABLE SCHEMA
-- Add new columns for trial and license management
alter table public.profiles 
  add column if not exists trial_expires_at timestamptz,
  add column if not exists plan_expires_at timestamptz,
  add column if not exists is_lifetime boolean default false,
  add column if not exists workspace_id uuid;

-- Set default trial for existing users (7 days from now)
update public.profiles 
set trial_expires_at = now() + interval '7 days'
where trial_expires_at is null;

-- Ensure plan column exists and has correct default
alter table public.profiles 
  alter column plan set default 'STARTER';

-- 3. CREATE LICENSE CODES TABLE
create table if not exists public.license_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  plan_type text not null check (plan_type in ('STARTER', 'PRO')),
  duration_months int,
  is_lifetime boolean default false,
  is_used boolean default false,
  used_by uuid references public.profiles(id),
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS on license_codes
alter table public.license_codes enable row level security;

-- 4. CREATE RLS POLICIES

-- Profiles: Users can read their own profile
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

-- Profiles: Users can update their own profile (but not plan fields if they're staff)
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id AND (
    role = 'ADMIN' OR 
    (role = 'STAFF' AND plan = (select plan from public.profiles where id = auth.uid()))
  )
);

-- License codes: Only admins can view codes
create policy "license_codes_select_admin"
on public.license_codes
for select
using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'ADMIN'
  )
);

-- License codes: Only admins can update (claim)
create policy "license_codes_update_admin"
on public.license_codes
for update
using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'ADMIN'
  )
);

-- 5. UPDATE AUTO-CREATE PROFILE TRIGGER
-- This trigger creates a profile with 7-day trial on signup
create or replace function public.handle_new_user()
returns trigger 
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (
    id, 
    email, 
    role, 
    plan,
    trial_expires_at
  )
  values (
    new.id, 
    new.email, 
    'ADMIN', 
    'STARTER',
    now() + interval '7 days'
  );
  return new;
exception
  when others then
    raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 6. CREATE CLAIM LICENSE FUNCTION
-- This function handles license code claiming atomically
-- Supports: Upgrades (STARTER→PRO), Renewals, and Extensions
create or replace function public.claim_license_code(
  p_code text,
  p_user_id uuid
)
returns jsonb
security definer
set search_path = public
language plpgsql
as $$
declare
  v_license record;
  v_profile record;
  v_new_expiry timestamptz;
  v_result jsonb;
begin
  -- Get license code
  select * into v_license
  from public.license_codes
  where code = upper(p_code)
  for update;

  -- Validate code exists
  if not found then
    return jsonb_build_object(
      'success', false,
      'message', 'Invalid license code'
    );
  end if;

  -- Check if already used
  if v_license.is_used then
    return jsonb_build_object(
      'success', false,
      'message', 'This code has already been used'
    );
  end if;

  -- Get current user profile
  select * into v_profile
  from public.profiles
  where id = p_user_id;

  -- Calculate new expiry based on upgrade/renewal logic
  if v_license.is_lifetime then
    -- Lifetime license - no expiry
    v_new_expiry := null;
  else
    -- Time-based license
    -- If user has an active plan that hasn't expired, extend from expiry date
    -- Otherwise, start from now
    if v_profile.plan_expires_at is not null and v_profile.plan_expires_at > now() then
      -- Extend from current expiry (stacking)
      v_new_expiry := v_profile.plan_expires_at + (v_license.duration_months || ' months')::interval;
    else
      -- Start fresh from now
      v_new_expiry := now() + (v_license.duration_months || ' months')::interval;
    end if;
  end if;

  -- Determine final plan type (upgrade if claiming higher plan)
  -- Plan hierarchy: STARTER < PRO < ENTERPRISE
  declare
    v_final_plan text;
  begin
    if v_license.plan_type = 'PRO' or v_profile.plan = 'STARTER' then
      -- Upgrade to PRO or keep PRO
      v_final_plan := v_license.plan_type;
    else
      -- Keep current plan if it's higher
      v_final_plan := v_profile.plan;
    end if;

    -- Update profile
    update public.profiles
    set 
      plan = v_final_plan,
      plan_expires_at = v_new_expiry,
      is_lifetime = v_license.is_lifetime,
      trial_expires_at = null  -- Clear trial once license is claimed
    where id = p_user_id;
  end;

  -- Mark code as used
  update public.license_codes
  set 
    is_used = true,
    used_by = p_user_id,
    used_at = now()
  where id = v_license.id;

  -- Return success with upgrade/renewal info
  return jsonb_build_object(
    'success', true,
    'plan', v_license.plan_type,
    'expires_at', v_new_expiry,
    'is_lifetime', v_license.is_lifetime,
    'was_upgrade', v_profile.plan != v_license.plan_type,
    'was_renewal', v_profile.plan = v_license.plan_type and v_profile.plan_expires_at is not null
  );
end;
$$;

-- 7. INSERT TEST LICENSE CODES
insert into public.license_codes (code, plan_type, duration_months, is_lifetime)
values 
  ('STARTER-1M-TEST', 'STARTER', 1, false),
  ('STARTER-6M-TEST', 'STARTER', 6, false),
  ('PRO-1M-TEST', 'PRO', 1, false),
  ('PRO-6M-TEST', 'PRO', 6, false),
  ('PRO-LIFETIME-TEST', 'PRO', null, true)
on conflict (code) do nothing;

-- 8. GRANT EXECUTE PERMISSION
grant execute on function public.claim_license_code to authenticated;
