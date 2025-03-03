
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

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
    // Get the request body
    const { messages, userId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Configure OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Add system message with role information
    let systemMessage = "You are an AI assistant for the admin dashboard.";
    
    // If userId is provided, get the user role
    if (userId) {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (!rolesError && userRoles && userRoles.length > 0) {
        systemMessage += ` The user is an ${userRoles[0].role}.`;
      }
      
      // Get user profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!profileError && profile) {
        systemMessage += ` User email: ${profile.email}. User plan: ${profile.plan}.`;
      }
    }

    // Add system message to beginning of messages array if not already present
    const updatedMessages = messages;
    if (messages.length === 0 || messages[0].role !== 'system') {
      updatedMessages.unshift({ role: 'system', content: systemMessage });
    }

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: updatedMessages,
    });

    // Return the response
    return new Response(
      JSON.stringify(completion.data.choices[0].message),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
