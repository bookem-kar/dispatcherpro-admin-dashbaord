import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { companyId } = await req.json();
    
    if (!companyId) {
      console.error('Missing required companyId parameter');
      return new Response(
        JSON.stringify({ error: 'Missing companyId parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get webhook URL from secrets
    const webhookUrl = Deno.env.get('RESET_COMPANY_PASSWORD_TOKEN_WEBHOOK_URL');
    console.log('Retrieved webhook URL from env:', webhookUrl ? 'URL found' : 'URL not found');
    
    if (!webhookUrl) {
      console.error('RESET_COMPANY_PASSWORD_TOKEN_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing company password reset - companyId:', companyId);

    // Fetch company data to get admin_user_id
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('admin_user_id, name')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('Failed to fetch company:', companyError);
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!company.admin_user_id) {
      console.error('Company has no admin_user_id:', companyId);
      return new Response(
        JSON.stringify({ error: 'Company has no admin user assigned' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Fetch admin user email using admin_user_id
    const { data: adminUser, error: adminUserError } = await supabase
      .from('platform_users')
      .select('email')
      .eq('id', company.admin_user_id)
      .single();

    if (adminUserError || !adminUser) {
      console.error('Failed to fetch admin user:', adminUserError);
      return new Response(
        JSON.stringify({ error: 'Admin user not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const adminEmail = adminUser.email;
    console.log('Found admin email for company:', company.name);

    // Prepare webhook payload
    const webhookPayload = {
      admin_email: adminEmail,
      company_id: companyId,
      company_name: company.name
    };

    console.log('Sending webhook payload for password reset:', webhookPayload);

    // Call the webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook call failed:', errorText);
      throw new Error(`Webhook failed with status ${webhookResponse.status}: ${errorText}`);
    }

    const webhookResult = await webhookResponse.text();
    console.log('Password reset webhook response:', webhookResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        admin_email: adminEmail 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in reset-company-password function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});