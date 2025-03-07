
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadSectionProps {
  setText: (text: string) => void;
  uploadedFileName: string | null;
  setUploadedFileName: (fileName: string | null) => void;
}

const FileUploadSection = ({ 
  setText, 
  uploadedFileName, 
  setUploadedFileName 
}: FileUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 1MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type (only .txt files)
    if (file.type !== 'text/plain') {
      toast({
        title: "Invalid File Type",
        description: "Only plain text (.txt) files are allowed",
        variant: "destructive"
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
        setUploadedFileName(file.name);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Error",
        description: "Failed to read the uploaded file",
        variant: "destructive"
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {uploadedFileName && (
        <div className="flex items-center gap-2 p-2 mb-4 bg-secondary/20 rounded border">
          <FileText size={16} />
          <span className="text-sm">{uploadedFileName}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto h-6 text-xs" 
            onClick={() => {
              setText('');
              setUploadedFileName(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            Remove
          </Button>
        </div>
      )}
      
      <div className="flex gap-2 mb-6">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".txt" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={triggerFileInput}
          className="gap-1"
        >
          <Upload size={16} />
          Upload Text File
        </Button>
        <p className="text-xs text-muted-foreground self-center">Supports .txt files up to 1MB</p>
      </div>
    </>
  );
};

export default FileUploadSection;
