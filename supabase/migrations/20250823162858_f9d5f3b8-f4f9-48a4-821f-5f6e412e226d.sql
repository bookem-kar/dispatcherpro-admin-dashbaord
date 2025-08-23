-- Drop complex RLS policies on companies table
DROP POLICY IF EXISTS "Only super admins can create companies" ON public.companies;
DROP POLICY IF EXISTS "Only super admins can delete companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company or super admins update any" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company or super admins view all" ON public.companies;

-- Create simple authenticated-only policies for companies table
CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update companies" 
ON public.companies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete companies" 
ON public.companies 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Update api_credentials table to allow all authenticated users
DROP POLICY IF EXISTS "Users can create their own API credentials" ON public.api_credentials;
DROP POLICY IF EXISTS "Users can delete their own API credentials" ON public.api_credentials;
DROP POLICY IF EXISTS "Users can update their own API credentials" ON public.api_credentials;
DROP POLICY IF EXISTS "Users can view their own API credentials" ON public.api_credentials;

CREATE POLICY "Authenticated users can view API credentials" 
ON public.api_credentials 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create API credentials" 
ON public.api_credentials 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update API credentials" 
ON public.api_credentials 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete API credentials" 
ON public.api_credentials 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Update workflow_logs table to allow all authenticated users
DROP POLICY IF EXISTS "Users can create workflow logs" ON public.workflow_logs;
DROP POLICY IF EXISTS "Users can view workflow logs they created" ON public.workflow_logs;

CREATE POLICY "Authenticated users can view workflow logs" 
ON public.workflow_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create workflow logs" 
ON public.workflow_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update workflow logs" 
ON public.workflow_logs 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete workflow logs" 
ON public.workflow_logs 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Drop the now-unused functions
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);