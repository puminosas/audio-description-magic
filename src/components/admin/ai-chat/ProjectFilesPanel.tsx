import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Folder, FileText, Search, RefreshCw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectFilesPanelProps {
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
}

const ProjectFilesPanel: React.FC<ProjectFilesPanelProps> = ({ onFileSelect, selectedFile }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load project files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filteredFiles = files.filter((file) => 
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium flex items-center">
          <Folder className="h-4 w-4 mr-2" />
          Project Files
        </h3>
        
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2.5"
            >
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center p-4 text-destructive">
            <p>{error}</p>
            <button
              onClick={fetchFiles}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            <p>No files found</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredFiles.map((file, index) => (
              <li key={index}>
                <button
                  className={cn(
                    "w-full text-left px-2 py-1 rounded text-sm flex items-center",
                    selectedFile === file.path
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                  onClick={() => onFileSelect(file.path)}
                >
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{file.path.split('/').pop()}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-2 border-t">
        <button
          onClick={fetchFiles}
          className="w-full flex items-center justify-center p-2 text-sm bg-accent rounded"
          disabled={isLoading}
        >
          <RefreshCw className={cn(
            "h-4 w-4 mr-2",
            isLoading && "animate-spin"
          )} />
          Refresh Files
        </button>
      </div>
    </Card>
  );
};

export default ProjectFilesPanel;
