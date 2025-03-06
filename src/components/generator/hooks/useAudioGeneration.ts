
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateAudioDescription, 
  saveAudioToHistory, 
  updateGenerationCount, 
  LanguageOption,
  VoiceOption,
  AudioGenerationResult,
  AudioSuccessResult,
  AudioErrorResult,
} from '@/utils/audio';
import { useGenerationState, GeneratedAudio } from './useGenerationState';
import { useGenerationErrors } from './useGenerationErrors';
import { useAudioValidator } from './useAudioValidator';

export const useAudioGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { loading, setLoading, generatedAudio, setGeneratedAudio, findInCache, isCached } = useGenerationState();
  const { error, setError, handleError } = useGenerationErrors();
  const { validateAudioUrl } = useAudioValidator();

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
      
      // Step 1: First, generate an enhanced product description if the text is short
      let enhancedText = formData.text;
      
      if (formData.text.length < 100 && activeTab === 'generate') {
        console.log("Input is short, generating enhanced description...");
        
        try {
          // Add a timeout for description generation
          const descTimeoutPromise = new Promise<{success: false, error: string}>((_, reject) => 
            setTimeout(() => reject(new Error('Description generation timed out')), 15000)
          );
          
          // Call our Supabase Edge Function to generate a better description
          const descResponse = await supabase.functions.invoke('generate-description', {
            body: {
              product_name: formData.text,
              language: formData.language.code,
              voice_name: formData.voice.name
            }
          });
          
          const descPromise = descResponse;
          
          // Check for error first
          if (descResponse.error) {
            console.error("Error generating description:", descResponse.error);
          } 
          // Then check if we have data and it contains success property
          else if (descResponse.data && descResponse.data.success && descResponse.data.generated_text) {
            enhancedText = descResponse.data.generated_text;
            console.log("Generated enhanced description:", enhancedText.substring(0, 100) + "...");
          }
        } catch (descErr) {
          console.error("Failed to generate description:", descErr);
          // Continue with original text if enhancement fails
        }
      }
      
      // Step 2: Generate the audio with our enhanced text
      console.log(`Generating audio with ${enhancedText !== formData.text ? 'enhanced' : 'original'} text...`);
      
      // Add a timeout to prevent long-running requests
      const timeoutPromise = new Promise<AudioErrorResult>((_, reject) => 
        setTimeout(() => ({ error: 'The request took too long to complete. Try with a shorter text.' }), 60000)
      );
      
      // Race the generation with a timeout
      const result = await Promise.race([
        generateAudioDescription(
          enhancedText,
          formData.language,
          formData.voice
        ),
        timeoutPromise
      ]) as AudioGenerationResult;
      
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
      
      // Create the audio object
      const audioData: GeneratedAudio = {
        audioUrl: result.audioUrl,
        text: result.text || enhancedText,
        folderUrl: null, // Removing folderUrl since we only use Supabase Storage
        id: result.id || crypto.randomUUID(),
        timestamp: Date.now()
      };
      
      // Set generated audio with a small delay to ensure DOM is ready
      setTimeout(() => {
        setGeneratedAudio(audioData);
      }, 100);
      
      if (user?.id) {
        try {
          await Promise.all([
            saveAudioToHistory(
              audioData.audioUrl,
              audioData.text,
              formData.language.name,
              formData.voice.name,
              user.id
            ),
            updateGenerationCount(user.id)
          ]);
          
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
        description: formData.text.length < 100 && enhancedText !== formData.text
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
