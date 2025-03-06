
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const isValidFilePath = (path: string): boolean => {
  // Basic security check to prevent access to sensitive files
  const forbiddenPatterns = [
    /\.env/i,
    /config\.toml/i,
    /password/i,
    /secret/i,
    /\.git/i,
    /node_modules/i
  ];
  
  return !forbiddenPatterns.some(pattern => pattern.test(path));
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, newContent } = await req.json();
    
    if (!filePath || newContent === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'File path and content are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Security check
    if (!isValidFilePath(filePath)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access to this file is restricted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // In a real implementation, this would write to the actual file
    // For security and demo purposes, we just simulate success
    console.log(`Simulating file edit for: ${filePath}`);
    console.log(`Content length: ${newContent.length} characters`);

    // Simulate a delay to make it feel realistic
    await new Promise(resolve => setTimeout(resolve, 800));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "File updated successfully! (This is a simulated response for demo purposes)" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error editing file:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to edit file' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
