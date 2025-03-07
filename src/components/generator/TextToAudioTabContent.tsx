
import React from 'react';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import { useAudioInput } from './audio-input/useAudioInput';
import FileUploadSection from './audio-input/FileUploadSection';
import GenerateButton from './audio-input/GenerateButton';

interface TextToAudioTabContentProps {
  onGenerate: (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => Promise<void>;
  loading: boolean;
  user: any;
}

const TextToAudioTabContent = ({ onGenerate, loading, user }: TextToAudioTabContentProps) => {
  const {
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
  } = useAudioInput({ onGenerate, loading, user });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Text to Audio Converter</h2>
        <p className="text-muted-foreground mb-4">Upload a text file or enter text to convert to high-quality audio</p>
        
        <FileUploadSection 
          setText={setText}
          uploadedFileName={uploadedFileName}
          setUploadedFileName={setUploadedFileName}
        />
      </div>

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
          hasUser={!!user}
          hasText={!!text.trim()}
          buttonText="Convert to Audio"
        />
      </div>
    </div>
  );
};

export default TextToAudioTabContent;
