import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Allowed origins for CORS
const allowedOrigins = [
  'https://dolphoon.com',
  'https://www.dolphoon.com',
  'https://brxbtgzaumryxflkykpp.supabase.co',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
};

// Input validation schema
const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  email: z.string().email("Invalid email format").max(255, "Email too long").trim(),
  phone: z.string().min(1, "Phone is required").max(20, "Phone number too long").trim(),
  message: z.string().min(1, "Message is required").max(1000, "Message too long").trim(),
});

// HTML escape function to prevent XSS in email clients
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = contactSchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid input. Please check your form data." 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, phone, message } = validationResult.data;

    // Escape all user inputs for safe HTML interpolation
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : '';
    const safeMessage = escapeHtml(message);

    console.log("Sending email from:", email, "Name:", name);

    const emailResponse = await resend.emails.send({
      from: "Dolphoon Contact <onboarding@resend.dev>",
      to: ["abdoalaaabdo17@gmail.com"],
      subject: `New Contact Request from ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">
            New Contact Request
          </h1>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 5px;">Name:</h3>
            <p style="margin: 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">${safeName}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 5px;">Email:</h3>
            <p style="margin: 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
              <a href="mailto:${safeEmail}">${safeEmail}</a>
            </p>
          </div>
          
          ${safePhone ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 5px;">Phone:</h3>
            <p style="margin: 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">${safePhone}</p>
          </div>
          ` : ''}
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 5px;">Message:</h3>
            <p style="margin: 0; padding: 10px; background: #f5f5f5; border-radius: 5px; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="color: #888; font-size: 12px;">
            This message was sent from the Dolphoon course contact form.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    // Log detailed error for debugging but return generic message to client
    console.error("Error in send-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send message. Please try again later." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
