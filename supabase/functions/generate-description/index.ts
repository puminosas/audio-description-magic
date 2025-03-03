
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Generate description function called');
    
    // Get request body
    const { product_name, language, voice_name } = await req.json();
    
    if (!product_name) {
      throw new Error('Product name is required');
    }

    // Language defaults to English if not provided
    const lang = language || 'en-US';
    console.log(`Generating description for: ${product_name} in language: ${lang}`);
    
    // OpenAI API key from environment variable
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    // Determine the system prompt based on language
    const systemPrompt = getLanguagePrompt(lang);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Generate a concise and compelling product description for "${product_name}". The description should be informative, engaging, and suitable for audio narration.`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const generated_text = data.choices[0]?.message?.content?.trim();
    
    if (!generated_text) {
      throw new Error('Failed to generate description text');
    }
    
    console.log('Successfully generated description');
    
    return new Response(
      JSON.stringify({
        success: true,
        generated_text,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in generate-description:', error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

// Helper function to get language-specific prompts
function getLanguagePrompt(languageCode: string): string {
  // Default English prompt
  const defaultPrompt = `You are an AI specialized in creating engaging product descriptions for e-commerce. 
  Create a concise, compelling description that highlights key features and benefits. 
  The description should be 2-3 sentences, conversational in tone, and optimized for text-to-speech.`;
  
  // Language-specific prompts
  const languagePrompts: Record<string, string> = {
    'fr-FR': `Vous êtes une IA spécialisée dans la création de descriptions de produits attrayantes pour le e-commerce. 
    Créez une description concise et convaincante qui met en évidence les caractéristiques et les avantages clés. 
    La description doit comporter 2 à 3 phrases, avoir un ton conversationnel et être optimisée pour la synthèse vocale.`,
    
    'es-ES': `Eres una IA especializada en crear descripciones de productos atractivas para e-commerce. 
    Crea una descripción concisa y convincente que destaque las características y beneficios clave. 
    La descripción debe tener 2-3 oraciones, con un tono conversacional y optimizada para texto a voz.`,
    
    'de-DE': `Sie sind eine KI, die auf die Erstellung ansprechender Produktbeschreibungen für E-Commerce spezialisiert ist. 
    Erstellen Sie eine prägnante, überzeugende Beschreibung, die die wichtigsten Funktionen und Vorteile hervorhebt. 
    Die Beschreibung sollte 2-3 Sätze umfassen, einen konversationellen Ton haben und für Text-to-Speech optimiert sein.`,
    
    // Add more languages as needed
  };
  
  // Get language code prefix (e.g., 'en' from 'en-US')
  const langPrefix = languageCode.split('-')[0];
  
  // Find exact match or prefix match
  return languagePrompts[languageCode] || 
         Object.entries(languagePrompts).find(([key]) => key.startsWith(langPrefix))?.[1] || 
         defaultPrompt;
}
