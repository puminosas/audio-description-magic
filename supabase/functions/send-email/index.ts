
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Inicializuojame Resend su API raktu
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS antraštės
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// El. laiško siuntimo užklausos tipas
interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing email request");
  
  // Apdorojame CORS OPTIONS užklausą
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Tikriname, ar metodas yra POST
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Gauname užklausos duomenis
    const { to, subject, html, from, text }: EmailRequest = await req.json();

    console.log(`Sending email to: ${Array.isArray(to) ? to.join(", ") : to}`);
    
    // Tikriname, ar yra būtini laukai
    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, or html");
    }

    // Siunčiame el. laišką
    const { data, error } = await resend.emails.send({
      from: from || "AudioDescriptions <noreply@audiodescriptions.com>",
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

    // Grąžiname sėkmės atsakymą
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
    
    // Grąžiname klaidos atsakymą
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

// Paleidžiame serverį
serve(handler);
