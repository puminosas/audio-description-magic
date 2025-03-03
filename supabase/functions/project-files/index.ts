
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { walk } from "https://deno.land/std@0.170.0/fs/walk.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of directories to ignore
const ignoreDirs = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.cache',
  '.github',
  'public'
];

// List of file extensions to include
const includeExtensions = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.scss',
  '.html',
  '.json',
  '.md',
  '.sql'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if the user is an admin
    const { data: roleData, error: roleError } = await supabase.rpc('has_role', { role: 'admin' });
    if (roleError) {
      console.error('Error checking admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Error checking permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isAdmin = !!roleData;
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For security reasons, we'll return a subset of files with basic information
    // rather than actual file contents to avoid exposing sensitive data
    const files = [];
    const projectRoot = Deno.cwd();
    
    // Walk through the project directory
    try {
      for await (const entry of walk(projectRoot, {
        maxDepth: 4, // Limit depth to avoid processing too many files
        includeDirs: false,
        skip: (entry) => {
          // Skip directories we want to ignore
          if (entry.isDirectory) {
            return ignoreDirs.some(dir => entry.path.includes(dir));
          }
          
          // Only include files with specific extensions
          const ext = entry.path.slice(entry.path.lastIndexOf('.'));
          return !includeExtensions.includes(ext);
        },
      })) {
        // Get relative path
        const relativePath = entry.path.replace(projectRoot, '');
        
        // Only add files, not directories
        if (!entry.isDirectory) {
          files.push({
            path: relativePath,
            type: relativePath.slice(relativePath.lastIndexOf('.') + 1),
            size: (await Deno.stat(entry.path)).size,
          });
        }
      }
    } catch (walkError) {
      console.error('Error walking file system:', walkError);
      // Continue with an empty files array if there's an error
    }
    
    // Sort files by path
    files.sort((a, b) => a.path.localeCompare(b.path));
    
    // Return the list of files
    return new Response(
      JSON.stringify(files),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in project-files function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
