import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get the webhook URL from secrets
    const webhookUrl = Deno.env.get('COMPANY_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    // Parse the request body (form data)
    const formData = await req.json();
    
    console.log('Calling webhook with form data:', formData);

    // Call the webhook with the form data as JSON body
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    // Get the response from the webhook
    let webhookResult;
    try {
      webhookResult = await webhookResponse.json();
    } catch (error) {
      // If webhook doesn't return JSON, use the text response
      webhookResult = { message: await webhookResponse.text() };
    }

    if (!webhookResponse.ok) {
      throw new Error(`Webhook call failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
    }

    console.log('Webhook called successfully:', webhookResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        webhookResponse: webhookResult 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in call-company-webhook:', error);

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