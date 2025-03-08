import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGenerationState } from './useGenerationState';
import { useGenerationErrors } from './useGenerationErrors';
import { useAudioValidator } from './useAudioValidator';
import { useAudioServices } from './services/useAudioServices';

export const useAudioGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { loading, setLoading, generatedAudio, setGeneratedAudio, findInCache, isCached } = useGenerationState();
  const { error, setError, handleError } = useGenerationErrors();
  const { validateAudioUrl } = useAudioValidator();
  const { generateEnhancedDescription, generateAudioFromText, saveToUserHistory } = useAudioServices();

  const handleGenerate = async (formData: {
    text: string;
    language: any;
    voice: any;
  }, activeTab: string, onSuccess?: () => Promise<void>) => {
    try {
      // Start with clean state
      setLoading(true);
      setError(null);
      
      console.log("Starting audio generation with data:", formData);
      
      if (!user && activeTab !== 'text-to-audio') {
        throw new Error('Please sign in to generate audio descriptions.');
      }
      
      // Check cache first to avoid unnecessary API calls
      const cachedAudio = findInCache(formData.text);
      if (cachedAudio) {
        console.log("Found in cache, using cached audio");
        setGeneratedAudio(cachedAudio);
        setLoading(false);
        return;
      }
      
      // Step 1: First, generate an enhanced product description if the text is short
      let enhancedText = formData.text;
      
      if (formData.text.length < 100 && activeTab === 'generate') {
        console.log("Input is short, generating enhanced description...");
        try {
          const generatedText = await generateEnhancedDescription(formData.text, formData.language.code, formData.voice.name);
          if (generatedText) {
            enhancedText = generatedText;
            console.log("Generated enhanced description:", enhancedText.substring(0, 100) + "...");
          }
        } catch (descErr) {
          console.error("Failed to generate description:", descErr);
          // Continue with original text if enhancement fails
        }
      }
      
      // Step 2: Generate the audio with our enhanced text
      console.log(`Generating audio with ${enhancedText !== formData.text ? 'enhanced' : 'original'} text...`);
      
      const result = await generateAudioFromText(enhancedText, formData.language, formData.voice);
      
      if ('error' in result && !result.success) {
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
      const audioData = {
        audioUrl: result.audioUrl,
        text: result.text || formData.text,
        folderUrl: null,
        id: result.id || crypto.randomUUID(),
        timestamp: Date.now()
      };
      
      // Set generated audio
      setGeneratedAudio(audioData);
      
      if (user?.id) {
        try {
          await saveToUserHistory(
            audioData.audioUrl,
            audioData.text,
            formData.language.name,
            formData.voice.name,
            user.id,
            onSuccess
          );
        } catch (historyErr) {
          console.error("Error saving to history:", historyErr);
          // Don't show error to user since audio was generated successfully
        }
      }
      
      toast({
        title: 'Success!',
        description: 'Your audio description has been generated successfully.',
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
