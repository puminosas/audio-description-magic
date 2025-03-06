
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { Loader2, Wand2 } from 'lucide-react';
import LanguageVoiceSelector from '@/components/generator/LanguageVoiceSelector';
import { getAvailableLanguages, getAvailableVoices, LanguageOption, VoiceOption } from '@/utils/audio';

const AudioDemo = () => {
  const [productName, setProductName] = useState('Wireless Noise-Cancelling Headphones');
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(getAvailableLanguages()[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(getAvailableVoices('en-US')[0]);

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    
    setGenerating(true);
    setAudioUrl(null);
    setGeneratedText(null);
    
    try {
      // Simulate API call (in a real app, this would call your backend)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample product description
      const description = `These premium wireless headphones feature advanced noise-cancellation technology, providing an immersive audio experience wherever you go. With 30 hours of battery life, comfortable over-ear design, and crystal-clear sound quality, they're perfect for both casual listening and professional use. The built-in microphone ensures clear calls, while Bluetooth 5.0 technology offers stable connection to all your devices. Available in multiple colors, these headphones combine style, comfort, and exceptional audio performance.`;
      
      // Set the generated description and sample audio URL
      setGeneratedText(description);
      setAudioUrl('/sample-audio.mp3');
      
      // In a real implementation, you would use the actual audio URL from your backend
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    setSelectedVoice(getAvailableVoices(language.code)[0]);
  };

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-6 rounded-lg border border-muted">
        <h2 className="text-xl font-semibold mb-4">E-commerce Product Demo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Product Name
            </label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter a product name"
              className="w-full"
            />
          </div>
          
          <div className="md:col-span-1">
            <LanguageVoiceSelector
              selectedLanguage={selectedLanguage}
              selectedVoice={selectedVoice}
              onSelectLanguage={handleSelectLanguage}
              onSelectVoice={handleSelectVoice}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleGenerate} 
          disabled={generating || !productName.trim()}
          className="w-full sm:w-auto"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Audio...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Product Audio
            </>
          )}
        </Button>
      </div>

      {(audioUrl || generating) && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium">Generated Audio Player</h3>
            <AudioPlayer 
              audioUrl={audioUrl || undefined}
              isGenerating={generating}
              fileName="product-description.mp3"
            />
            
            {generatedText && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Generated Product Description:</h4>
                <div className="bg-muted/40 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {generatedText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioDemo;
