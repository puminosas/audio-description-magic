
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import TextToAudioHeader from './text-to-audio/TextToAudioHeader';
import FileUploader from './text-to-audio/FileUploader';
import GenerateButton from './text-to-audio/GenerateButton';
import { getAvailableLanguages, getAvailableVoices } from '@/utils/audio';

interface TextToAudioTabProps {
  onGenerate: (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => Promise<void>;
  loading: boolean;
  user: any;
}

const TextToAudioTab = ({ onGenerate, loading, user }: TextToAudioTabProps) => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(getAvailableLanguages()[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(getAvailableVoices('en')[0]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    // Update voices based on the language
    setSelectedVoice(getAvailableVoices(language.code)[0]);
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

  return (
    <div>
      <TextToAudioHeader />
      
      <FileUploader 
        setText={setText}
        uploadedFileName={uploadedFileName}
        setUploadedFileName={setUploadedFileName}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DescriptionInput 
          value={text} 
          onChange={handleTextChange} 
        />
        
        <LanguageVoiceSelector 
          selectedLanguage={selectedLanguage}
          selectedVoice={selectedVoice}
          onSelectLanguage={handleSelectLanguage}
          onSelectVoice={handleSelectVoice}
        />
      </div>

      <div className="flex justify-end">
        <GenerateButton 
          onClick={handleSubmit}
          isDisabled={isDisabled}
          isLoading={loading}
          user={user}
          text={text}
        />
      </div>
    </div>
  );
};

export default TextToAudioTab;
