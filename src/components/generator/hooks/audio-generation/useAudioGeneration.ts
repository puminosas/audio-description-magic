
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  LanguageOption,
  VoiceOption,
} from '@/utils/audio';
import { useGenerationState } from '../useGenerationState';
import { useGenerationErrors } from '../useGenerationErrors';
import { useAudioValidator } from '../useAudioValidator';
import { useAudioGenerationProcess } from './useAudioGenerationProcess';
import { useSaveAudioHistory } from './useSaveAudioHistory';

export const useAudioGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { loading, setLoading, generatedAudio, setGeneratedAudio, findInCache, isCached } = useGenerationState();
  const { error, setError, handleError } = useGenerationErrors();
  const { validateAudioUrl } = useAudioValidator();
  const { generateEnhancedAudio } = useAudioGenerationProcess();
  const { saveToHistory } = useSaveAudioHistory();

  const handleGenerate = async (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }, activeTab: string, onSuccess?: () => Promise<void>) => {
    try {
      // Start with clean state
      setLoading(true);
      setError(null);
      setGeneratedAudio(null);
      
      console.log("Starting audio generation with data:", formData);
      
      if (!user && activeTab !== 'text-to-audio') {
        throw new Error('Please sign in to generate audio descriptions.');
      }
      
      // Check cache first to avoid unnecessary API calls
      const cachedAudio = findInCache(formData.text);
      if (cachedAudio) {
        console.log("Found in cache, using cached audio");
        setGeneratedAudio(cachedAudio);
        
        toast({
          title: 'Using Cached Audio',
          description: 'Using a recently generated version of this audio for better performance.',
        });
        
        setLoading(false);
        return;
      }
      
      // Generate audio with potential text enhancement
      const result = await generateEnhancedAudio(
        formData.text,
        formData.language,
        formData.voice,
        activeTab
      );
      
      if ('error' in result) {
        const errorMessage = result.error;
        
        if (typeof errorMessage === 'string' && (errorMessage.includes('Authentication required') || errorMessage.includes('authentication'))) {
          setError('You need to be signed in to generate audio. Please sign in and try again.');
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to generate audio descriptions.',
            variant: 'destructive',
          });
        } else {
          console.error("Audio generation error:", errorMessage);
          setError(typeof errorMessage === 'string' ? errorMessage : 'Unknown error occurred');
          toast({
            title: 'Generation Failed',
            description: typeof errorMessage === 'string' ? errorMessage : 'Unknown error occurred',
            variant: 'destructive',
          });
        }
        return;
      }
      
      console.log("Successfully generated audio:", result);
      
      if (!validateAudioUrl(result.audioUrl)) {
        console.error("Invalid audio URL format:", {
          urlStart: result.audioUrl?.substring(0, 50) + '...',
          urlLength: result.audioUrl?.length
        });
        
        setError('Generated audio appears to be invalid. Please try again with a shorter text.');
        toast({
          title: 'Generation Error',
          description: 'Failed to generate valid audio. Try with shorter text.',
          variant: 'destructive',
        });
        return;
      }
      
      // Set generated audio with a small delay to ensure DOM is ready
      setTimeout(() => {
        setGeneratedAudio(result);
      }, 100);
      
      if (user?.id) {
        try {
          await saveToHistory(
            result,
            formData.language,
            formData.voice,
            user.id
          );
          
          if (onSuccess) {
            await onSuccess();
          }
        } catch (historyErr) {
          console.error("Error saving to history:", historyErr);
          // Don't show error to user since audio was generated successfully
        }
      }
      
      toast({
        title: 'Success!',
        description: formData.text.length < 100 && result.text !== formData.text
          ? 'Enhanced description generated and converted to audio.'
          : 'Your audio description has been generated successfully.',
      });
      
    } catch (error) {
      console.error('Error generating audio:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generatedAudio,
    error,
    handleGenerate,
    setError,
    isCached
  };
};
