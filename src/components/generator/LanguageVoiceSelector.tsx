
import React from 'react';
import LanguageSelector from '@/components/ui/LanguageSelector';
import VoiceSelector from '@/components/ui/VoiceSelector';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';

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
  // Make sure we have valid default objects to prevent "undefined" errors
  const defaultLanguage: LanguageOption = selectedLanguage || {
    id: 'en-US',
    code: 'en-US',
    name: 'English (US)'
  };
  
  const defaultVoice: VoiceOption = selectedVoice || {
    id: 'en-US-Wavenet-A',
    name: 'Default Voice',
    gender: 'MALE'
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Language
        </label>
        <LanguageSelector 
          onSelect={onSelectLanguage} 
          selectedLanguage={defaultLanguage}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Voice
        </label>
        <VoiceSelector 
          onSelect={onSelectVoice} 
          selectedVoice={defaultVoice}
          language={defaultLanguage.code}
        />
      </div>
    </div>
  );
};

export default LanguageVoiceSelector;
