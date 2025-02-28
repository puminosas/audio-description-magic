
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  LanguageOption, 
  VoiceOption, 
  generateAudio,
  saveAudioToHistory
} from '@/utils/audioGenerationService';
import GeneratorForm from '@/components/generator/GeneratorForm';
import AudioOutput from '@/components/generator/AudioOutput';
import HistoryTab from '@/components/generator/HistoryTab';
import TipsCard from '@/components/generator/TipsCard';

const Generator = () => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({ 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    flag: '🇺🇸'
  });
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>({ 
    id: 'en-US-1', 
    name: 'Matthew', 
    gender: 'male' 
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(3); // For free tier
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product description.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setAudioData(null);
    setAudioUrl(null);
    setGeneratedText(null);
    
    try {
      // Generate the audio
      const result = await generateAudio({
        text: text.trim(),
        language: selectedLanguage,
        voice: selectedVoice
      });
      
      // Set the audio URL, data and generated text
      setAudioData(result.audioData);
      setAudioUrl(result.audioUrl);
      setGeneratedText(result.generatedText);
      
      // Only decrement remaining generations if user isn't logged in or is on free tier
      if (!user || (profile?.plan === 'free')) {
        setRemainingGenerations(prev => Math.max(0, prev - 1));
      }
      
      // If user is logged in, save the audio file to their history
      if (user) {
        await saveAudioToHistory({
          audioUrl: result.audioUrl,
          audioData: result.audioData,
          text: text.trim(),
          generatedText: result.generatedText,
          language: selectedLanguage,
          voice: selectedVoice,
          user
        });
      }
      
      toast({
        title: "Success",
        description: "Audio generated successfully!",
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate audio.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    // Reset voice when language changes to match the language
    const languagePrefix = language.code;
    const defaultVoice: VoiceOption = { 
      id: `${languagePrefix}-${languagePrefix === 'en' ? 'US-1' : 'ES-1'}`, 
      name: languagePrefix === 'en' ? 'Matthew' : 'Default', 
      gender: 'male' 
    };
    setSelectedVoice(defaultVoice);
  };

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Audio Description Generator</h1>
          <p className="text-lg text-muted-foreground">
            Transform your product descriptions into engaging audio content.
          </p>
        </div>

        <Tabs defaultValue="generator" className="glassmorphism rounded-xl overflow-hidden shadow-lg">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="history">Your Audios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="p-0">
            <GeneratorForm 
              text={text}
              selectedLanguage={selectedLanguage}
              selectedVoice={selectedVoice}
              isGenerating={isGenerating}
              remainingGenerations={remainingGenerations}
              user={user}
              profile={profile}
              onTextChange={handleTextChange}
              onSelectLanguage={handleSelectLanguage}
              onSelectVoice={handleSelectVoice}
              onGenerate={handleGenerate}
            />
            
            <AudioOutput 
              isGenerating={isGenerating}
              audioUrl={audioUrl}
              generatedText={generatedText}
            />
          </TabsContent>
          
          <TabsContent value="history" className="p-6">
            <HistoryTab user={user} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 space-y-6">
          <TipsCard />
        </div>
      </div>
    </div>
  );
};

export default Generator;
