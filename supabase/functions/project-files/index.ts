
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { walk } from 'https://deno.land/std@0.168.0/fs/walk.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';
import { extname, basename } from 'https://deno.land/std@0.168.0/path/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://audiodescriptions.online',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Directories to ignore
const IGNORE_DIRS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.cache',
  '.github',
  '.vscode',
  'public',
];

// Get file extension without the dot
function getFileType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return ext ? ext.substring(1) : '';
}

// Function to check if a file should be included
function shouldIncludeFile(path: string): boolean {
  // Skip directories in the ignore list
  for (const dir of IGNORE_DIRS) {
    if (path.includes(`/${dir}/`) || path.endsWith(`/${dir}`)) {
      return false;
    }
  }

  // Skip hidden files and directories (starting with .)
  const fileName = basename(path);
  if (fileName.startsWith('.')) {
    return false;
  }

  // Skip large files and binary files
  const ext = getFileType(path);
  const binaryExts = ['jpg', 'jpeg', 'png', 'gif', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'mp3', 'mp4', 'mov', 'zip', 'pdf'];
  if (binaryExts.includes(ext)) {
    return false;
  }

  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Get Supabase environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are not set');
    }

    // Parse URL to get user ID from query parameter
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is an admin if userId is provided
    if (userId) {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (rolesError) {
        console.error('Error checking admin role:', rolesError);
        throw new Error('Error verifying admin status');
      }

      if (!roles || roles.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Get the project directory
    const projectDir = Deno.cwd();
    const files = [];

    // Use the walk function to recursively traverse the directory
    for await (const entry of walk(projectDir, { 
      includeDirs: false,
      followSymlinks: false,
      exts: ['ts', 'tsx', 'js', 'jsx', 'json', 'css', 'scss', 'html', 'md', 'toml', 'yaml', 'yml'], 
    })) {
      // Get the relative path from the project directory
      const relativePath = entry.path.substring(projectDir.length + 1);
      
      if (shouldIncludeFile(relativePath)) {
        const fileType = getFileType(entry.path);
        const fileInfo = await Deno.stat(entry.path);
        
        files.push({
          path: relativePath,
          type: fileType,
          size: fileInfo.size,
        });
      }
    }

    return new Response(
      JSON.stringify(files),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error listing project files:', error);
    
    return new Response(
      JSON.stringify({ error: `Failed to list project files: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
