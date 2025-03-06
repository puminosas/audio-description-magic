import React from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Code, Save, X, Wand2, FileText, AlertCircle, Clipboard, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface FilePreviewPanelProps {
  selectedFile: string;
  fileContent: string;
  isLoadingContent: boolean;
  setFileContent: (content: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleSaveFile: () => void;
  handleAnalyzeWithAI: () => void;
}

const FilePreviewPanel: React.FC<FilePreviewPanelProps> = ({
  selectedFile,
  fileContent,
  isLoadingContent,
  setFileContent,
  setIsEditing,
  handleSaveFile,
  handleAnalyzeWithAI
}) => {
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContent).then(
      () => {
        toast({
          description: "Content copied to clipboard",
          duration: 2000
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy to clipboard"
        });
      }
    );
  };

  const getFileExtension = () => {
    return selectedFile.split('.').pop() || '';
  };

  const getLanguage = () => {
    const ext = getFileExtension().toLowerCase();
    if (['js', 'jsx'].includes(ext)) return 'JavaScript';
    if (['ts', 'tsx'].includes(ext)) return 'TypeScript';
    if (['css', 'scss', 'less'].includes(ext)) return 'CSS';
    if (['html'].includes(ext)) return 'HTML';
    if (['json'].includes(ext)) return 'JSON';
    if (['md'].includes(ext)) return 'Markdown';
    return 'Text';
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-240px)]">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          <span className="font-medium truncate max-w-[400px]">
            {selectedFile.split('/').pop()}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            ({getLanguage()})
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAnalyzeWithAI}
            title="Analyze with AI"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
          
          <Button 
            size="sm" 
            variant="default" 
            onClick={handleSaveFile}
            title="Save changes"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      {isLoadingContent ? (
        <div className="flex justify-center items-center flex-1">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Textarea
            value={fileContent}
            onChange={(e) => {
              setFileContent(e.target.value);
              setIsEditing(true);
            }}
            className="font-mono text-sm h-full border-0 rounded-none focus-visible:ring-0 resize-none"
            placeholder="File content will appear here..."
          />
        </div>
      )}
    </Card>
  );
};

export default FilePreviewPanel;
