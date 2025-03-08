
import { saveAudioToHistory, updateGenerationCount } from '@/utils/audio/historyService';

export const useHistoryService = () => {
  // Save audio to user history and update generation count
  const saveToUserHistory = async (
    audioUrl: string,
    text: string,
    languageName: string,
    voiceName: string,
    userId: string,
    onSuccess?: () => Promise<void>
  ): Promise<void> => {
    try {
      await Promise.all([
        saveAudioToHistory(
          audioUrl,
          text,
          languageName,
          voiceName,
          userId
        ),
        updateGenerationCount(userId)
      ]);
      
      if (onSuccess) {
        await onSuccess();
      }
    } catch (historyErr) {
      console.error("Error saving to history:", historyErr);
      throw historyErr;
    }
  };

  return {
    saveToUserHistory
  };
};
