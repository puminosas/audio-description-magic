
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeSnippet from '@/components/ecommerce/CodeSnippet';

interface EmbedOptionsProps {
  audioUrl: string | undefined;
}

const EmbedOptions: React.FC<EmbedOptionsProps> = ({ audioUrl }) => {
  // Generate embed code examples based on current audio
  const getBasicEmbedCode = () => {
    if (!audioUrl) return '';
    
    return `<audio controls>
    <source src="${audioUrl}" type="audio/mpeg">
    Your browser does not support the audio element.
</audio>`;
  };

  const getAdvancedEmbedCode = () => {
    if (!audioUrl) return '';
    
    return `<div id="product-audio-player">
    <button onclick="playAudio()">🔊 Listen to Description</button>
    <audio id="product-audio" preload="none">
        <source src="${audioUrl}" type="audio/mpeg">
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
  );
};

export default EmbedOptions;
