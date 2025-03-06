
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AudioOutput from '@/components/generator/AudioOutput';
import GeneratorHeader from '@/components/generator/GeneratorHeader';
import ErrorAlert from '@/components/generator/ErrorAlert';
import GeneratorTabs from '@/components/generator/GeneratorTabs';
import GeneratorSidebar from '@/components/generator/GeneratorSidebar';
import { useGenerationStats } from './hooks/useGenerationStats';
import { useGenerationLogic } from './hooks/useGenerationLogic';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import ApiErrorBoundary from '@/components/error/ApiErrorBoundary';

const GeneratorContainer = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');
  const { generationStats, fetchGenerationStats } = useGenerationStats();
  const { loading, generatedAudio, error, handleGenerate, setError, isCached } = useGenerationLogic();
  const { handleError } = useApiErrorHandler();

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
      handleError(err);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <GeneratorHeader />
      <ErrorAlert error={error} />

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
        
        <ApiErrorBoundary errorMessage="Failed to load sidebar information">
          <GeneratorSidebar 
            user={user} 
            profile={profile} 
            generationStats={generationStats} 
          />
        </ApiErrorBoundary>
      </div>
    </div>
  );
};

export default GeneratorContainer;
