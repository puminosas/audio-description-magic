import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AudioOutput from '@/components/generator/AudioOutput';
import GeneratorHeader from '@/components/generator/GeneratorHeader';
import ErrorAlert from '@/components/generator/ErrorAlert';
import GeneratorTabs from '@/components/generator/GeneratorTabs';
import GeneratorSidebar from '@/components/generator/GeneratorSidebar';
import { 
  generateAudioDescription, 
  saveAudioToHistory, 
  updateGenerationCount,
  getUserGenerationStats,
  LanguageOption,
  VoiceOption
} from '@/utils/audio';

const Generator = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{
    audioUrl: string;
    text: string;
  } | null>(null);
  const [generationStats, setGenerationStats] = useState({ 
    total: 0, 
    today: 0,
    remaining: profile?.remaining_generations || 10
  });
  const [error, setError] = useState<string | null>(null);

  const fetchGenerationStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const stats = await getUserGenerationStats(user.id);
      setGenerationStats({
        total: stats.total || 0,
        today: stats.today || 0,
        remaining: profile?.remaining_generations || 10
      });
    } catch (error) {
      console.error("Error fetching generation stats:", error);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user?.id) {
      fetchGenerationStats();
    }
  }, [user, fetchGenerationStats]);

  const handleGenerate = async (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Generating audio with data:", formData);
      
      if (!user && activeTab !== 'text-to-audio') {
        throw new Error('Please sign in to generate audio descriptions.');
      }
      
      const result = await generateAudioDescription(
        formData.text,
        formData.language,
        formData.voice
      );
      
      if (result.error || !result.audioUrl) {
        const errorMessage = result.error || 'Failed to generate audio. Please try again.';
        
        if (errorMessage.includes('Authentication required') || errorMessage.includes('authentication')) {
          setError('You need to be signed in to generate audio. Please sign in and try again.');
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to generate audio descriptions.',
            variant: 'destructive',
          });
        } else {
          console.error("Audio generation error:", errorMessage);
          setError(errorMessage);
          toast({
            title: 'Generation Failed',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        return;
      }
      
      console.log("Audio generation successful:", result);
      
      setGeneratedAudio({
        audioUrl: result.audioUrl,
        text: result.text
      });
      
      if (result.audioUrl && user?.id) {
        Promise.all([
          saveAudioToHistory(
            result.audioUrl,
            result.text,
            formData.language.name,
            formData.voice.name,
            user.id
          ),
          updateGenerationCount(user.id)
        ])
        .then(() => fetchGenerationStats())
        .catch(err => console.error("Background tasks error:", err));
      }
      
      toast({
        title: 'Success!',
        description: 'Your audio description has been generated.',
      });
      
    } catch (error) {
      console.error('Error generating audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <GeneratorHeader />
      <ErrorAlert error={error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GeneratorTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleGenerate={handleGenerate}
            loading={loading}
            user={user}
            onRefreshStats={async () => {
              await fetchGenerationStats();
            }}
          />
          
          {generatedAudio && (
            <div className="mt-6">
              <AudioOutput 
                audioUrl={generatedAudio.audioUrl} 
                generatedText={generatedAudio.text} 
                isGenerating={loading}
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

export default Generator;
