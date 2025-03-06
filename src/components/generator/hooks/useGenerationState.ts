
import { useState } from 'react';

export interface GeneratedAudio {
  audioUrl: string;
  text: string;
  folderUrl?: string | null;
}

export const useGenerationState = () => {
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);

  return {
    loading,
    setLoading,
    generatedAudio,
    setGeneratedAudio
  };
};
