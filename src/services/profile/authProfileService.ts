
import { convertTemporaryFilesToUserFiles, getOrCreateGuestSessionId } from '@/utils/fileStorageService';

/**
 * Handles user authentication by converting temporary files
 * @param userId The ID of the authenticated user
 * @returns Whether file conversion was successful
 */
export const handleUserAuthentication = async (userId: string) => {
  // Convert any temporary files for this newly authenticated user
  const sessionId = getOrCreateGuestSessionId();
  try {
    await convertTemporaryFilesToUserFiles(userId, sessionId);
    console.log('Temporary files converted to user files on login');
    return true;
  } catch (error) {
    console.error('Error converting temporary files:', error);
    return false;
  }
};
