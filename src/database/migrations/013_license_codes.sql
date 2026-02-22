-- Create license_codes table
CREATE TABLE IF NOT EXISTS public.license_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('STARTER', 'PRO')),
    duration_months INTEGER DEFAULT 1,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    order_id TEXT UNIQUE, -- Cashfree Order ID
    customer_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.license_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage everything
CREATE POLICY "Service role can do everything on license_codes" 
ON public.license_codes 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow public read-only access to verify if a code is valid (but not used)
CREATE POLICY "Public can check if code exists and is unused" 
ON public.license_codes 
FOR SELECT 
TO authenticated, anon
USING (is_used = false);

-- Function to redeem a license code
CREATE OR REPLACE FUNCTION public.redeem_license_code(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_license RECORD;
    v_profile RECORD;
BEGIN
    -- 1. Find the license code
    SELECT * INTO v_license FROM public.license_codes WHERE code = p_code AND is_used = false;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or already used license code');
    END IF;

    -- 2. Update the user's profile
    UPDATE public.profiles
    SET 
        effective_plan = v_license.plan_type,
        plan_expires_at = NOW() + (v_license.duration_months || ' months')::INTERVAL,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- 3. Mark the license code as used
    UPDATE public.license_codes
    SET 
        is_used = true,
        used_at = NOW()
    WHERE id = v_license.id;

    RETURN jsonb_build_object(
        'success', true, 
        'plan', v_license.plan_type,
        'expires_at', NOW() + (v_license.duration_months || ' months')::INTERVAL
    );
END;
$$;
