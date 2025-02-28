
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Code, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AudioPlayerProps {
  audioUrl?: string;
  fileName?: string;
  isGenerating?: boolean;
}

const AudioPlayer = ({ audioUrl, fileName = 'audio-description.mp3', isGenerating = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulated audio URL if not provided
  const effectiveAudioUrl = audioUrl || 'https://example.com/audio.mp3';

  useEffect(() => {
    // Generate embed code
    setEmbedCode(`<iframe 
  src="${window.location.origin}/embed?audio=${encodeURIComponent(effectiveAudioUrl)}" 
  width="300" 
  height="80" 
  frameborder="0" 
  allow="autoplay"
></iframe>`);
  }, [effectiveAudioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleLoadMetadata = () => {
        setDuration(audio.duration);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadMetadata);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioRef.current]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    // Could add a toast notification here
  };

  return (
    <div className="glassmorphism rounded-xl p-4 sm:p-6 w-full max-w-3xl mx-auto shadow-lg">
      {/* Hidden audio element */}
      {!isGenerating && (
        <audio ref={audioRef} src={effectiveAudioUrl} preload="metadata" />
      )}
      
      <div className="flex flex-col space-y-4">
        {/* Waveform visualization */}
        <div className="h-20 w-full bg-secondary/50 rounded-lg flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center">
              <div className="sound-wave inline-flex mx-auto">
                <div className="bar animate-pulse-sound-1"></div>
                <div className="bar animate-pulse-sound-2"></div>
                <div className="bar animate-pulse-sound-3"></div>
                <div className="bar animate-pulse-sound-4"></div>
                <div className="bar animate-pulse-sound-2"></div>
                <div className="bar animate-pulse-sound-3"></div>
                <div className="bar animate-pulse-sound-1"></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Generating audio...</p>
            </div>
          ) : (
            <div className={`w-full h-12 flex items-center ${isPlaying ? 'opacity-100' : 'opacity-60'}`}>
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 mx-0.5 rounded-full bg-primary transition-all duration-150"
                  style={{
                    height: isPlaying 
                      ? `${Math.max(15, Math.abs(Math.sin(i * 0.45) * 40))}px` 
                      : `${Math.max(5, Math.abs(Math.sin(i * 0.45) * 20))}px`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center justify-between sm:w-auto sm:justify-start sm:space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={togglePlayPause}
              disabled={isGenerating}
              className="h-10 w-10 rounded-full"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            <div className="text-sm font-medium">
              {isGenerating ? (
                <span className="text-muted-foreground">--:--</span>
              ) : (
                <span>{formatTime(currentTime)} <span className="text-muted-foreground">/ {formatTime(duration)}</span></span>
              )}
            </div>
          </div>
          
          <div className="flex-grow mx-0 sm:mx-4">
            <Slider 
              value={[currentTime]} 
              min={0} 
              max={duration || 100} 
              step={0.1} 
              onValueChange={handleTimeChange}
              disabled={isGenerating}
              className="cursor-pointer"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={isGenerating}
            >
              {isMuted ? (
                <VolumeX size={18} />
              ) : volume > 0.5 ? (
                <Volume2 size={18} />
              ) : (
                <Volume1 size={18} />
              )}
            </button>
            
            <div className="w-20 hidden sm:block">
              <Slider 
                value={[isMuted ? 0 : volume]} 
                min={0} 
                max={1} 
                step={0.01} 
                onValueChange={handleVolumeChange}
                disabled={isGenerating}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                disabled={isGenerating}
                asChild
              >
                <a href={effectiveAudioUrl} download={fileName}>
                  <Download size={18} />
                </a>
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={isGenerating}
                  >
                    <Code size={18} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h3 className="font-medium">Embed Code</h3>
                    <div className="bg-secondary p-2 rounded-md text-xs overflow-x-auto">
                      <code>{embedCode}</code>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={copyEmbedCode}
                    >
                      Copy Code
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
