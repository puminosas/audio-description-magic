
import { useState } from 'react';

export interface GeneratedAudio {
  audioUrl: string;
  text: string;
  folderUrl: null; // Keeping for backward compatibility but setting to null
}

export const useGenerationState = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);

  return {
    loading,
    setLoading,
    generatedAudio,
    setGeneratedAudio
  };
};
