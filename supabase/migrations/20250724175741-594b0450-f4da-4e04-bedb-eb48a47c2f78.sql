-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_uid TEXT NOT NULL UNIQUE,
  company_string_uuid TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'suspended', 'inactive')),
  plan_tier TEXT NOT NULL DEFAULT 'trial' CHECK (plan_tier IN ('trial', 'standard', 'pro', 'enterprise')),
  admin_user_id TEXT,
  max_seats INTEGER,
  active_user_count INTEGER DEFAULT 0,
  phone_toll_free TEXT,
  phone_number TEXT NOT NULL,
  fax_number TEXT,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  mc_number TEXT NOT NULL,
  website TEXT NOT NULL,
  admin_first_name TEXT NOT NULL,
  admin_last_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  admin_phone TEXT NOT NULL,
  bubble_company_id TEXT,
  super_dispatch_acct TEXT,
  central_dispatch_acct TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspended_reason TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policies for companies (platform admins can manage all companies)
CREATE POLICY "Platform admins can view all companies" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Platform admins can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Platform admins can update companies" 
ON public.companies 
FOR UPDATE 
USING (true);

CREATE POLICY "Platform admins can delete companies" 
ON public.companies 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create users table
CREATE TABLE public.platform_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'company_admin' CHECK (role IN ('platform_admin', 'platform_support', 'company_admin', 'dispatcher', 'sales', 'read_only')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_user_id UUID
);

-- Enable Row Level Security
ALTER TABLE public.platform_users ENABLE ROW LEVEL SECURITY;

-- Create policies for platform users
CREATE POLICY "Platform admins can view all users" 
ON public.platform_users 
FOR SELECT 
USING (true);

CREATE POLICY "Platform admins can create users" 
ON public.platform_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Platform admins can update users" 
ON public.platform_users 
FOR UPDATE 
USING (true);

CREATE POLICY "Platform admins can delete users" 
ON public.platform_users 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_platform_users_updated_at
BEFORE UPDATE ON public.platform_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create activity events table
CREATE TABLE public.activity_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.platform_users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  meta JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Create policies for activity events
CREATE POLICY "Platform admins can view all activity events" 
ON public.activity_events 
FOR SELECT 
USING (true);

CREATE POLICY "Platform admins can create activity events" 
ON public.activity_events 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_companies_status ON public.companies(status);
CREATE INDEX idx_companies_company_uid ON public.companies(company_uid);
CREATE INDEX idx_companies_company_string_uuid ON public.companies(company_string_uuid);
CREATE INDEX idx_platform_users_company_id ON public.platform_users(company_id);
CREATE INDEX idx_platform_users_email ON public.platform_users(email);
CREATE INDEX idx_activity_events_company_id ON public.activity_events(company_id);
CREATE INDEX idx_activity_events_user_id ON public.activity_events(user_id);
CREATE INDEX idx_activity_events_timestamp ON public.activity_events(timestamp);
CREATE INDEX idx_activity_events_type ON public.activity_events(type);