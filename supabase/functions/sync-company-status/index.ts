import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Sync company status function called')
    
    const { companyUid, bubbleCompanyId, status } = await req.json()
    
    if (!companyUid || !bubbleCompanyId || !status) {
      console.error('Missing required fields:', { companyUid, bubbleCompanyId, status })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: companyUid, bubbleCompanyId, status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get active Bubble.io API credentials
    console.log('Fetching Bubble.io API credentials...')
    const { data: credentials, error: credError } = await supabase
      .from('api_credentials')
      .select('base_url, api_key')
      .eq('credential_type', 'bubble_io')
      .eq('is_active', true)
      .single()

    if (credError || !credentials) {
      console.error('Failed to fetch API credentials:', credError)
      return new Response(
        JSON.stringify({ error: 'No active Bubble.io API credentials found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare payload for external API
    const payload = {
      company_uuid: companyUid,
      bubble_company_id: bubbleCompanyId,
      status: status
    }

    console.log('Sending payload to Bubble.io:', payload)

    // Call external Bubble.io API
    const externalResponse = await fetch('https://crm.dispatcherpro.com/version-test/api/1.1/wf/companies-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.api_key}`,
      },
      body: JSON.stringify(payload)
    })

    const responseText = await externalResponse.text()
    
    if (!externalResponse.ok) {
      console.error('External API call failed:', {
        status: externalResponse.status,
        statusText: externalResponse.statusText,
        response: responseText
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'External API call failed',
          status: externalResponse.status,
          details: responseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('External API call successful:', responseText)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company status synced successfully',
        externalResponse: responseText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sync-company-status function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})