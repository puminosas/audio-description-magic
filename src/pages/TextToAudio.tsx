
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAudioInput } from '@/components/generator/audio-input/useAudioInput';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import DescriptionInput from '@/components/generator/DescriptionInput';
import LanguageVoiceSelector from '@/components/generator/LanguageVoiceSelector';
import FileUploadSection from '@/components/generator/audio-input/FileUploadSection';
import GenerateButton from '@/components/generator/audio-input/GenerateButton';
import AudioOutput from '@/components/generator/AudioOutput';
import { Loader2 } from 'lucide-react';

const TextToAudioPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{
    audioUrl?: string;
    text?: string;
    fileName?: string;
  } | null>(null);

  const handleGenerate = async (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll use a placeholder audio URL
      setGeneratedAudio({
        audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        text: formData.text,
        fileName: 'text-to-audio.mp3'
      });
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const {
    text,
    setText,
    uploadedFileName,
    setUploadedFileName,
    selectedLanguage,
    selectedVoice,
    handleTextChange,
    handleSelectLanguage,
    handleSelectVoice,
    handleSubmit,
    isDisabled
  } = useAudioInput({ onGenerate: handleGenerate, loading, user });

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 pt-24 overflow-x-hidden">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Text to Audio Converter</h1>
          <p className="text-muted-foreground mt-2">
            Convert any text into high-quality audio with our text-to-speech tool
          </p>
        </div>

        <div className="bg-card border rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <FileUploadSection 
              setText={setText}
              uploadedFileName={uploadedFileName}
              setUploadedFileName={setUploadedFileName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <DescriptionInput 
              value={text} 
              onChange={handleTextChange} 
            />
            
            <LanguageVoiceSelector 
              selectedLanguage={selectedLanguage}
              selectedVoice={selectedVoice}
              onSelectLanguage={handleSelectLanguage}
              onSelectVoice={handleSelectVoice}
            />
          </div>

          <div className="flex justify-end">
            <GenerateButton 
              onClick={handleSubmit}
              isDisabled={isDisabled}
              isLoading={loading}
              hasUser={!!user}
              hasText={!!text.trim()}
              buttonText="Convert to Audio"
            />
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-center text-muted-foreground">
              Converting your text to audio...
            </p>
          </div>
        )}

        {generatedAudio && generatedAudio.audioUrl && (
          <AudioOutput
            audioUrl={generatedAudio.audioUrl}
            generatedText={generatedAudio.text || ''}
            isGenerating={false}
            error={null}
            fileName={generatedAudio.fileName || 'text-to-audio.mp3'}
          />
        )}
      </div>
    </div>
  );
};

export default TextToAudioPage;
