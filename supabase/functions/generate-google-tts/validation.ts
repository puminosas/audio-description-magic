
// Validate request data and environment variables
export function validateTTSRequest(requestData: any) {
  if (!requestData.text || typeof requestData.text !== 'string') {
    throw new Error('Text is required and must be a string');
  }

  if (!requestData.language || typeof requestData.language !== 'string') {
    throw new Error('Language is required and must be a string');
  }

  if (!requestData.voice || typeof requestData.voice !== 'string') {
    throw new Error('Voice is required and must be a string');
  }

  // User ID can be optional for some use cases
  const user_id = requestData.user_id || 'anonymous';

  return {
    text: requestData.text,
    language: requestData.language,
    voice: requestData.voice,
    user_id: user_id
  };
}

export function validateEnvironment() {
  // Check for required environment variables
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is required');
  }

  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }

  const GOOGLE_STORAGE_BUCKET = Deno.env.get('GCS_BUCKET_NAME');
  if (!GOOGLE_STORAGE_BUCKET) {
    throw new Error('GCS_BUCKET_NAME environment variable is required');
  }

  // Get Google Application Credentials JSON
  const credentials = Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON');
  if (!credentials) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required');
  }

  // Parse JSON credentials to verify format
  try {
    JSON.parse(credentials);
  } catch (e) {
    throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format. Must be valid JSON.');
  }

  return {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_STORAGE_BUCKET,
    credentials
  };
}
