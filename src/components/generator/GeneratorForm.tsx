
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, MessageSquare } from 'lucide-react';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import { LanguageOption, VoiceOption, getAvailableLanguages, getAvailableVoices } from '@/utils/audioGenerationService';
import FeedbackDialog from '@/components/feedback/FeedbackDialog';
import { useToast } from '@/hooks/use-toast';

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
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name or description.",
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

      <div className="flex justify-between items-center">
        <FeedbackDialog 
          trigger={
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageSquare size={16} />
              Feedback
            </Button>
          }
        />
        
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
