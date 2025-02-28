
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import { LanguageOption, VoiceOption, getAvailableLanguages, getAvailableVoices } from '@/utils/audioGenerationService';

interface GeneratorFormProps {
  onGenerate: (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => Promise<void>;
  loading: boolean;
}

const GeneratorForm = ({ onGenerate, loading }: GeneratorFormProps) => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(getAvailableLanguages()[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(getAvailableVoices('en')[0]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
  };

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    await onGenerate({
      text: text.trim(),
      language: selectedLanguage,
      voice: selectedVoice
    });
  };

  const isDisabled = loading || !text.trim();
  const getButtonText = () => {
    if (loading) return "Generating...";
    if (!text.trim()) return "Enter a product name";
    return "Generate Audio";
  };

  return (
    <div>
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
        <Button 
          onClick={handleSubmit} 
          disabled={isDisabled}
          className="gap-1"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Wand2 size={18} />
          )}
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default GeneratorForm;
