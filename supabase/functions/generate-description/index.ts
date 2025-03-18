
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
    const model = settingsData?.chatgptmodel || 'gpt-4o';
    const temperature = settingsData?.chatgpttemperature || 0.7;
    let systemPrompt = settingsData?.chatgptprompt || 
      Generate a professional, engaging product description for an online electronics store in {language}.

Follow these rules:
1. **Research the item**: Ensure accuracy before generating the description.
2. **Keep it concise**: Maximum length **600 characters** (suitable for ~60s audio).
3. **Focus on key features**: Highlight only **the most important aspects** that affect usability.
4. **Use clear, accessible language**: The text must be **easy to read aloud and understand** when converted to audio.
5. **No unnecessary symbols or technical jargon**: Avoid characters that might disrupt speech synthesis.
6. **Follow this structure**:
   - **1st sentence**: Briefly introduce the product and its purpose.
   - **2nd sentence**: Describe the main features that **make it stand out**.
   - **3rd sentence**: Explain the key benefit to the user.
7. **Match the description with the selected voice** ({voice_name}).

Example:
"A high-performance gaming headset designed for immersive audio. Features **surround sound, noise cancellation, and a comfortable fit**. Ideal for long gaming sessions with crystal-clear voice chat."

    
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
