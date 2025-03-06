
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Define a more comprehensive list of directories to ignore
const IGNORE_DIRS = [
  '.git', 'node_modules', 'dist', 'build', '.cache', '.vscode', 
  'public', 'supabase/functions/node_modules'
];

// Define file extensions we want to include
const INCLUDE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', 
  '.html', '.md', '.txt', '.sql'
];

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const adminCheckResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/has_role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
      },
      body: JSON.stringify({ role: 'admin' }),
    });

    const isAdmin = await adminCheckResponse.json();
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Define a simulated file structure since we can't access real files in production
    // This is a security feature for hosted environments
    const sampleFiles = [
      { path: 'src/components/admin/AdminAiChat.tsx', type: 'tsx', size: 12450 },
      { path: 'src/components/admin/ai-chat/ChatMessages.tsx', type: 'tsx', size: 1240 },
      { path: 'src/components/admin/ai-chat/ProjectFilesPanel.tsx', type: 'tsx', size: 2350 },
      { path: 'src/components/admin/ai-chat/FilePreviewPanel.tsx', type: 'tsx', size: 980 },
      { path: 'src/components/admin/ai-chat/AdminActionsPanel.tsx', type: 'tsx', size: 780 },
      { path: 'src/pages/Admin/AdminAiChat.tsx', type: 'tsx', size: 950 },
      { path: 'src/pages/Admin/index.tsx', type: 'tsx', size: 1450 },
      { path: 'src/utils/audio/index.ts', type: 'ts', size: 350 },
      { path: 'src/utils/audio/generationService.ts', type: 'ts', size: 2100 },
      { path: 'src/utils/audio/types.ts', type: 'ts', size: 780 },
      { path: 'src/context/AuthContext.tsx', type: 'tsx', size: 3560 },
      { path: 'src/services/authService.ts', type: 'ts', size: 1780 },
      { path: 'src/integrations/supabase/client.ts', type: 'ts', size: 450 },
      { path: 'supabase/functions/ai-chat/index.ts', type: 'ts', size: 2150 },
      { path: 'supabase/functions/project-files/index.ts', type: 'ts', size: 1980 },
      { path: 'supabase/functions/generate-description/index.ts', type: 'ts', size: 1920 },
      { path: 'supabase/functions/generate-google-tts/index.ts', type: 'ts', size: 2450 },
      { path: 'package.json', type: 'json', size: 1650 },
      { path: 'vite.config.ts', type: 'ts', size: 680 },
      { path: 'tailwind.config.ts', type: 'ts', size: 850 },
      { path: 'tsconfig.json', type: 'json', size: 560 },
    ];

    console.log("Returning simulated project files for audiodescriptions.online");
    return new Response(JSON.stringify(sampleFiles), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in project-files function:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
