
import { useState } from 'react';
import { Check, Copy, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface ApiExampleProps {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  request?: object;
  response?: object;
  curl?: string;
  description?: string;
}

const ApiExample = ({
  endpoint,
  method,
  request,
  response,
  curl,
  description
}: ApiExampleProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('curl');

  const formatJson = (json: object) => {
    return JSON.stringify(json, null, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate a sample code for different languages
  const nodejsCode = `const axios = require('axios');

const options = {
  method: '${method}',
  url: '${endpoint}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${request ? `,
  data: ${formatJson(request)}` : ''}
};

try {
  const response = await axios.request(options);
  console.log(response.data);
} catch (error) {
  console.error(error);
}`;

  const pythonCode = `import requests

url = "${endpoint}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}${request ? `

payload = ${formatJson(request)}
response = requests.${method.toLowerCase()}(url, json=payload, headers=headers)` : `

response = requests.${method.toLowerCase()}(url, headers=headers)`}
print(response.json())`;

  return (
    <div className="glassmorphism rounded-lg overflow-hidden">
      <div className="bg-secondary/50 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className={`
            px-2 py-1 text-xs font-bold rounded
            ${method === 'GET' ? 'bg-green-100 text-green-800' : ''}
            ${method === 'POST' ? 'bg-blue-100 text-blue-800' : ''}
            ${method === 'PUT' ? 'bg-amber-100 text-amber-800' : ''}
            ${method === 'DELETE' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {method}
          </span>
          <span className="font-mono text-sm">{endpoint}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(endpoint)}
          className="h-8 px-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      {description && (
        <div className="p-4 border-b border-border">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
      
      <Tabs defaultValue="curl" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-4 border-b border-border">
          <TabsList className="grid grid-cols-3 w-fit">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="node">Node.js</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="relative">
          <TabsContent value="curl" className="m-0">
            <pre className="p-4 overflow-x-auto text-sm font-mono">
              <code>{curl}</code>
            </pre>
          </TabsContent>
          
          <TabsContent value="node" className="m-0">
            <pre className="p-4 overflow-x-auto text-sm font-mono">
              <code>{nodejsCode}</code>
            </pre>
          </TabsContent>
          
          <TabsContent value="python" className="m-0">
            <pre className="p-4 overflow-x-auto text-sm font-mono">
              <code>{pythonCode}</code>
            </pre>
          </TabsContent>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const codeMap = {
                curl: curl || '',
                node: nodejsCode,
                python: pythonCode
              };
              copyToClipboard(codeMap[activeTab as keyof typeof codeMap]);
            }}
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        {request && (
          <div className="p-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Request Body</h4>
            <pre className="bg-secondary/30 p-3 rounded-md overflow-x-auto text-sm font-mono">
              <code>{formatJson(request)}</code>
            </pre>
          </div>
        )}
        
        {response && (
          <div className="p-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Response</h4>
            <pre className="bg-secondary/30 p-3 rounded-md overflow-x-auto text-sm font-mono">
              <code>{formatJson(response)}</code>
            </pre>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default ApiExample;
