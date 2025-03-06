
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from "https://esm.sh/openai@4.20.1";

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

  try {
    const { product_name, language, voice_name } = await req.json();
    
    if (!product_name) {
      return new Response(
        JSON.stringify({ success: false, error: "Product name is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating description for "${product_name}" in ${language} with voice ${voice_name}`);

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Create enhanced system prompt
    const systemPrompt = `
      Create an engaging product description in ${language} for an online electronics store. 
      Focus on the most important features and benefits that appeal to customers of all ages. 
      Write in clear, accessible language that's easy to understand when read aloud or converted to audio. 
      Structure the description logically, avoiding unnecessary symbols or characters. 
      Keep the length suitable for a 60-second audio clip. 
      Match the language to the user's selection (${language}) and consider the voice name "${voice_name}" for the audio output.
    `;

    // Generate description
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
        generated_text: generatedText
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
