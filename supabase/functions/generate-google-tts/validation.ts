
// Validate request data and environment variables
export function validateTTSRequest(data: any) {
  const { text, language, voice, user_id } = data;
  
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }
  
  if (!language || typeof language !== 'string') {
    throw new Error('Language is required and must be a string');
  }
  
  if (!voice || typeof voice !== 'string') {
    throw new Error('Voice is required and must be a string');
  }
  
  if (!user_id || typeof user_id !== 'string') {
    throw new Error('User ID is required and must be a string');
  }
  
  // Validate text length to prevent extremely large TTS requests
  if (text.length > 5000) {
    throw new Error('Text exceeds maximum length of 5000 characters');
  }
  
  return { text, language, voice, user_id };
}

export function validateEnvironment() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is required');
  }
  
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }
  
  const GOOGLE_APPLICATION_CREDENTIALS = Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON');
  if (!GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required');
  }
  
  // Parse the credentials JSON
  try {
    const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS);
    
    // Validate essential credential fields
    if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
      throw new Error('Google credentials JSON missing required fields');
    }
    
    return { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, credentials };
  } catch (e) {
    throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format: ' + e.message);
  }
}

// Validate and sanitize file paths to prevent security issues
export function validateAndSanitizeFilePath(path: string): string {
  // Remove any potentially harmful characters
  const sanitized = path.replace(/[^a-zA-Z0-9_\-./]/g, '_');
  
  // Prevent path traversal attacks
  if (sanitized.includes('..')) {
    throw new Error('Invalid file path: path traversal not allowed');
  }
  
  return sanitized;
}
