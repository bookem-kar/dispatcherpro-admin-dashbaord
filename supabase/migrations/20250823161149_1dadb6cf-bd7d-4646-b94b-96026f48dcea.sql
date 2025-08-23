-- Fix function search path security warning by explicitly setting search_path
-- Update the get_user_company_id function
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT company_id FROM public.platform_users WHERE id = user_uuid AND is_active = true LIMIT 1;
$$;

-- Update the is_super_admin function  
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_users 
    WHERE id = user_uuid 
    AND is_active = true 
    AND company_id IS NULL
    AND role = 'super_admin'
  );
$$;