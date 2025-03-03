
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

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
    const { product_name, language = 'en-US', voice_name = 'default', category = 'general' } = await req.json();

    if (!product_name) {
      throw new Error('Product name is required');
    }

    console.log(`Generating description for product: ${product_name}, language: ${language}`);

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Language-specific instructions
    const languageCode = language.split('-')[0];
    
    // Create system prompt for the specified language
    const systemPrompt = `You are an AI product description generator. 
      Your task is to create an engaging and concise product description for '${product_name}' in the '${category}' category.
      Highlight key features, benefits, and unique selling points.
      Ensure the language is clear, natural, and easy to understand when read aloud or converted into audio.
      Maintain a professional yet engaging tone suitable for marketing purposes.
      Structure the response well, avoiding unnecessary symbols or characters.
      The description should be in ${languageCode === 'en' ? 'English' : languageCode} language.
      Keep the response relatively short - around 150-200 words maximum.`;

    // Generate the product description
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a concise and engaging product description for: ${product_name}` }
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    // Extract the generated text
    const generatedText = response.data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error('Failed to generate product description');
    }

    console.log('Successfully generated product description');

    // Return the generated description
    return new Response(
      JSON.stringify({
        success: true,
        generated_text: generatedText,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating product description:', error);
    
    return new Response(
      JSON.stringify({
        success: false, 
        error: error.message || 'Failed to generate product description'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
