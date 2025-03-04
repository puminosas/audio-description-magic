
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { product_name, language = 'en', voice_name = 'default' } = await req.json();

    if (!product_name) {
      return new Response(
        JSON.stringify({ error: 'Product name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load OpenAI credentials from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      console.error("Missing OpenAI API key");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey: openaiApiKey });
    const openai = new OpenAIApi(configuration);

    // Determine language for prompt
    const languagePrompt = language === 'en' ? 'English' : 
                         language.startsWith('fr') ? 'French' :
                         language.startsWith('es') ? 'Spanish' :
                         language.startsWith('de') ? 'German' :
                         language.startsWith('it') ? 'Italian' :
                         language.startsWith('pt') ? 'Portuguese' :
                         language.startsWith('ru') ? 'Russian' :
                         language.startsWith('ja') ? 'Japanese' :
                         language.startsWith('zh') ? 'Chinese' :
                         language.startsWith('ar') ? 'Arabic' :
                         language.startsWith('hi') ? 'Hindi' :
                         language.startsWith('bn') ? 'Bengali' :
                         'English';

    // Create prompt
    const prompt = `Generate a concise, engaging product description for "${product_name}" in ${languagePrompt}. 
The description should be approximately 2-3 sentences, highlighting key features and benefits.
Make it suitable for an audio description that will be read aloud by a text-to-speech service.
Write in a conversational, friendly tone. Don't include bullet points or formatting that wouldn't work well in audio.`;

    console.log(`Generating description for "${product_name}" in ${languagePrompt}`);
    
    try {
      // Generate completion
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 300,
        temperature: 0.7,
      });

      const generatedText = completion.data.choices?.[0]?.text?.trim() || '';
      
      if (!generatedText) {
        console.error("No text generated from OpenAI");
        return new Response(
          JSON.stringify({ error: 'Failed to generate description' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log("Successfully generated description");

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          generated_text: generatedText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Check if it's a rate limit error
      const errorMsg = openaiError.message || '';
      if (errorMsg.includes('rate limit') || openaiError.status === 429) {
        return new Response(
          JSON.stringify({ error: 'OpenAI rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // For other OpenAI errors
      return new Response(
        JSON.stringify({ error: 'OpenAI service error: ' + errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error generating description:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate description' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
