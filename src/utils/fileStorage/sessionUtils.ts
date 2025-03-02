
import { v4 as uuidv4 } from 'uuid';

/**
 * Get a session ID for guest users or create a new one
 */
export const getOrCreateGuestSessionId = (): string => {
  const storageKey = 'audioDesc_guestSessionId';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};
