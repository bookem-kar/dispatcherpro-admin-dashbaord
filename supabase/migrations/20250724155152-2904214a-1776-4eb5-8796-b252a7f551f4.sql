-- Create API credentials table to store Bubble.io and n8n credentials
CREATE TABLE public.api_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('bubble_io', 'n8n')),
  credential_name TEXT NOT NULL,
  base_url TEXT,
  api_key TEXT NOT NULL,
  webhook_url TEXT,
  auth_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for API credentials
CREATE POLICY "Users can view their own API credentials" 
ON public.api_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API credentials" 
ON public.api_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API credentials" 
ON public.api_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API credentials" 
ON public.api_credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create workflow logs table to track n8n executions
CREATE TABLE public.workflow_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  workflow_type TEXT NOT NULL DEFAULT 'company_creation',
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  request_payload JSONB,
  response_data JSONB,
  error_message TEXT,
  n8n_execution_id TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow logs
CREATE POLICY "Users can view workflow logs they created" 
ON public.workflow_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create workflow logs" 
ON public.workflow_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_api_credentials_updated_at
  BEFORE UPDATE ON public.api_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_api_credentials_user_type ON public.api_credentials(user_id, credential_type);
CREATE INDEX idx_workflow_logs_company_status ON public.workflow_logs(company_id, status);