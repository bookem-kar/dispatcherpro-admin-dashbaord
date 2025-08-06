import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, action } = await req.json()
    
    console.log(`Processing user status update - userId: ${userId}, action: ${action}`)

    if (!userId || !action) {
      console.error('Missing required parameters:', { userId, action })
      return new Response(
        JSON.stringify({ error: 'Missing userId or action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['suspend', 'reinstate'].includes(action)) {
      console.error('Invalid action:', action)
      return new Response(
        JSON.stringify({ error: 'Action must be "suspend" or "reinstate"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Query user data with company relationship
    const { data: userData, error: queryError } = await supabase
      .from('platform_users')
      .select(`
        id,
        email,
        is_suspended,
        companies!inner(company_uid)
      `)
      .eq('id', userId)
      .single()

    if (queryError) {
      console.error('Error fetching user data:', queryError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userData) {
      console.error('User not found:', userId)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format active_status based on action
    const active_status = action === 'suspend' ? 'inactive' : 'active'

    // Prepare N8N webhook payload
    const webhookPayload = {
      email: userData.email,
      'platform_users id': userData.id,
      active_status,
      company_id: userData.companies.company_uid
    }

    console.log('Sending webhook payload to N8N:', webhookPayload)

    // Call N8N webhook
    const webhookResponse = await fetch('https://dispatcherpro.app.n8n.cloud/webhook/user-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('N8N webhook failed:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      })
      return new Response(
        JSON.stringify({ 
          error: 'Failed to trigger N8N workflow',
          details: `HTTP ${webhookResponse.status}: ${webhookResponse.statusText}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const webhookResult = await webhookResponse.text()
    console.log('N8N webhook response:', webhookResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User status workflow triggered successfully`,
        payload: webhookPayload
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in update-user-status function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})