
import React from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';

interface FilePreviewPanelProps {
  selectedFile: string;
  fileContent: string;
  setFileContent: (content: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleSaveFile: () => void;
}

const FilePreviewPanel: React.FC<FilePreviewPanelProps> = ({
  selectedFile,
  fileContent,
  setFileContent,
  setIsEditing,
  handleSaveFile
}) => {
  return (
    <Card className="p-4">
      <h3 className="mb-3 flex items-center text-lg font-medium">
        <Code className="mr-2 h-5 w-5" />
        File Preview: {selectedFile}
      </h3>
      <Textarea
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        className="min-h-[150px] font-mono text-sm"
        readOnly
      />
      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Close
        </Button>
        <Button onClick={handleSaveFile} disabled>File Editing Disabled</Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Note: For security reasons, file editing is disabled in this version
      </p>
    </Card>
  );
};

export default FilePreviewPanel;
