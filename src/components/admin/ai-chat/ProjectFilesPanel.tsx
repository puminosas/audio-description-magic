
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  Eye,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileImage,
  FileAudio,
  FileVideo,
  File,
  AlertOctagon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Attempt to load files on mount if there are none
  useEffect(() => {
    if (files.length === 0 && !isLoadingFiles && !isRefreshingFiles) {
      fetchFiles().catch(err => {
        console.error("Error auto-loading files:", err);
      });
    }
  }, [files.length, isLoadingFiles, isRefreshingFiles, fetchFiles]);

  // Determine appropriate icon based on file extension
  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    
    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'go', 'rb', 'php'].includes(extension)) {
      return <FileCode className="mr-2 h-4 w-4" />;
    }
    
    // Markup and style files
    if (['html', 'xml', 'css', 'scss', 'sass', 'less'].includes(extension)) {
      return <FileText className="mr-2 h-4 w-4" />;
    }
    
    // Data files
    if (['json', 'yaml', 'yml', 'toml'].includes(extension)) {
      return <FileJson className="mr-2 h-4 w-4" />;
    }
    
    // Spreadsheet files
    if (['csv', 'xlsx', 'xls'].includes(extension)) {
      return <FileSpreadsheet className="mr-2 h-4 w-4" />;
    }
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return <FileImage className="mr-2 h-4 w-4" />;
    }
    
    // Audio files
    if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
      return <FileAudio className="mr-2 h-4 w-4" />;
    }
    
    // Video files
    if (['mp4', 'webm', 'avi', 'mov'].includes(extension)) {
      return <FileVideo className="mr-2 h-4 w-4" />;
    }
    
    // Default file icon
    return <File className="mr-2 h-4 w-4" />;
  };

  // Get human-readable file extension for display
  const getFileExtension = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension ? `.${extension}` : '';
  };

  // Handle refresh with error handling
  const handleRefresh = async () => {
    try {
      await fetchFiles();
      toast({
        title: "Files Refreshed",
        description: "Project files list has been updated",
      });
    } catch (error) {
      console.error("Error refreshing files:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh file list. Please try again later.",
        variant: "destructive"
      });
    }
  };

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
          onClick={handleRefresh}
          disabled={isRefreshingFiles}
          className="h-8 w-8 p-0"
          title="Refresh files list"
        >
          {isRefreshingFiles ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
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
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <AlertOctagon className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-sm font-medium">Could not load project files</p>
            <p className="text-xs text-muted-foreground mt-1">
              There might be an issue connecting to the file service.
            </p>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-3"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Try Again
            </Button>
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
                  {getFileIcon(file.path)}
                  <span className="truncate">{file.path}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {getFileExtension(file.path)}
                  </span>
                  <Eye className="ml-auto h-3 w-3 opacity-50" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center py-8 text-center text-sm text-muted-foreground">
            <Search className="mr-2 h-4 w-4" />
            No matching files found
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
