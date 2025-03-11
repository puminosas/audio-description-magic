
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from "https://esm.sh/openai@4.20.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error("Missing OPENAI_API_KEY environment variable");
    return new Response(
      JSON.stringify({ success: false, error: "API configuration error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get Supabase client for fetching settings
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    return new Response(
      JSON.stringify({ success: false, error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { product_name, language, voice_name } = await req.json();
    
    if (!product_name) {
      return new Response(
        JSON.stringify({ success: false, error: "Product name is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating description for "${product_name}" in ${language} with voice ${voice_name}`);
    
    // Fetch ChatGPT settings from app_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('app_settings')
      .select('chatgptmodel, chatgpttemperature, chatgptprompt')
      .single();
    
    if (settingsError) {
      console.error('Error fetching ChatGPT settings:', settingsError);
    }
    
    // Default settings if database fetch fails
    const model = settingsData?.chatgptmodel || 'gpt-3.5-turbo';
    const temperature = settingsData?.chatgpttemperature || 0.7;
    let systemPrompt = settingsData?.chatgptprompt || 
      `Create an engaging product description in ${language} for an online electronics store. 
      Focus on the most important features and benefits that appeal to customers of all ages. 
      Write in clear, accessible language that's easy to understand when read aloud or converted to audio. 
      Structure the description logically, avoiding unnecessary symbols or characters. 
      Keep the length suitable for a 60-second audio clip. 
      Match the language to the user's selection (${language}) and consider the voice name "${voice_name}" for the audio output.`;
    
    // Replace variables in the prompt
    systemPrompt = systemPrompt
      .replace(/{language}/g, language)
      .replace(/{voice_name}/g, voice_name);

    console.log(`Using model: ${model}, temperature: ${temperature}`);

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Generate description
    const response = await openai.chat.completions.create({
      model: model,
      temperature: temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Write a concise and engaging audio description for this product: ${product_name}` }
      ]
    });

    const generatedText = response.choices[0].message.content;
    
    console.log("Successfully generated description");

    return new Response(
      JSON.stringify({ 
        success: true, 
        generated_text: generatedText,
        model_used: model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-description:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
