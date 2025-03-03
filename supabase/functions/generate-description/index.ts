
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI API key is not configured',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const { product_name, language, voice_name } = await req.json();
    
    if (!product_name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Product name is required',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Generating description for: ${product_name} in ${language} with voice ${voice_name}`);

    const systemPrompt = `You are a professional product description writer that creates engaging, concise descriptions for e-commerce products.
Create a description for "${product_name}" that is:
- Engaging and persuasive, but not overly sales-y
- Around 2-3 sentences long (for voice readability)
- Using natural, conversational language that sounds good when read aloud
- Highlighting key features and benefits
- Appropriate for the language: ${language || 'English'}`;

    // Call OpenAI API directly using fetch instead of the SDK
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using smaller, faster model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write a brief, engaging description for this product: ${product_name}` }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      // Return fallback description if OpenAI fails
      const fallbackText = `Introducing the ${product_name}. This high-quality product offers exceptional performance and value. Discover what makes ${product_name} a favorite choice among customers.`;
      
      return new Response(
        JSON.stringify({
          success: true,
          generated_text: fallbackText,
          note: "Used fallback description due to API error"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();

    console.log("Successfully generated description");
    
    return new Response(
      JSON.stringify({
        success: true,
        generated_text: generatedText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error generating description:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error generating description: ${error.message || error}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
