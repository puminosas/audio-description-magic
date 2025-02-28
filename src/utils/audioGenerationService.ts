
import { supabase } from '@/integrations/supabase/client';

// Reuse the types from the components
import { LanguageOption } from '@/components/ui/LanguageSelector';
import { VoiceOption } from '@/components/ui/VoiceSelector';

export type { LanguageOption, VoiceOption };

export interface AudioGenerationResult {
  audioUrl?: string;
  error?: string;
  text?: string;
  id?: string;
}

export const generateAudioDescription = async (
  productName: string,
  language: LanguageOption,
  voice: VoiceOption
): Promise<AudioGenerationResult> => {
  try {
    console.log(`Generating audio for: ${productName} in ${language.name} with voice ${voice.name}`);
    
    const { data, error } = await supabase.functions.invoke('generate-audio', {
      body: {
        text: productName,
        language: language.code,
        voiceId: voice.id
      },
    });

    if (error) {
      console.error('Error invoking generate-audio function:', error);
      return { error: error.message };
    }

    if (!data || !data.success) {
      console.error('Generation failed:', data?.error || 'Unknown error');
      return { error: data?.error || 'Failed to generate audio' };
    }

    console.log('Audio generated successfully:', data);
    
    return {
      audioUrl: data.audioUrl,
      text: data.text,
      id: data.id
    };
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error generating audio'
    };
  }
};

export const getAvailableLanguages = (): LanguageOption[] => {
  return [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  ];
};

export const getAvailableVoices = (languageCode: string): VoiceOption[] => {
  // Default voices that work for all languages
  return [
    { id: 'alloy', name: 'Alloy', gender: 'neutral' },
    { id: 'echo', name: 'Echo', gender: 'male' },
    { id: 'fable', name: 'Fable', gender: 'female' },
    { id: 'onyx', name: 'Onyx', gender: 'male' },
    { id: 'nova', name: 'Nova', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', premium: true },
  ];
};
