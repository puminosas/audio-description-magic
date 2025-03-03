
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface RequestBody {
  product_name: string;
  category?: string;
  language?: string;
  voice_name?: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment variable
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Validate request
    if (!req.body) {
      return new Response(
        JSON.stringify({ error: 'Request body is missing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { product_name, category = 'general', language = 'en', voice_name = 'default' } = await req.json() as RequestBody;
    
    if (!product_name) {
      return new Response(
        JSON.stringify({ error: 'Product name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize OpenAI API
    const configuration = new Configuration({ apiKey: openaiApiKey });
    const openai = new OpenAIApi(configuration);

    // Create optimized prompt
    const systemPrompt = 
      `You are an AI product description generator. Your task is to create an engaging and concise product description for '${product_name}' in the '${category}' category. ` +
      `Highlight key features, benefits, and unique selling points. ` +
      `Ensure the language is clear, natural, and easy to understand when read aloud or converted into audio. ` +
      `Maintain a professional yet engaging tone suitable for marketing purposes. ` +
      `Structure the response well, avoiding unnecessary symbols or characters. ` +
      `Match the language to '${language}', and consider the voice name '${voice_name}' for the final audio format.`;

    // Generate description using GPT-3.5-turbo
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate an engaging product description for '${product_name}'.` }
      ]
    });

    if (!response.data || !response.data.choices || !response.data.choices[0].message) {
      throw new Error('Failed to generate description with GPT-3.5-turbo');
    }

    const generatedText = response.data.choices[0].message.content;

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        generated_text: generatedText
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } 
  catch (error) {
    console.error('Error generating description:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate description' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
