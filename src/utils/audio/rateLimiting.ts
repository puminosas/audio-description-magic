
/**
 * Utility for rate limiting API calls
 */

// Create a simple rate limiter for API calls
const apiCallTimestamps: Record<string, number[]> = {};

/**
 * Check if the current call is within rate limits
 * @param apiName Identifier for the API being called
 * @param maxCalls Maximum number of calls allowed in the time window
 * @param timeWindowMs Time window in milliseconds
 * @returns Boolean indicating if the call is allowed
 */
export const checkRateLimiting = (apiName: string, maxCalls: number, timeWindowMs: number): boolean => {
  const now = Date.now();
  const timestamps = apiCallTimestamps[apiName] || [];
  
  // Filter out timestamps older than our time window
  const recentCalls = timestamps.filter(time => (now - time) < timeWindowMs);
  
  // Add current timestamp
  recentCalls.push(now);
  apiCallTimestamps[apiName] = recentCalls;
  
  // Check if we've exceeded our rate limit
  return recentCalls.length <= maxCalls;
};
