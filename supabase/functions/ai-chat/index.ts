
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Get request body
    const { messages, userId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid or missing messages array');
    }

    console.log(`Processing AI chat request for user ${userId} with ${messages.length} messages`);

    // Verify admin role if userId is provided
    if (userId) {
      try {
        // Get the JWT from the Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          throw new Error('Missing Authorization header');
        }

        // Check if user has admin role
        const adminCheckResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            'apikey': SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({ role: 'admin' }),
        });

        if (!adminCheckResponse.ok) {
          const errorData = await adminCheckResponse.json();
          console.error('Admin check error:', errorData);
          throw new Error(`Unauthorized: Admin role required. Error: ${JSON.stringify(errorData)}`);
        }

        const isAdmin = await adminCheckResponse.json();
        if (!isAdmin) {
          throw new Error('Unauthorized: Admin access required');
        }
      } catch (error) {
        console.error('Error verifying admin role:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Add a system message if not present
    const systemMessage = {
      role: 'system',
      content: 'You are an AI assistant for audiodescriptions.online admin dashboard. ' +
        'You can help with analyzing user data, managing content, and providing insights about audio description generation. ' +
        'You have access to project files and configuration details. Be helpful, accurate, and concise.'
    };

    const chatMessages = messages.find(m => m.role === 'system') 
      ? messages 
      : [systemMessage, ...messages];

    // Call OpenAI API
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }

      const data = await openAIResponse.json();
      const aiMessage = data.choices[0].message;

      console.log(`AI response generated successfully, length: ${aiMessage.content.length}`);

      return new Response(JSON.stringify(aiMessage), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
