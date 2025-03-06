
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, MessageSquare, AlertTriangle } from 'lucide-react';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import { LanguageOption, VoiceOption, getAvailableLanguages, getAvailableVoices } from '@/utils/audio';
import FeedbackDialog from '@/components/feedback/FeedbackDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeneratorFormProps {
  onGenerate: (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => Promise<void>;
  loading: boolean;
  googleTtsAvailable?: boolean;
}

const GeneratorForm = ({ onGenerate, loading, googleTtsAvailable = true }: GeneratorFormProps) => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Try to initialize languages and voices
  useEffect(() => {
    const initializeLanguageAndVoice = async () => {
      try {
        if (googleTtsAvailable) {
          const languages = getAvailableLanguages();
          if (languages.length > 0) {
            setSelectedLanguage(languages[0]);
            try {
              const voices = getAvailableVoices(languages[0].code);
              if (voices.length > 0) {
                setSelectedVoice(voices[0]);
              }
            } catch (voiceError) {
              console.error('Error getting voices:', voiceError);
              setLanguageError('Failed to load voices: Google TTS service may be unavailable.');
            }
          }
        }
      } catch (langError) {
        console.error('Error getting languages:', langError);
        setLanguageError('Failed to load languages: Google TTS service may be unavailable.');
      }
    };

    initializeLanguageAndVoice();
  }, [googleTtsAvailable]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    // Update voices based on the language
    try {
      const voices = getAvailableVoices(language.code);
      if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      } else {
        setSelectedVoice(null);
        toast({
          title: "No Voices Available",
          description: `No voices found for ${language.name}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
      setSelectedVoice(null);
      toast({
        title: "Voice Selection Error",
        description: error instanceof Error ? error.message : "Failed to get voices for selected language",
        variant: "destructive"
      });
    }
  };

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate audio descriptions.",
        variant: "destructive"
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name or description.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedLanguage || !selectedVoice) {
      toast({
        title: "Error",
        description: "Please select a language and voice.",
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

  const isDisabled = loading || !text.trim() || !user || !googleTtsAvailable || !selectedLanguage || !selectedVoice;
  
  const getButtonText = () => {
    if (!googleTtsAvailable) return "Google TTS Unavailable";
    if (!user) return "Sign in to Generate";
    if (loading) return "Generating...";
    if (!text.trim()) return "Enter a product name";
    if (!selectedLanguage || !selectedVoice) return "Select language and voice";
    return "Generate Audio Description";
  };

  return (
    <div>
      {!googleTtsAvailable && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Google Text-to-Speech service is currently unavailable. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <DescriptionInput 
            value={text} 
            onChange={handleTextChange}
            placeholder="Enter a product name or brief description to generate an engaging audio description"
            disabled={!googleTtsAvailable}
          />
        </div>
        
        <div className="md:col-span-1">
          <LanguageVoiceSelector 
            selectedLanguage={selectedLanguage}
            selectedVoice={selectedVoice}
            onSelectLanguage={handleSelectLanguage}
            onSelectVoice={handleSelectVoice}
            disabled={!googleTtsAvailable}
            error={languageError}
          />
        </div>
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
          size="lg"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : !googleTtsAvailable ? (
            <AlertTriangle size={18} />
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
