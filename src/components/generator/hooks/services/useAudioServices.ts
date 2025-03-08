
import { useDescriptionService } from './useDescriptionService';
import { useAudioGenerationService } from './useAudioGenerationService';
import { useHistoryService } from './useHistoryService';

export const useAudioServices = () => {
  const { generateEnhancedDescription } = useDescriptionService();
  const { generateAudioFromText } = useAudioGenerationService();
  const { saveToUserHistory } = useHistoryService();

  return {
    generateEnhancedDescription,
    generateAudioFromText,
    saveToUserHistory
  };
};
