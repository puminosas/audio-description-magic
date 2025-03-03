
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, AlertCircle, Search, RefreshCw, Code } from 'lucide-react';

interface FileInfo {
  path: string;
  type: string;
  size?: number;
}

interface ProjectFilesPanelProps {
  files: FileInfo[];
  filteredFiles: FileInfo[];
  uniqueFileTypes: string[];
  fileTypeFilters: string[];
  isLoadingFiles: boolean;
  isRefreshingFiles: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleFileTypeFilter: (type: string) => void;
  setFileTypeFilters: (filters: string[]) => void;
  fetchFiles: () => Promise<void>;
  handleFileSelect: (filePath: string) => void;
}

const ProjectFilesPanel: React.FC<ProjectFilesPanelProps> = ({
  files,
  filteredFiles,
  uniqueFileTypes,
  fileTypeFilters,
  isLoadingFiles,
  isRefreshingFiles,
  searchTerm,
  setSearchTerm,
  toggleFileTypeFilter,
  setFileTypeFilters,
  fetchFiles,
  handleFileSelect
}) => {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center text-lg font-medium">
          <FileText className="mr-2 h-5 w-5" />
          Project Files
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchFiles}
          disabled={isRefreshingFiles}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshingFiles ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh Files</span>
        </Button>
      </div>
      
      {/* Search input */}
      <div className="mb-3 relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {/* File type filters */}
      {uniqueFileTypes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {uniqueFileTypes.map(type => (
            <Button
              key={type}
              variant={fileTypeFilters.includes(type) ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => toggleFileTypeFilter(type)}
            >
              {type}
            </Button>
          ))}
          {fileTypeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setFileTypeFilters([])}
            >
              Clear
            </Button>
          )}
        </div>
      )}
      
      <div className="max-h-[250px] overflow-y-auto rounded-md border">
        {isLoadingFiles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading files...</span>
          </div>
        ) : filteredFiles.length > 0 ? (
          <ul className="divide-y">
            {filteredFiles.map((file, index) => (
              <li key={index} className="px-1 py-0.5 hover:bg-muted/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start p-1 text-left text-xs"
                  onClick={() => handleFileSelect(file.path)}
                >
                  <Code className="mr-2 h-4 w-4" />
                  <span className="truncate">{file.path}</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center py-8 text-center text-sm text-muted-foreground">
            {files.length === 0 ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                No files available
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                No matching files found
              </>
            )}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {filteredFiles.length} of {files.length} files shown
      </p>
    </Card>
  );
};

export default ProjectFilesPanel;
