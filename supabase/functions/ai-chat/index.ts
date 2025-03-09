
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
    console.log("Processing AI chat request");
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Get request body
    const requestBody = await req.json();
    const { message, filePath, fileContent } = requestBody;

    if (!message) {
      console.error('Message is required');
      throw new Error('Message is required');
    }

    console.log(`Processing message: "${message.substring(0, 50)}..."${filePath ? ` with file: ${filePath}` : ''}`);

    // Build the messages array for OpenAI
    const messages = [];
    
    // Add system message with comprehensive instructions
    messages.push({
      role: 'system',
      content: `You are an AI assistant for audiodescriptions.online admin dashboard. 
You help with analyzing user data, managing content, and providing insights about audio description generation.
You can assist with code analysis, project files, and technical questions.
Provide clear, accurate, and helpful responses.
The site helps users create AI-generated audio descriptions for their products, with features for text-to-speech and analytics.`
    });
    
    // Add file context if provided
    if (filePath && fileContent) {
      messages.push({
        role: 'user',
        content: `Here is the content of file "${filePath}":\n\n${fileContent}\n\nPlease analyze this file.`
      });
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    try {
      console.log("Calling OpenAI API...");
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.text();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData}`);
      }

      const data = await openAIResponse.json();
      const responseText = data.choices[0].message.content;

      console.log(`AI response generated successfully, length: ${responseText.length}`);

      return new Response(JSON.stringify({ response: responseText }), { 
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
