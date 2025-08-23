-- Fix security issue: Restrict companies table access to proper authorization
-- Drop the overly permissive existing policies
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can delete companies" ON public.companies;

-- Create a security definer function to get user's company ID to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM public.platform_users WHERE id = user_uuid AND is_active = true LIMIT 1;
$$;

-- Create a security definer function to check if user is a super admin (can view all companies)
-- For now, we'll consider users without company_id as super admins
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_users 
    WHERE id = user_uuid 
    AND is_active = true 
    AND company_id IS NULL
    AND role = 'super_admin'
  );
$$;

-- New secure RLS policies for companies table

-- Users can only view companies they belong to, or super admins can view all
CREATE POLICY "Users can view their own company or super admins view all"
ON public.companies
FOR SELECT
TO authenticated
USING (
  public.is_super_admin(auth.uid()) OR 
  id = public.get_user_company_id(auth.uid())
);

-- Only super admins can create companies
CREATE POLICY "Only super admins can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

-- Users can update their own company data, super admins can update any
CREATE POLICY "Users can update their own company or super admins update any"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  public.is_super_admin(auth.uid()) OR 
  id = public.get_user_company_id(auth.uid())
)
WITH CHECK (
  public.is_super_admin(auth.uid()) OR 
  id = public.get_user_company_id(auth.uid())
);

-- Only super admins can delete companies
CREATE POLICY "Only super admins can delete companies"
ON public.companies
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));