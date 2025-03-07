
import React, { useState } from 'react';
import { useGenerationLogic } from '@/components/generator/hooks/useGenerationLogic';
import ProductDetailsForm from './audio-description/ProductDetailsForm';
import AudioPreview from './audio-description/AudioPreview';
import EmbedOptions from './audio-description/EmbedOptions';
import ImplementationGuide from './audio-description/ImplementationGuide';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';

const AudioDescriptionDemo = () => {
  const [productName, setProductName] = useState('Ergonomic Office Chair');
  const [productDescription, setProductDescription] = useState('Premium ergonomic office chair with adjustable height, lumbar support, and breathable mesh back. Perfect for long work hours and maintaining proper posture.');
  const [language, setLanguage] = useState<LanguageOption | null>(null);
  const [voice, setVoice] = useState<VoiceOption | null>(null);
  
  const { 
    loading, 
    generatedAudio, 
    handleGenerate, 
    googleTtsAvailable 
  } = useGenerationLogic();

  const handleGenerateAudio = () => {
    if (!language || !voice) return;
    
    // Combine product name and description
    const fullText = `${productName}. ${productDescription}`;
    
    handleGenerate({
      text: fullText,
      language,
      voice
    }, 'e-commerce');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">E-commerce Audio Description Demo</h1>
      <p className="mb-8">This demo shows how to integrate AI-generated audio descriptions into e-commerce product pages.</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <ProductDetailsForm 
          productName={productName}
          setProductName={setProductName}
          productDescription={productDescription}
          setProductDescription={setProductDescription}
          language={language}
          setLanguage={setLanguage}
          voice={voice}
          setVoice={setVoice}
          handleGenerateAudio={handleGenerateAudio}
          loading={loading}
          googleTtsAvailable={googleTtsAvailable}
        />

        <div className="space-y-6">
          <AudioPreview generatedAudio={generatedAudio} />

          {generatedAudio?.audioUrl && (
            <EmbedOptions audioUrl={generatedAudio.audioUrl} />
          )}
        </div>
      </div>

      <ImplementationGuide />
    </div>
  );
};

export default AudioDescriptionDemo;
