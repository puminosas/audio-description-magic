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
  
  const GOOGLE_STORAGE_BUCKET = Deno.env.get('GCS_BUCKET_NAME');
  if (!GOOGLE_STORAGE_BUCKET) {
    throw new Error('GCS_BUCKET_NAME environment variable is required');
  }
  
  const GOOGLE_APPLICATION_CREDENTIALS = Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON');
  if (!GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required');
  }
  
  // Parse the credentials JSON
  try {
    const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS);
    return { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_STORAGE_BUCKET, credentials };
  } catch (e) {
    throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format');
  }
}
