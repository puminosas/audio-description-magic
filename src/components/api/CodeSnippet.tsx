
import React from 'react';
import { Card } from '@/components/ui/card';

interface CodeSnippetProps {
  code: string;
  language: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language }) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-secondary/20 p-1 text-xs font-mono text-muted-foreground border-b">
        {language}
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </Card>
  );
};

export default CodeSnippet;
