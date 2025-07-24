-- Update api_credentials table to allow null api_key for n8n credentials
ALTER TABLE public.api_credentials ALTER COLUMN api_key DROP NOT NULL;