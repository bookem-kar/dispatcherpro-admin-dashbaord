import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Set the auth header for the client
    supabaseClient.auth.setAuth(authHeader.replace('Bearer ', ''));

    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Parse request body
    const { companyData } = await req.json();
    if (!companyData) {
      throw new Error('Missing company data');
    }

    console.log('Triggering n8n workflow for company:', companyData.name);

    // Fetch API credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (credError) {
      throw new Error(`Failed to fetch credentials: ${credError.message}`);
    }

    const bubbleCredential = credentials?.find(c => c.credential_type === 'bubble_io');
    const n8nCredential = credentials?.find(c => c.credential_type === 'n8n');

    if (!bubbleCredential) {
      throw new Error('Bubble.io credentials not configured');
    }

    if (!n8nCredential) {
      throw new Error('n8n credentials not configured');
    }

    // Create workflow log entry
    const { data: workflowLog, error: logError } = await supabaseClient
      .from('workflow_logs')
      .insert({
        company_id: companyData.id,
        user_id: user.id,
        workflow_type: 'company_creation',
        status: 'pending',
        request_payload: {
          company: companyData,
          bubble_config: {
            base_url: bubbleCredential.base_url,
            // Don't log sensitive data
          }
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create workflow log:', logError);
    }

    // Prepare payload for n8n
    const n8nPayload = {
      company: companyData,
      bubble_config: {
        base_url: bubbleCredential.base_url,
        api_key: bubbleCredential.api_key
      },
      execution_id: workflowLog?.id || 'unknown'
    };

    // Call n8n webhook
    const n8nResponse = await fetch(n8nCredential.webhook_url!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${n8nCredential.auth_token}`,
      },
      body: JSON.stringify(n8nPayload)
    });

    const n8nResult = await n8nResponse.json();

    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook failed: ${n8nResult.message || 'Unknown error'}`);
    }

    // Update workflow log with success
    if (workflowLog) {
      await supabaseClient
        .from('workflow_logs')
        .update({
          status: 'success',
          response_data: n8nResult,
          completed_at: new Date().toISOString(),
          n8n_execution_id: n8nResult.executionId || null
        })
        .eq('id', workflowLog.id);
    }

    console.log('n8n workflow triggered successfully:', n8nResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        execution_id: workflowLog?.id,
        n8n_response: n8nResult 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in trigger-n8n-workflow:', error);

    // Try to update workflow log with error if we have the context
    try {
      const { companyData } = await req.json();
      if (companyData?.id) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        );

        await supabaseClient
          .from('workflow_logs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('company_id', companyData.id)
          .eq('status', 'pending');
      }
    } catch (logError) {
      console.error('Failed to update error log:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});