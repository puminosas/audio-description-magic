
import React from 'react';
import LanguageSelector from '@/components/ui/language-selector';
import VoiceSelector from '@/components/ui/VoiceSelector';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface LanguageVoiceSelectorProps {
  selectedLanguage: LanguageOption | null;
  selectedVoice: VoiceOption | null;
  onSelectLanguage: (language: LanguageOption) => void;
  onSelectVoice: (voice: VoiceOption) => void;
  disabled?: boolean;
  error?: string | null;
}

const LanguageVoiceSelector = ({
  selectedLanguage,
  selectedVoice,
  onSelectLanguage,
  onSelectVoice,
  disabled = false,
  error = null
}: LanguageVoiceSelectorProps) => {
  // Create default objects to avoid undefined errors
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

  // Skip fallback/voice-related errors
  const showError = error && !error.includes('fallback') && !error.includes('voice') && !error.includes('Voice');

  return (
    <div className="space-y-6">
      {showError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
          language={selectedLanguage?.code || 'en-US'}
        />
      </div>
    </div>
  );
};

export default LanguageVoiceSelector;
