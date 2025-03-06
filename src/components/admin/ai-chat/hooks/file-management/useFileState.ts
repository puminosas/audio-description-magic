
import { useState } from 'react';
import type { FileInfo } from '../../types';
import type { FileStateReturn } from './types';

export const useFileState = (): FileStateReturn => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  return {
    files,
    selectedFile,
    isLoadingFiles,
    isLoadingFile,
    fileError,
    setFiles,
    setSelectedFile,
    setIsLoadingFiles,
    setIsLoadingFile,
    setFileError,
  };
};
