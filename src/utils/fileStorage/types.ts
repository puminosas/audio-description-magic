
export interface FileMetadata {
  id?: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  size?: number;
  isTemporary: boolean;
  userId?: string;
  sessionId?: string;
  createdAt?: Date;
}
