
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { supabaseTyped } from '@/utils/supabaseHelper';

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
  const [audioData, setAudioData] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(3); // For free tier
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Base64 to Blob conversion for creating audio URL
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  };
  
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product description.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setAudioData(null);
    setAudioUrl(null);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: {
          text: text.trim(),
          language: selectedLanguage.code,
          voice: selectedVoice.id,
        },
      });
      
      if (error) throw error;
      
      if (!data.success || !data.audio_content) {
        throw new Error(data.error || 'Failed to generate audio');
      }
      
      // Create a blob from the base64 audio data
      const audioBlob = base64ToBlob(data.audio_content, 'audio/mpeg');
      const url = URL.createObjectURL(audioBlob);
      
      // Set the audio URL for the player
      setAudioData(data.audio_content);
      setAudioUrl(url);
      
      // Only decrement remaining generations if user isn't logged in or is on free tier
      if (!user || (profile?.plan === 'free')) {
        setRemainingGenerations(prev => Math.max(0, prev - 1));
      }
      
      // If user is logged in, save the audio file to their history
      if (user) {
        await saveAudioToHistory(url, data.audio_content);
      }
      
      toast({
        title: "Success",
        description: "Audio generated successfully!",
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate audio.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save audio to user's history in Supabase
  const saveAudioToHistory = async (audioUrl: string, audioData: string) => {
    try {
      // Generate filename based on first few words of text and timestamp
      const firstWords = text.trim().split(' ').slice(0, 5).join('-');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${firstWords.toLowerCase()}-${timestamp}.mp3`;
      
      // Get audio duration - this is a dummy calculation since we don't have actual duration
      // In a production app, you'd want to properly calculate this
      const approximateDuration = Math.max(10, Math.ceil(text.length / 20));
      
      // Insert record into audio_files table
      const { error } = await supabaseTyped.audio_files
        .insert({
          user_id: user?.id,
          title: text.trim().substring(0, 50) + (text.length > 50 ? '...' : ''),
          description: text.trim(),
          language: selectedLanguage.code,
          voice_name: selectedVoice.name,
          audio_url: audioUrl, // Note: this URL will expire when the page refreshes
          audio_data: audioData, // Store the base64 data
          duration: approximateDuration,
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error saving audio to history:', error);
      // Don't show error toast to user to avoid confusion - the audio generation was successful
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    // Reset voice when language changes to match the language
    const languagePrefix = language.code;
    const defaultVoice: VoiceOption = { 
      id: `${languagePrefix}-${languagePrefix === 'en' ? 'US-1' : 'ES-1'}`, 
      name: languagePrefix === 'en' ? 'Matthew' : 'Default', 
      gender: 'male' 
    };
    setSelectedVoice(defaultVoice);
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
                  {!user ? (
                    <p className="text-sm text-muted-foreground">
                      <Badge variant="outline" className="mr-2">
                        Free Plan
                      </Badge>
                      {remainingGenerations} generations remaining today
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      <Badge variant={profile?.plan === 'premium' ? 'default' : profile?.plan === 'basic' ? 'secondary' : 'outline'} className="mr-2">
                        {profile?.plan ? (profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)) : 'Free'} Plan
                      </Badge>
                      {profile?.plan === 'premium' ? 'Unlimited generations' : 
                       profile?.plan === 'basic' ? `${profile.remaining_generations} / ${profile.daily_limit} generations remaining` : 
                       `${remainingGenerations} generations remaining today`}
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !text.trim() || (!user && remainingGenerations <= 0)}
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
                {user ? 'View and manage your previously generated audio files.' : 'Sign in to view and manage your previously generated audio files.'}
              </p>
              {!user && (
                <Button>Sign In</Button>
              )}
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
