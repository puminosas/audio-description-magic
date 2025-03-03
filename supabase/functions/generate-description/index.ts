
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts"; // Required for fetch in Deno

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
    // Get request body
    const { product_name, language = 'en', voice_name = 'default' } = await req.json();

    if (!product_name) {
      throw new Error('Missing required field: product_name');
    }

    console.log(`Generating description for product: ${product_name}, language: ${language}`);

    // Set up a simple default description if OpenAI fails
    const defaultDescription = `${product_name} is a high-quality product designed to meet your needs. It features excellent craftsmanship and reliable performance.`;

    // Try to generate with OpenAI
    try {
      const openAIKey = Deno.env.get('OPENAI_API_KEY');
      
      if (!openAIKey) {
        console.log('No OpenAI API key found, returning default description');
        return new Response(
          JSON.stringify({ success: true, generated_text: defaultDescription }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI product description generator. Create a concise, engaging product description for "${product_name}" in ${language} language.
              The description should be 2-3 sentences highlighting key features and benefits. Make it sound natural for text-to-speech conversion.`
            },
            { 
              role: 'user', 
              content: `Write a product description for: ${product_name}` 
            }
          ],
          max_tokens: 250,
        }),
      });

      const data = await response.json();
      
      if (data.error || !data.choices || !data.choices[0]) {
        console.error('OpenAI API error:', data.error || 'No choices returned');
        throw new Error('Failed to generate description using AI');
      }

      const generatedText = data.choices[0].message.content.trim();
      console.log('Successfully generated description with OpenAI');

      return new Response(
        JSON.stringify({ success: true, generated_text: generatedText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAiError) {
      console.error('Error with OpenAI description generation:', openAiError);
      // Fall back to default description
      return new Response(
        JSON.stringify({ success: true, generated_text: defaultDescription }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-description function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
