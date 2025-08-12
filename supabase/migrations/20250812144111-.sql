-- Fix critical security vulnerability: Replace 'true' RLS policies with proper authentication checks
-- This prevents unauthorized access to sensitive user and company data

-- First, drop the existing insecure policies that allow unrestricted access
DROP POLICY IF EXISTS "Platform admins can view all users" ON public.platform_users;
DROP POLICY IF EXISTS "Platform admins can create users" ON public.platform_users;
DROP POLICY IF EXISTS "Platform admins can update users" ON public.platform_users;
DROP POLICY IF EXISTS "Platform admins can delete users" ON public.platform_users;

DROP POLICY IF EXISTS "Platform admins can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Platform admins can create companies" ON public.companies;
DROP POLICY IF EXISTS "Platform admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Platform admins can delete companies" ON public.companies;

DROP POLICY IF EXISTS "Platform admins can view all activity events" ON public.activity_events;
DROP POLICY IF EXISTS "Platform admins can create activity events" ON public.activity_events;

-- Create secure RLS policies that require actual authentication
-- These policies only allow access to authenticated users (auth.uid() is not null)

-- Secure platform_users table policies
CREATE POLICY "Authenticated users can view platform users" 
ON public.platform_users 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create platform users" 
ON public.platform_users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update platform users" 
ON public.platform_users 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete platform users" 
ON public.platform_users 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Secure companies table policies  
CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update companies" 
ON public.companies 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete companies" 
ON public.companies 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Secure activity_events table policies
CREATE POLICY "Authenticated users can view activity events" 
ON public.activity_events 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create activity events" 
ON public.activity_events 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);