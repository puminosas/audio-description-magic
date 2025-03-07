
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import GeneratorHeader from './GeneratorHeader';
import GeneratorTabs from './GeneratorTabs';
import GeneratorSidebar from './GeneratorSidebar';
import ErrorAlert from './ErrorAlert';
import { useGenerationLogic } from './hooks/useGenerationLogic';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import { useGenerationStats } from './hooks/useGenerationStats';

const GeneratorContainer = () => {
  const { user, loading: authLoading, profile } = useAuth();
  const { error, googleTtsAvailable, suppressErrors, handleGenerate, loading, isCached, generatedAudio } = useGenerationLogic();
  const [activeTab, setActiveTab] = useState('generate');
  const { stats, refreshStats } = useGenerationStats(user);

  // Don't redirect authenticated users
  if (!authLoading && !user) {
    return <Navigate to="/auth" />;
  }

  // Check if error is a Google TTS error
  const isGoogleTtsError = error && (
    error.includes("Google TTS") || 
    error.includes("Failed to load languages") ||
    error.includes("Failed to initialize Google voices")
  );

  // Suppress all Google TTS related errors
  const shouldSuppressErrors = suppressErrors || isGoogleTtsError;

  // Create a Promise-returning wrapper for handleGenerate
  const handleGeneratePromise = async (formData: { text: string; language: LanguageOption; voice: VoiceOption }) => {
    return handleGenerate(formData, activeTab, refreshStats);
  };

  return (
    <div className="container mx-auto p-4">
      <GeneratorHeader />
      
      {/* Only show error if it's not Google TTS related and not suppressed */}
      {error && !shouldSuppressErrors && (
        <ErrorAlert 
          error={error} 
          isGoogleTtsError={isGoogleTtsError}
          hideWhenGoogleTtsWorking={googleTtsAvailable}
        />
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <GeneratorTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleGenerate={handleGeneratePromise}
            loading={loading}
            user={user}
            onRefreshStats={refreshStats}
            generatedAudio={generatedAudio}
          />
        </div>
        <div className="lg:col-span-1">
          <GeneratorSidebar 
            user={user}
            profile={profile}
            generationStats={stats || { total: 0, today: 0, remaining: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneratorContainer;
