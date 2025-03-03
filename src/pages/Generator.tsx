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

  const validateAudioUrl = (url: string): boolean => {
    if (!url) return false;
    
    if (url.startsWith('data:audio/')) {
      if (!url.includes('base64,')) return false;
      
      const base64Part = url.split('base64,')[1];
      
      return base64Part && base64Part.length > 100 && url.length > 1000;
    }
    
    if (url.startsWith('http')) {
      return url.length > 10;
    }
    
    return false;
  };

  const handleGenerate = async (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setGeneratedAudio(null);
      
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
      
      console.log("Successfully generated audio:", result);
      
      if (!validateAudioUrl(result.audioUrl)) {
        console.error("Invalid audio URL format:", {
          urlStart: result.audioUrl?.substring(0, 50) + '...',
          urlLength: result.audioUrl?.length,
          hasBase64: result.audioUrl?.includes('base64,'),
          dataType: result.audioUrl?.includes('data:audio/') ? 'audio' : 'unknown'
        });
        
        setError('Generated audio appears to be invalid. Please try again.');
        toast({
          title: 'Generation Error',
          description: 'Failed to generate valid audio. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log("Audio generation successful:", {
        url: result.audioUrl.substring(0, 50) + '...',
        text: result.text
      });
      
      setTimeout(() => {
        setGeneratedAudio({
          audioUrl: result.audioUrl,
          text: result.text || formData.text
        });
      }, 100);
      
      if (result.audioUrl && user?.id) {
        try {
          await Promise.all([
            saveAudioToHistory(
              result.audioUrl,
              result.text || formData.text,
              formData.language.name,
              formData.voice.name,
              user.id
            ),
            updateGenerationCount(user.id)
          ]);
          await fetchGenerationStats();
        } catch (err) {
          console.error("Error saving to history:", err);
        }
      }
      
      toast({
        title: 'Success!',
        description: 'Your audio description has been generated.',
      });
      
    } catch (error) {
      console.error('Error generating audio:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate audio';
        
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
          
          {(generatedAudio || loading) && (
            <div className="mt-6">
              <AudioOutput 
                audioUrl={generatedAudio?.audioUrl || null} 
                generatedText={generatedAudio?.text || null} 
                isGenerating={loading}
                error={error}
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
