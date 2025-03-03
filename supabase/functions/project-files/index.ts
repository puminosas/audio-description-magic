
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

// Define files that should not be visible
const FORBIDDEN_FILES = [
  '.env',
  'env.local',
  '.env.production',
  '.env.development',
  'serviceAccount.json',
  'firebase-admin.json',
];

// Define file extensions to categorize files
const FILE_TYPES = {
  // Code files
  'code': ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.go', '.rb', '.php', '.vue'],
  // Markup and style files
  'markup': ['.html', '.xml', '.css', '.scss', '.sass', '.less'],
  // Data files
  'data': ['.json', '.yaml', '.yml', '.toml', '.csv', '.xlsx', '.xls'],
  // Media files
  'media': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.mp3', '.wav', '.ogg', '.flac', '.mp4', '.webm', '.avi', '.mov'],
  // Document files
  'doc': ['.md', '.mdx', '.txt', '.pdf', '.doc', '.docx'],
  // Config files
  'config': ['.env.example', '.gitignore', '.prettierrc', '.eslintrc', 'tsconfig.json', 'vite.config.ts']
};

function getFileType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  for (const [type, extensions] of Object.entries(FILE_TYPES)) {
    if (extensions.includes(ext)) {
      return type;
    }
  }
  
  return 'other';
}

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

async function listDirectory(dirPath: string): Promise<any[]> {
  try {
    const files = [];
    
    for await (const entry of Deno.readDir(dirPath)) {
      const entryPath = path.join(dirPath, entry.name);
      
      // Skip hidden files and directories
      if (entry.name.startsWith('.')) {
        continue;
      }
      
      if (entry.isDirectory) {
        // Recursively scan subdirectories
        const subFiles = await listDirectory(entryPath);
        files.push(...subFiles);
      } else if (entry.isFile && isSafePath(entryPath)) {
        // Add file to the list if it passes the safety check
        const fileType = getFileType(entryPath);
        files.push({
          path: entryPath,
          type: fileType,
          size: (await Deno.stat(entryPath)).size
        });
      }
    }
    
    return files;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
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

    console.log("Scanning project files...");
    
    // Scan all safe directories
    let allFiles = [];
    for (const dir of SAFE_DIRECTORIES) {
      try {
        const dirFiles = await listDirectory(dir);
        allFiles = [...allFiles, ...dirFiles];
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
        // Continue with next directory
      }
    }
    
    // Sort files by path
    allFiles.sort((a, b) => a.path.localeCompare(b.path));
    
    console.log(`Found ${allFiles.length} files`);
    
    return new Response(
      JSON.stringify(allFiles),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in project-files function:", error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
