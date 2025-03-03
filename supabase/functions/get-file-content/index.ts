
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const isValidFilePath = (path: string): boolean => {
  // Basic security check to prevent access to sensitive files
  const forbiddenPatterns = [
    /\.env/i,
    /config\.toml/i,
    /password/i,
    /secret/i,
    /\.git/i,
    /node_modules/i
  ];
  
  return !forbiddenPatterns.some(pattern => pattern.test(path));
};

const mockFiles = {
  "src/utils/audio/generationService.ts": `import { supabase } from '@/integrations/supabase/client';
import { AudioGenerationResult, AudioSuccessResult, AudioErrorResult, LanguageOption, VoiceOption } from './types';

/**
 * Generate an audio description using Google Text-to-Speech via our Supabase Edge Function
 */
export async function generateAudioDescription(
  text: string,
  language: LanguageOption,
  voice: VoiceOption
): Promise<AudioGenerationResult> {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { error: 'Authentication required to generate audio descriptions' };
    }

    // Generate description if needed
    let finalText = text;
    
    if (text.length < 20) {
      // This is likely a product name, so generate a description
      const { data: descriptionData, error: descriptionError } = await supabase.functions.invoke('generate-description', {
        body: {
          product_name: text,
          language: language.code,
          voice_name: voice.name
        }
      });

      if (descriptionError || !descriptionData.success) {
        console.error('Error generating description:', descriptionError || descriptionData.error);
        return { error: 'Failed to generate product description' };
      }

      finalText = descriptionData.generated_text;
    }

    // Generate audio with Google TTS
    const { data, error } = await supabase.functions.invoke('generate-google-tts', {
      body: {
        text: finalText,
        language: language.code,
        voice: voice.id,
        user_id: session.user.id
      }
    });

    if (error || !data.success) {
      console.error('Error generating audio:', error || data.error);
      return { error: error?.message || data?.error || 'Failed to generate audio' };
    }

    return {
      audioUrl: data.audio_url,
      text: finalText,
    };
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return { error: error.message || 'Failed to generate audio description' };
  }
}`,

  "src/components/generator/GeneratorForm.tsx": `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, MessageSquare } from 'lucide-react';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import { LanguageOption, VoiceOption, getAvailableLanguages, getAvailableVoices } from '@/utils/audio';
import FeedbackDialog from '@/components/feedback/FeedbackDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// Component implementation
const GeneratorForm = ({ onGenerate, loading }) => {
  // State management for form
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(getAvailableLanguages()[0]);
  const [selectedVoice, setSelectedVoice] = useState(getAvailableVoices('en')[0]);
  
  // Form submission logic
  const handleSubmit = async () => {
    await onGenerate({
      text: text.trim(),
      language: selectedLanguage,
      voice: selectedVoice
    });
  };

  return (
    <div>
      {/* Form content */}
    </div>
  );
};

export default GeneratorForm;`,

  "supabase/functions/generate-description/index.ts": `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const apiKey = Deno.env.get('OPENAI_API_KEY');
const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_name, language, voice_name } = await req.json();

    if (!product_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Product name is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create prompt for product description
    const prompt = \`Generate a concise, informative product description for "\${product_name}" 
    that highlights its key features and benefits. The description should be 2-3 sentences 
    and optimized for text-to-speech in \${language || 'English'}. 
    Make it sound natural and conversational.\`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    const generated_text = response.data.choices[0].text.trim();

    return new Response(
      JSON.stringify({ success: true, generated_text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating description:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to generate description' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});`
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();
    
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'File path is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Security check
    if (!isValidFilePath(filePath)) {
      return new Response(
        JSON.stringify({ error: 'Access to this file is restricted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // For development/demo purposes, we'll use mock file content
    // In production, this would access actual project files securely
    let content = null;
    
    // Check if this is a mock file we have predefined
    if (mockFiles[filePath]) {
      content = mockFiles[filePath];
      console.log(`Returning mock content for ${filePath}`);
    } else {
      // For demo purposes, generate a placeholder
      content = `// This is simulated content for ${filePath}\n// In production, this would be the actual file content`;
      console.log(`Generated placeholder for ${filePath}`);
    }

    return new Response(
      JSON.stringify({ filePath, content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error retrieving file content:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to retrieve file content' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
