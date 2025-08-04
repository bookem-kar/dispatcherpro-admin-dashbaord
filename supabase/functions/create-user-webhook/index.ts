import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { companyId, email, firstName, lastName, phoneNumber, role } = await req.json()

    console.log('Creating user with data:', { companyId, email, firstName, lastName, phoneNumber, role })

    // Fetch company data to get company_uid and bubble_company_id
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('id, company_uid, bubble_company_id')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('Company fetch error:', companyError)
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare webhook payload
    const webhookPayload = {
      company_uid: company.company_uid,
      company_id: company.id,
      bubble_company_id: company.bubble_company_id,
      email,
      firstName,
      lastName,
      phoneNumber, // Only passed to webhook, not stored in Supabase
      role
    }

    console.log('Calling N8N webhook with payload:', webhookPayload)

    // Call N8N webhook
    const webhookResponse = await fetch('https://dispatcherpro.app.n8n.cloud/webhook/create-new-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!webhookResponse.ok) {
      console.error('N8N webhook error:', await webhookResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to call external webhook' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const webhookResult = await webhookResponse.json()
    console.log('N8N webhook response:', webhookResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        webhookResponse: webhookResult 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in create-user-webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})