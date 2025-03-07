
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DescriptionInput from '@/components/generator/DescriptionInput';
import LanguageVoiceSelector from '@/components/generator/LanguageVoiceSelector';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';
import { useGenerationLogic } from '@/components/generator/hooks/useGenerationLogic';
import CodeSnippet from '@/components/ecommerce/CodeSnippet';
import AudioPlayer from '@/components/ui/AudioPlayer';

const AudioDescriptionDemo = () => {
  const [productName, setProductName] = useState('Ergonomic Office Chair');
  const [productDescription, setProductDescription] = useState('Premium ergonomic office chair with adjustable height, lumbar support, and breathable mesh back. Perfect for long work hours and maintaining proper posture.');
  const [language, setLanguage] = useState<LanguageOption | null>(null);
  const [voice, setVoice] = useState<VoiceOption | null>(null);
  const [demoMode, setDemoMode] = useState<'basic' | 'advanced'>('basic');
  
  const { 
    loading, 
    generatedAudio, 
    error, 
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

  // Generate embed code examples based on current audio
  const getBasicEmbedCode = () => {
    if (!generatedAudio?.audioUrl) return '';
    
    return `<audio controls>
    <source src="${generatedAudio.audioUrl}" type="audio/mpeg">
    Your browser does not support the audio element.
</audio>`;
  };

  const getAdvancedEmbedCode = () => {
    if (!generatedAudio?.audioUrl) return '';
    
    return `<div id="product-audio-player">
    <button onclick="playAudio()">🔊 Listen to Description</button>
    <audio id="product-audio" preload="none">
        <source src="${generatedAudio.audioUrl}" type="audio/mpeg">
    </audio>
</div>

<script>
function playAudio() {
    var audio = document.getElementById("product-audio");
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}
</script>`;
  };

  const getAPIEmbedCode = () => {
    return `// Example API request to fetch audio URL
fetch("https://api.audiodescriptions.online/get-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: "12345" })
})
.then(response => response.json())
.then(data => {
    if (data.audio_url) {
        document.getElementById("product-audio").src = data.audio_url;
    }
});`;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">E-commerce Audio Description Demo</h1>
      <p className="mb-8">This demo shows how to integrate AI-generated audio descriptions into e-commerce product pages.</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Enter your product information to generate an audio description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium mb-1">Product Name</label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label htmlFor="productDescription" className="block text-sm font-medium mb-1">Product Description</label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Enter product description"
                rows={5}
              />
            </div>
            <LanguageVoiceSelector 
              selectedLanguage={language}
              selectedVoice={voice}
              onLanguageChange={setLanguage}
              onVoiceChange={setVoice}
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGenerateAudio} 
              disabled={loading || !language || !voice || !googleTtsAvailable}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Audio Description'}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audio Preview</CardTitle>
              <CardDescription>Listen to the generated audio description</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedAudio?.audioUrl ? (
                <AudioPlayer audioUrl={generatedAudio.audioUrl} />
              ) : (
                <div className="bg-muted p-8 rounded-md text-center">
                  <p>Generate an audio description to preview it here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {generatedAudio?.audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Embed Options</CardTitle>
                <CardDescription>Copy the code to embed this audio in your website</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="api">API Integration</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic">
                    <CodeSnippet code={getBasicEmbedCode()} language="html" />
                  </TabsContent>
                  <TabsContent value="advanced">
                    <CodeSnippet code={getAdvancedEmbedCode()} language="html" />
                  </TabsContent>
                  <TabsContent value="api">
                    <CodeSnippet code={getAPIEmbedCode()} language="javascript" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Implementation Guide</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Step 1: Generate Audio Description</h3>
            <p>Use the form above to generate an audio description for your product.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Step 2: Choose Embedding Method</h3>
            <p>Select from basic HTML embedding, advanced player with custom controls, or API integration.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Step 3: Add to Your E-commerce Website</h3>
            <p>Copy the generated code and add it to your product page templates.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Step 4: Test & Optimize</h3>
            <ul className="list-disc pl-6">
              <li>Test on different browsers (Chrome, Firefox, Safari, Edge)</li>
              <li>Ensure mobile responsiveness for iOS and Android</li>
              <li>Check accessibility compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioDescriptionDemo;
