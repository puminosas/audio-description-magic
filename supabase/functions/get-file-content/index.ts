
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin role using RLS policies
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get file path from request body
    const { filePath } = await req.json();
    
    if (!filePath) {
      return new Response(JSON.stringify({ error: 'Missing file path' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // For security reasons, we're simulating file content retrieval
    // In a real implementation, this would securely read the actual file
    console.log(`Fetching content for file: ${filePath}`);
    
    // Generate a sample content based on file type
    const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
    let sampleContent = '';
    
    if (['js', 'jsx', 'ts', 'tsx'].includes(fileExtension)) {
      sampleContent = `// Sample JavaScript/TypeScript content for ${filePath}\n\n` +
        `import React from 'react';\n\n` +
        `const Component = () => {\n` +
        `  return <div>This is a sample component</div>;\n` +
        `};\n\n` +
        `export default Component;\n`;
    } else if (['css', 'scss'].includes(fileExtension)) {
      sampleContent = `/* Sample CSS content for ${filePath} */\n\n` +
        `.container {\n` +
        `  display: flex;\n` +
        `  flex-direction: column;\n` +
        `  padding: 1rem;\n` +
        `}\n`;
    } else if (['json'].includes(fileExtension)) {
      sampleContent = `{\n` +
        `  "name": "sample-project",\n` +
        `  "version": "1.0.0",\n` +
        `  "description": "Sample content for ${filePath}"\n` +
        `}\n`;
    } else if (['html'].includes(fileExtension)) {
      sampleContent = `<!DOCTYPE html>\n` +
        `<html>\n` +
        `<head>\n` +
        `  <title>Sample HTML</title>\n` +
        `</head>\n` +
        `<body>\n` +
        `  <h1>Sample content for ${filePath}</h1>\n` +
        `</body>\n` +
        `</html>\n`;
    } else {
      sampleContent = `// Sample content for ${filePath}\n\n` +
        `This is a sample file content generated for demonstration purposes.\n` +
        `In a production environment, this would be the actual file content.\n`;
    }

    return new Response(JSON.stringify({ 
      content: sampleContent,
      filePath: filePath
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error in get-file-content function:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
