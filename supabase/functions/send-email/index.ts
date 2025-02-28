
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Email request type
interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing email request");
  
  // Handle CORS OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if method is POST
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Get request data
    const { to, subject, html, from, text }: EmailRequest = await req.json();

    console.log(`Sending email to: ${Array.isArray(to) ? to.join(", ") : to}`);
    
    // Check for required fields
    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, or html");
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: from || "AudioDescriptions <info@audiodescriptions.online>", // Using your verified domain
      to,
      subject,
      html,
      text: text || undefined,
    });

    if (error) {
      console.error("Email sending error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

// Start the server
serve(handler);
