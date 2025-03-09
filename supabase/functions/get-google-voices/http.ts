
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Create response with CORS headers
 */
export function createResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Create error response with fallback data
 */
export function createErrorResponse(error: string, message: string, fallbackData: any) {
  return createResponse({
    error,
    message,
    fallbackUsed: true,
    data: fallbackData
  });
}

/**
 * Validate request authentication
 */
export function validateAuth(req: Request): boolean {
  const apikey = req.headers.get('apikey');
  if (!apikey) {
    console.error("Missing apikey header");
    return false;
  }
  return true;
}

/**
 * Log request headers for debugging (excluding sensitive headers)
 */
export function logRequestHeaders(req: Request): void {
  console.log("Request headers received:");
  for (const [key, value] of req.headers.entries()) {
    if (key.toLowerCase() !== 'authorization') { // Don't log auth tokens
      console.log(`${key}: ${value}`);
    } else {
      console.log("authorization: [REDACTED]");
    }
  }
}
