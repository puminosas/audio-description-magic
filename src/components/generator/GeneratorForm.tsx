
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import PlanStatus from './PlanStatus';
import { LanguageOption, VoiceOption } from '@/utils/audioGenerationService';
import { User } from '@supabase/supabase-js';

interface GeneratorFormProps {
  text: string;
  selectedLanguage: LanguageOption;
  selectedVoice: VoiceOption;
  isGenerating: boolean;
  remainingGenerations: number;
  user: User | null;
  profile: any | null;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSelectLanguage: (language: LanguageOption) => void;
  onSelectVoice: (voice: VoiceOption) => void;
  onGenerate: () => void;
}

const GeneratorForm = ({
  text,
  selectedLanguage,
  selectedVoice,
  isGenerating,
  remainingGenerations,
  user,
  profile,
  onTextChange,
  onSelectLanguage,
  onSelectVoice,
  onGenerate
}: GeneratorFormProps) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DescriptionInput 
          value={text} 
          onChange={onTextChange} 
        />
        
        <LanguageVoiceSelector 
          selectedLanguage={selectedLanguage}
          selectedVoice={selectedVoice}
          onSelectLanguage={onSelectLanguage}
          onSelectVoice={onSelectVoice}
        />
      </div>

      <div className="flex justify-between items-center">
        <PlanStatus 
          user={user}
          profile={profile}
          remainingGenerations={remainingGenerations}
        />
        
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating || !text.trim() || (!user && remainingGenerations <= 0)}
          className="gap-1"
        >
          <Wand2 size={18} />
          {isGenerating ? 'Generating...' : 'Generate Audio'}
        </Button>
      </div>
    </div>
  );
};

export default GeneratorForm;
