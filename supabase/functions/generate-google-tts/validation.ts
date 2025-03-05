
// Input validation utilities
export function validateTTSRequest(requestData: any): {
  text: string;
  language: string;
  voice: string;
  user_id: string;
} {
  const { text, language, voice, user_id } = requestData;

  // Validate request parameters
  if (!text) {
    throw new Error('Text is required');
  }

  if (!language) {
    throw new Error('Language is required');
  }

  if (!voice) {
    throw new Error('Voice is required');
  }

  if (!user_id) {
    throw new Error('User ID is required');
  }

  return { text, language, voice, user_id };
}

export function validateEnvironment(): {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GOOGLE_STORAGE_BUCKET: string;
  credentialsJson: string;
  credentials: any;
} {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase configuration');
  }

  // Get Google Cloud Storage bucket name
  const GOOGLE_STORAGE_BUCKET = Deno.env.get("GOOGLE_STORAGE_BUCKET") || "users_generated_files";
  if (!GOOGLE_STORAGE_BUCKET) {
    throw new Error("Missing Google Storage bucket name");
  }
  
  // Load Google credentials
  const credentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  if (!credentialsJson) {
    throw new Error("Missing Google credentials");
  }
  
  // Parse credentials
  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("Invalid Google credentials format");
    }
  } catch (error) {
    console.error("Failed to parse Google credentials:", error);
    throw new Error("Invalid Google credentials JSON format");
  }

  return {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_STORAGE_BUCKET,
    credentialsJson,
    credentials
  };
}
