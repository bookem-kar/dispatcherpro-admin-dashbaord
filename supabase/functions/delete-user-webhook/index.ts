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
    // Get the webhook URL from secrets
    const webhookUrl = Deno.env.get('DELETE_USER_WEBHOOK_URL');
    console.log('Retrieved webhook URL from env:', webhookUrl ? 'URL found' : 'URL not found');
    
    if (!webhookUrl) {
      console.error('DELETE_USER_WEBHOOK_URL environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userId, deletedByUserId } = await req.json()
    
    console.log(`Processing user deletion - userId: ${userId}, deletedByUserId: ${deletedByUserId}`)

    if (!userId || !deletedByUserId) {
      console.error('Missing required parameters:', { userId, deletedByUserId })
      return new Response(
        JSON.stringify({ error: 'Missing userId or deletedByUserId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Query user data to get external_user_uid
    const { data: userData, error: queryError } = await supabase
      .from('platform_users')
      .select('id, external_user_uid')
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

    // Prepare webhook payload with required data
    const webhookPayload = {
      selectedUserSupabaseId: userData.id,
      selectedUserExternalUid: userData.external_user_uid,
      deletedByUserUid: deletedByUserId
    }

    console.log('Sending webhook payload:', webhookPayload)

    // Call the webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('Delete user webhook failed:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      })
      return new Response(
        JSON.stringify({ 
          error: 'Failed to trigger delete user workflow',
          details: `HTTP ${webhookResponse.status}: ${webhookResponse.statusText}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const webhookResult = await webhookResponse.text()
    console.log('Delete user webhook response:', webhookResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User deletion workflow triggered successfully`,
        payload: webhookPayload
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in delete-user-webhook function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})