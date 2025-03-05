
import React from 'react';
import { Card } from '@/components/ui/card';
import ProjectFilesPanel from './ProjectFilesPanel';
import FilePreviewPanel from './FilePreviewPanel';
import ErrorMessage from './ErrorMessage';

interface FileExplorerProps {
  selectedFile: string | null;
  fileContent: string;
  isLoadingContent: boolean;
  fileError: string | null;
  handleFileSelect: (filePath: string) => void;
  setFileContent: (content: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleSaveFile: () => void;
  handleAnalyzeWithAI: () => void;
  retryLastMessage: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  selectedFile,
  fileContent,
  isLoadingContent,
  fileError,
  handleFileSelect,
  setFileContent,
  setIsEditing,
  handleSaveFile,
  handleAnalyzeWithAI,
  retryLastMessage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* File browser */}
      <div className="md:col-span-1">
        <ProjectFilesPanel 
          onFileSelect={handleFileSelect} 
          selectedFile={selectedFile}
        />
      </div>
      
      {/* File preview */}
      <div className="md:col-span-3">
        {selectedFile ? (
          <FilePreviewPanel 
            selectedFile={selectedFile}
            fileContent={fileContent}
            isLoadingContent={isLoadingContent}
            setFileContent={setFileContent}
            setIsEditing={setIsEditing}
            handleSaveFile={handleSaveFile}
            handleAnalyzeWithAI={handleAnalyzeWithAI}
          />
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>Select a file to preview and edit</p>
          </Card>
        )}
        
        {fileError && (
          <ErrorMessage 
            error={fileError} 
            retryLastMessage={retryLastMessage}
          />
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
