
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileInfo } from '../types';

export interface FileListProps {
  files: FileInfo[];
  selectedFile: FileInfo | null;
  onFileSelect: (file: FileInfo) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, selectedFile, onFileSelect }) => {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <Card
          key={file.path}
          className={`cursor-pointer ${selectedFile?.path === file.path ? 'border-2 border-primary' : 'border'}`}
          onClick={() => onFileSelect(file)}
        >
          <CardContent className="flex items-center justify-between p-3">
            <div className="text-sm font-medium">{file.path.split('/').pop()}</div>
            <Badge variant="secondary">{file.type || 'unknown'}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FileList;
