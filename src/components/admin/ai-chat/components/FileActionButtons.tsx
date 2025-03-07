
import React from 'react';
import { Save, FileSearch } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { FileInfo } from '../types';

interface FileActionButtonsProps {
  selectedFile: FileInfo | null;
  isAnalyzing: boolean;
  onSaveClick: () => void;
  onAnalyzeClick: () => void;
}

const FileActionButtons: React.FC<FileActionButtonsProps> = ({ 
  selectedFile, 
  isAnalyzing, 
  onSaveClick, 
  onAnalyzeClick 
}) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onSaveClick} 
        disabled={!selectedFile}
        className="gap-1"
      >
        <Save className="h-4 w-4" />
        Save File
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onAnalyzeClick} 
        disabled={!selectedFile || isAnalyzing}
        className="gap-1"
      >
        <FileSearch className="h-4 w-4" />
        {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
      </Button>
    </div>
  );
};

export default FileActionButtons;
