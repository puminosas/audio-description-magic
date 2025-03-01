import { supabase } from '@/integrations/supabase/client';
import OpenAI from 'openai';

// OpenAI API key (ensure this is securely stored in environment variables)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAudioDescription = async (
  productName: string,
  language: string,
  voice: string
) => {
  try {
    console.log(`Generating description for: ${productName}`);

    // Step 1: Generate a full product description using OpenAI GPT-4
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at generating engaging product descriptions for e-commerce. Provide a concise yet informative description based on the product name.'
        },
        {
          role: 'user',
          content: `Generate a product description for: ${productName}`
        }
      ]
    });

    const generatedDescription = aiResponse.choices[0].message.content.trim();
    console.log('Generated Description:', generatedDescription);

    // Step 2: Convert the generated description to audio using OpenAI TTS
    const { data, error } = await supabase.functions.invoke('generate-audio', {
      body: {
        text: generatedDescription,
        language,
        voice
      }
    });

    if (error) {
      console.error('Error invoking generate-audio function:', error);
      return { error: error.message };
    }

    return {
      audioUrl: data.audioUrl,
      text: generatedDescription,
      id: data.id
    };
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error generating audio' };
  }
};
