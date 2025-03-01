
/**
 * Get a session ID for tracking guest users
 */
export const getSessionId = (): string => {
  const storageKey = 'audioDesc_guestSessionId';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};
