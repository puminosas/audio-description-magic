
import React from 'react';
import LanguageSelector from '@/components/ui/LanguageSelector';
import VoiceSelector from '@/components/ui/VoiceSelector';
import { LanguageOption, VoiceOption } from '@/utils/audioGenerationService';

interface LanguageVoiceSelectorProps {
  selectedLanguage: LanguageOption;
  selectedVoice: VoiceOption;
  onSelectLanguage: (language: LanguageOption) => void;
  onSelectVoice: (voice: VoiceOption) => void;
}

const LanguageVoiceSelector = ({
  selectedLanguage,
  selectedVoice,
  onSelectLanguage,
  onSelectVoice
}: LanguageVoiceSelectorProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Language
        </label>
        <LanguageSelector 
          onSelect={onSelectLanguage} 
          selectedLanguage={selectedLanguage}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Voice
        </label>
        <VoiceSelector 
          onSelect={onSelectVoice} 
          selectedVoice={selectedVoice}
          language={selectedLanguage.code}
        />
      </div>
    </div>
  );
};

export default LanguageVoiceSelector;
