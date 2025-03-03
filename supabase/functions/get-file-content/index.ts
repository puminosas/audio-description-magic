
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define safe directories that can be accessed
const SAFE_DIRECTORIES = [
  '/src',
  '/public',
  '/supabase/functions',
];

// Define files that should not be accessible
const FORBIDDEN_FILES = [
  '.env',
  'env.local',
  '.env.production',
  '.env.development',
  'serviceAccount.json',
  'firebase-admin.json',
];

function isSafePath(filePath: string): boolean {
  // Normalize and clean the path
  const normalizedPath = path.normalize(filePath);
  
  // Check if the path is within allowed directories
  const isInSafeDir = SAFE_DIRECTORIES.some(dir => 
    normalizedPath.startsWith(dir) || normalizedPath.startsWith(`.${dir}`)
  );
  
  // Check if the file is not in the forbidden list
  const fileName = path.basename(normalizedPath);
  const isNotForbidden = !FORBIDDEN_FILES.some(forbiddenFile => 
    fileName === forbiddenFile || fileName.endsWith(`.${forbiddenFile}`)
  );
  
  return isInSafeDir && isNotForbidden;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the file path from the request
    const { filePath } = await req.json();
    
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'File path is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Requested file: ${filePath}`);
    
    // Security check for file path
    if (!isSafePath(filePath)) {
      console.error(`Access denied to file: ${filePath}`);
      return new Response(
        JSON.stringify({ error: 'Access denied to this file path' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Try to read the file
    let fileContent = '';
    try {
      fileContent = await Deno.readTextFile(filePath);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return new Response(
        JSON.stringify({ error: `File not found or cannot be read: ${error.message}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        filePath,
        content: fileContent 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in get-file-content function:", error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
