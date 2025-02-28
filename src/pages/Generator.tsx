
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';
import AudioPlayer from '@/components/ui/AudioPlayer';
import LanguageSelector from '@/components/ui/LanguageSelector';
import VoiceSelector from '@/components/ui/VoiceSelector';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  sample?: string;
  premium?: boolean;
}

const Generator = () => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({ 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    flag: '🇺🇸'
  });
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>({ 
    id: 'en-US-1', 
    name: 'Matthew', 
    gender: 'male' 
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(3); // For free tier

  const handleGenerate = () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real application, this would be the URL returned from your backend
      setAudioUrl('https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-4.mp3');
      setIsGenerating(false);
      setRemainingGenerations(prev => prev - 1);
    }, 3000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    // Reset voice when language changes
    setSelectedVoice({ 
      id: `${language.code}-1`, 
      name: 'Default', 
      gender: 'male' 
    });
  };

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Audio Description Generator</h1>
          <p className="text-lg text-muted-foreground">
            Transform your product descriptions into engaging audio content.
          </p>
        </div>

        <Tabs defaultValue="generator" className="glassmorphism rounded-xl overflow-hidden shadow-lg">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="history">Your Audios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="p-0">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Product Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Enter your product description here..."
                    value={text}
                    onChange={handleTextChange}
                    className="h-32"
                  />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Language
                    </label>
                    <LanguageSelector 
                      onSelect={handleSelectLanguage} 
                      selectedLanguage={selectedLanguage}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Voice
                    </label>
                    <VoiceSelector 
                      onSelect={handleSelectVoice} 
                      selectedVoice={selectedVoice}
                      language={selectedLanguage.code}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    <Badge variant="outline" className="mr-2">
                      Free Plan
                    </Badge>
                    {remainingGenerations} generations remaining today
                  </p>
                </div>
                
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !text.trim() || remainingGenerations <= 0}
                  className="gap-1"
                >
                  <Wand2 size={18} />
                  {isGenerating ? 'Generating...' : 'Generate Audio'}
                </Button>
              </div>
            </div>
            
            {(isGenerating || audioUrl) && (
              <div className="border-t border-border p-6 bg-secondary/20">
                <h3 className="text-xl font-semibold mb-4">
                  {isGenerating ? 'Generating Your Audio...' : 'Your Generated Audio'}
                </h3>
                <AudioPlayer 
                  audioUrl={audioUrl || undefined} 
                  isGenerating={isGenerating}
                  fileName={`product-description-${Date.now()}.mp3`}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="p-6">
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold mb-2">Your Audio History</h3>
              <p className="text-muted-foreground mb-4">
                Sign in to view and manage your previously generated audio files.
              </p>
              <Button>Sign In</Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tips for Great Product Descriptions</CardTitle>
              <CardDescription>
                Follow these tips to create engaging audio descriptions that convert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>Keep descriptions clear, concise, and engaging</li>
                <li>Highlight key features and benefits</li>
                <li>Use sensory language to create vivid mental images</li>
                <li>Include important specifications and dimensions</li>
                <li>Address potential customer questions or concerns</li>
              </ul>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Great product descriptions lead to better audio results and higher conversion rates.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Generator;
