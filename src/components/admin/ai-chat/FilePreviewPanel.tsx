
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

  // Determine file type from extension for syntax highlighting (can be expanded)
  const getFileType = () => {
    const ext = selectedFile.split('.').pop()?.toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return 'JavaScript/TypeScript';
    if (['html', 'css', 'scss'].includes(ext)) return 'HTML/CSS';
    if (['json'].includes(ext)) return 'JSON';
    return 'Text';
  };

  const copyToClipboard = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent)
        .then(() => {
          toast({
            title: "Copied to clipboard",
            description: `File content from ${selectedFile} has been copied`,
          });
        })
        .catch((error) => {
          console.error('Failed to copy:', error);
          toast({
            title: "Copy failed",
            description: "Could not copy content to clipboard",
            variant: "destructive"
          });
        });
    }
  };

  const isFileContentError = fileContent && fileContent.startsWith('// Error loading content');

  return (
    <Card className="p-4">
      <h3 className="mb-3 flex items-center text-lg font-medium">
        <Code className="mr-2 h-5 w-5" />
        File: {selectedFile}
        <span className="ml-2 text-xs text-muted-foreground">({getFileType()})</span>
      </h3>
      {isLoadingContent ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="ml-2">Loading file content...</span>
        </div>
      ) : isFileContentError ? (
        <div className="space-y-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load file content. The file may be inaccessible or the service may be unavailable.
            </AlertDescription>
          </Alert>
          <Textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            className="min-h-[200px] font-mono text-sm bg-muted/50"
            readOnly
          />
        </div>
      ) : fileContent ? (
        <Textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
      ) : (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load file content. The file may be empty or inaccessible.
          </AlertDescription>
        </Alert>
      )}
      <div className="mt-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
        <div className="flex gap-2">
          {isFileContentError ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAnalyzeWithAI}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                disabled={isLoadingContent || !fileContent}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Content
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAnalyzeWithAI}
                disabled={isLoadingContent || !fileContent}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Analyze with AI
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveFile}
                disabled={isLoadingContent || !fileContent || isFileContentError}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {isFileContentError 
          ? "You may need to ensure your Supabase Edge Functions are properly configured for file access."
          : "File content will be provided to the AI for analysis when using the \"Analyze with AI\" button"}
      </p>
    </Card>
  );
};

export default FilePreviewPanel;
