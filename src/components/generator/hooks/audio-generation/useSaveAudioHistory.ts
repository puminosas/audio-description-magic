
import { 
  saveAudioToHistory, 
  updateGenerationCount, 
  LanguageOption,
  VoiceOption,
} from '@/utils/audio';
import { GeneratedAudio } from '../useGenerationState';

export const useSaveAudioHistory = () => {
  const saveToHistory = async (
    audioData: GeneratedAudio,
    language: LanguageOption,
    voice: VoiceOption,
    userId: string
  ) => {
    await Promise.all([
      saveAudioToHistory(
        audioData.audioUrl,
        audioData.text,
        language.name,
        voice.name,
        userId
      ),
      updateGenerationCount(userId)
    ]);
  };

  return {
    saveToHistory
  };
};
