
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { walk } from "https://deno.land/std@0.168.0/fs/walk.ts";
import { extname, join } from "https://deno.land/std@0.168.0/path/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known project directories to include
const PROJECT_ROOT = Deno.cwd();

// Directories and files to ignore
const IGNORE_DIRS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.cache'
];

// File extensions to include
const INCLUDE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.css', '.scss', 
  '.html', '.md', '.json', '.yml', '.yaml'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization') || '';
    
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', { 
      role: 'admin',
      user_id: user.id 
    });
    
    if (roleError || !isAdmin) {
      console.error('User is not an admin:', roleError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Getting project files from:', PROJECT_ROOT);
    
    const files = [];
    const maxFiles = 100; // Limit the number of files to return
    
    try {
      // List files using walk
      for await (const entry of walk(PROJECT_ROOT, {
        maxDepth: 4, // Limit depth to avoid too many files
        includeDirs: false,
        skip: (entry) => {
          // Skip directories and files we want to ignore
          if (IGNORE_DIRS.some(dir => entry.path.includes(`/${dir}/`))) {
            return true;
          }
          
          // Only include files with specified extensions
          const ext = extname(entry.path).toLowerCase();
          return !INCLUDE_EXTENSIONS.includes(ext);
        }
      })) {
        if (files.length >= maxFiles) break; // Limit the number of files
        
        // Get path relative to project root
        const relativePath = entry.path.replace(PROJECT_ROOT, '').replace(/^\//, '');
        
        files.push({
          path: relativePath,
          type: extname(entry.name).replace('.', ''),
          size: (await Deno.stat(entry.path)).size
        });
      }
      
      console.log(`Found ${files.length} files`);
      
      return new Response(
        JSON.stringify(files),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (fsError) {
      console.error('Error reading filesystem:', fsError);
      throw new Error(`File system error: ${fsError.message}`);
    }
  } catch (error) {
    console.error('Error in project-files function:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
