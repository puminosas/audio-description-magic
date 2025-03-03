
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define safe directories that can be modified
const SAFE_DIRECTORIES = [
  '/src',
  '/public',
  '/supabase/functions',
];

// Define files that should never be modified
const FORBIDDEN_FILES = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'package.json',
  'package-lock.json',
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

    // Get the file path and content from the request
    const { filePath, newContent } = await req.json();
    
    if (!filePath || newContent === undefined) {
      return new Response(
        JSON.stringify({ error: 'File path and new content are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Writing to file: ${filePath}`);
    
    // Security check for file path
    if (!isSafePath(filePath)) {
      console.error(`Access denied to file: ${filePath}`);
      return new Response(
        JSON.stringify({ error: 'Access denied to this file path. Cannot edit restricted files.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Make sure the directory exists
    const directory = path.dirname(filePath);
    try {
      await Deno.mkdir(directory, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }

    // Write the file
    try {
      await Deno.writeTextFile(filePath, newContent);
    } catch (error) {
      console.error(`Error writing to file ${filePath}:`, error);
      return new Response(
        JSON.stringify({ error: `Failed to write to file: ${error.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `File ${filePath} updated successfully`,
        filePath 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in edit-file function:", error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
