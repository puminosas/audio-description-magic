
// Track API calls for rate limiting
const API_CALLS = {
  openai: new Map<string, number[]>(),  // Maps IP to timestamps
  tts: new Map<string, number[]>()      // Maps IP to timestamps
};

// Rate limiting function
export function checkRateLimit(type: 'openai' | 'tts', ip: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const map = API_CALLS[type];
  
  // Get timestamps for this IP or initialize empty array
  const timestamps = map.get(ip) || [];
  
  // Filter out timestamps older than 1 minute
  const recentCalls = timestamps.filter(time => (now - time) < 60000);
  
  // Check if we've exceeded our limit
  if (recentCalls.length >= maxPerMinute) {
    return false; // Rate limit exceeded
  }
  
  // Add current timestamp and update map
  recentCalls.push(now);
  map.set(ip, recentCalls);
  
  return true; // Rate limit ok
}
