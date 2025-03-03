
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define base directories to scan
const BASE_DIRECTORIES = [
  '/src',
  '/public',
  '/supabase/functions',
];

// Define file patterns to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.env/,
  /\.DS_Store/,
  /\.vscode/,
  /\.idea/,
  /build/,
  /dist/,
];

interface FileInfo {
  path: string;
  type: string;
  size?: number;
}

function shouldExcludeFile(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function getFileType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().substring(1);
  
  // Group by type
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return 'script';
  if (['css', 'scss', 'sass', 'less'].includes(ext)) return 'style';
  if (['html', 'htm', 'xml', 'svg'].includes(ext)) return 'markup';
  if (['json', 'yaml', 'yml', 'toml'].includes(ext)) return 'data';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
  if (['md', 'txt', 'pdf', 'doc', 'docx'].includes(ext)) return 'document';
  
  return ext || 'unknown';
}

async function scanDirectory(dir: string): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  
  try {
    // Check if directory exists
    try {
      await Deno.stat(dir);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log(`Directory does not exist: ${dir}`);
        return files;
      }
      throw error;
    }
    
    // Scan the directory
    for await (const entry of Deno.readDir(dir)) {
      const filePath = path.join(dir, entry.name);
      
      // Skip excluded files
      if (shouldExcludeFile(filePath)) {
        continue;
      }
      
      if (entry.isDirectory) {
        // Recursively scan subdirectories
        const subDirFiles = await scanDirectory(filePath);
        files.push(...subDirFiles);
      } else if (entry.isFile) {
        // Get file info
        try {
          const fileInfo = await Deno.stat(filePath);
          files.push({
            path: filePath,
            type: getFileType(filePath),
            size: fileInfo.size,
          });
        } catch (error) {
          console.error(`Error getting file info for ${filePath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return files;
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

    let files: FileInfo[] = [];
    
    // Scan all base directories
    for (const dir of BASE_DIRECTORIES) {
      const dirFiles = await scanDirectory(dir);
      files = [...files, ...dirFiles];
    }
    
    console.log(`Found ${files.length} files in project`);

    return new Response(
      JSON.stringify(files),
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
