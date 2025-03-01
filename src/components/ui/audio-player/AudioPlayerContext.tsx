
import React, { createContext } from 'react';
import { AudioPlayerContextProps } from './types';

const AudioPlayerContext = createContext<AudioPlayerContextProps | undefined>(undefined);

export default AudioPlayerContext;

// Re-export the context, provider, and hook
export { AudioPlayerProvider } from './AudioPlayerProvider';
export { useAudioPlayer } from './useAudioPlayer';
