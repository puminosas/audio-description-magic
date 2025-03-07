
import { useState } from 'react';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';
import { useToast } from '@/hooks/use-toast';
import { getLanguageOptions, getVoiceOptions } from './fallbackOptions';
import { getAvailableLanguages, getAvailableVoices } from '@/utils/audio';

interface UseAudioInputProps {
  onGenerate: (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => Promise<void>;
  loading: boolean;
  user: any;
}

export const useAudioInput = ({ onGenerate, loading, user }: UseAudioInputProps) => {
  const [text, setText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const languages = getLanguageOptions(getAvailableLanguages);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(languages[0]);
  
  const voices = getVoiceOptions(getAvailableVoices, selectedLanguage.code);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(voices[0]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    // Update voices based on the language
    const newVoices = getVoiceOptions(getAvailableVoices, language.code);
    setSelectedVoice(newVoices[0]);
  };

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate audio.",
        variant: "destructive"
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter text or upload a file.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onGenerate({
        text: text.trim(),
        language: selectedLanguage,
        voice: selectedVoice
      });
    } catch (error) {
      console.error("Error in generation:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Something went wrong during generation.",
        variant: "destructive"
      });
    }
  };

  const isDisabled = loading || !text.trim() || !user;

  return {
    text,
    setText,
    uploadedFileName,
    setUploadedFileName,
    selectedLanguage,
    selectedVoice,
    handleTextChange,
    handleSelectLanguage,
    handleSelectVoice,
    handleSubmit,
    isDisabled
  };
};
