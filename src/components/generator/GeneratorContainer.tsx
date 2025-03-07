
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AudioOutput from '@/components/generator/AudioOutput';
import GeneratorHeader from '@/components/generator/GeneratorHeader';
import ErrorAlert from '@/components/generator/ErrorAlert';
import GeneratorTabs from '@/components/generator/GeneratorTabs';
import GeneratorSidebar from '@/components/generator/GeneratorSidebar';
import { useGenerationStats } from './hooks/useGenerationStats';
import { useGenerationLogic } from './hooks/useGenerationLogic';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import { useToast } from '@/hooks/use-toast';

const GeneratorContainer = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');
  const { generationStats, fetchGenerationStats } = useGenerationStats();
  const { loading, generatedAudio, error, handleGenerate, setError, isCached, googleTtsAvailable } = useGenerationLogic();
  const [googleTtsError, setGoogleTtsError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if Google TTS is available and set appropriate error message
  useEffect(() => {
    if (!googleTtsAvailable) {
      setGoogleTtsError('Using fallback voices. Some advanced features may be limited.');
    } else {
      setGoogleTtsError(null);
    }
  }, [googleTtsAvailable]);

  const handleGenerateAudio = async (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => {
    try {
      if (!formData.text || formData.text.trim() === '') {
        setError('Please enter text to generate audio');
        return;
      }
      
      if (!formData.language) {
        setError('Please select a language');
        return;
      }
      
      if (!formData.voice) {
        setError('Please select a voice');
        return;
      }
      
      await handleGenerate(formData, activeTab, fetchGenerationStats);
    } catch (err) {
      console.error("Error during generation:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <GeneratorHeader />
      {error && <ErrorAlert error={error} />}
      {googleTtsError && !error && <ErrorAlert error={googleTtsError} isGoogleTtsError={true} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GeneratorTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleGenerate={handleGenerateAudio}
            loading={loading}
            user={user}
            onRefreshStats={fetchGenerationStats}
          />
          
          {(generatedAudio || loading) && (
            <div className="mt-6">
              <AudioOutput 
                audioUrl={generatedAudio?.audioUrl || null} 
                generatedText={generatedAudio?.text || null} 
                isGenerating={loading}
                error={error}
                isCached={isCached}
              />
            </div>
          )}
        </div>
        
        <GeneratorSidebar 
          user={user} 
          profile={profile} 
          generationStats={generationStats} 
        />
      </div>
    </div>
  );
};

export default GeneratorContainer;
