import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncCompanyUpdateRequest {
  companyId: string;
  updateData: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, updateData }: SyncCompanyUpdateRequest = await req.json();

    if (!companyId || !updateData) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: companyId and updateData are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get company_uid from database
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_uid')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('Error fetching company:', companyError);
      return new Response(
        JSON.stringify({ 
          error: 'Company not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract required fields from updateData
    const adminUserId = updateData.adminUserId;
    const bubbleCompanyId = updateData.bubbleCompanyId;

    if (!adminUserId || !bubbleCompanyId) {
      console.warn('Missing adminUserId or bubbleCompanyId in updateData');
      // Don't fail the operation, just log the warning
    }

    // Prepare payload for N8N webhook
    const webhookPayload = {
      company_uid: company.company_uid,
      admin_user_id: adminUserId,
      bubble_company_id: bubbleCompanyId,
      update_data: updateData
    };

    console.log('Syncing company update with N8N webhook:', {
      companyId,
      companyUid: company.company_uid,
      webhookPayload
    });

    // Send to N8N webhook
    const webhookResponse = await fetch('https://dispatcherpro.app.n8n.cloud/webhook/edit-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('N8N webhook error:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to sync with external system',
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const webhookResult = await webhookResponse.json();
    console.log('N8N webhook success:', webhookResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Company update synced successfully',
        webhookResult
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Sync company update error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});