
import React from 'react';
import { AudioDownloadState } from '../types';

interface AudioDownloadProviderProps {
  children: (state: AudioDownloadState) => React.ReactElement;
  audioUrl?: string;
  fileName?: string;
}

export const AudioDownloadProvider = ({ 
  children,
  audioUrl,
  fileName = 'audio.mp3'
}: AudioDownloadProviderProps) => {
  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const downloadState: AudioDownloadState = {
    handleDownload,
  };
  
  return children(downloadState);
};

export default AudioDownloadProvider;
