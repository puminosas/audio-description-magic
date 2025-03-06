
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Code copied",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const EmbedCodeExamples = () => {
  const basicHtmlCode = `<audio controls>
    <source src="https://cdn.audiodescriptions.online/audio123.mp3" type="audio/mpeg">
    Your browser does not support the audio element.
</audio>`;

  const advancedHtmlCode = `<div id="product-audio-player">
    <button onclick="playAudio()">🔊 Listen to Description</button>
    <audio id="product-audio" preload="none">
        <source src="https://cdn.audiodescriptions.online/audio123.mp3" type="audio/mpeg">
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

  const apiCode = `fetch("https://api.audiodescriptions.online/get-audio", {
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

  const reactCode = `import React, { useState, useEffect } from 'react';

const ProductAudioPlayer = ({ productId }) => {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch audio URL from API
    fetch("https://api.audiodescriptions.online/get-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.audio_url) {
        setAudioUrl(data.audio_url);
      }
    })
    .finally(() => setLoading(false));
  }, [productId]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div className="product-audio-player">
      {loading ? (
        <p>Loading audio description...</p>
      ) : (
        <>
          <button 
            onClick={togglePlay}
            aria-label={playing ? "Pause audio description" : "Play audio description"}
          >
            {playing ? "⏸️ Pause" : "🔊 Listen to Description"}
          </button>
          <audio 
            ref={audioRef}
            src={audioUrl} 
            preload="metadata"
            onEnded={() => setPlaying(false)}
          />
        </>
      )}
    </div>
  );
};

export default ProductAudioPlayer;`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
      
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic HTML</TabsTrigger>
          <TabsTrigger value="advanced">Advanced HTML</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="react">React Component</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <div className="space-y-4">
            <p>The simplest way to embed an audio player:</p>
            <CodeBlock code={basicHtmlCode} language="html" />
            <p className="text-sm text-muted-foreground">
              Replace the src URL with the audio URL provided by the generator.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="space-y-4">
            <p>A more customized player with a play/pause button:</p>
            <CodeBlock code={advancedHtmlCode} language="html" />
            <p className="text-sm text-muted-foreground">
              This example adds a custom play button and JavaScript controls.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="api">
          <div className="space-y-4">
            <p>Fetch audio descriptions dynamically with the API:</p>
            <CodeBlock code={apiCode} language="javascript" />
            <p className="text-sm text-muted-foreground">
              Use this to load audio descriptions for specific products.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="react">
          <div className="space-y-4">
            <p>A complete React component example:</p>
            <CodeBlock code={reactCode} language="jsx" />
            <p className="text-sm text-muted-foreground">
              This React component handles loading, playing, and pausing audio descriptions.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmbedCodeExamples;
