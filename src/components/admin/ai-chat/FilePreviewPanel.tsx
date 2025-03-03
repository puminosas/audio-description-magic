
import React from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Code, Save, X, Wand2, FileText } from 'lucide-react';

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
  // Determine file type from extension for syntax highlighting (can be expanded)
  const getFileType = () => {
    const ext = selectedFile.split('.').pop()?.toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return 'JavaScript/TypeScript';
    if (['html', 'css', 'scss'].includes(ext)) return 'HTML/CSS';
    if (['json'].includes(ext)) return 'JSON';
    return 'Text';
  };

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
      ) : (
        <Textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
      )}
      <div className="mt-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
        <div className="flex gap-2">
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
            disabled={isLoadingContent}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        File content will be provided to the AI for analysis when using the "Analyze with AI" button
      </p>
    </Card>
  );
};

export default FilePreviewPanel;
