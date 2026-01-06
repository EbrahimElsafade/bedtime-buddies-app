import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // 5 emails per hour per IP

// In-memory rate limit store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Get client IP from request headers
const getClientIP = (req: Request): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
};

// Check and update rate limit for an IP
const checkRateLimit = (ip: string): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean up old entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
};

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

// Input validation schema with honeypot field and reCAPTCHA
const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  email: z.string().email("Invalid email format").max(255, "Email too long").trim(),
  phone: z.string().min(1, "Phone is required").max(20, "Phone number too long").trim(),
  message: z.string().min(1, "Message is required").max(1000, "Message too long").trim(),
  website: z.string().max(0, "Bot detected").optional(), // Honeypot field - should be empty
  recaptchaToken: z.string().optional(), // reCAPTCHA v3 token
});

// Verify reCAPTCHA token with Google
const verifyRecaptcha = async (token: string): Promise<{ success: boolean; score: number }> => {
  const secretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");
  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not configured, skipping verification");
    return { success: true, score: 1.0 };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return { 
      success: data.success === true, 
      score: data.score || 0 
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, score: 0 };
  }
};

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
    // Check rate limit
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Too many requests. Please try again later." 
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString(),
            ...corsHeaders 
          },
        }
      );
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = contactSchema.safeParse(rawBody);

    // Check honeypot field (bot detection)
    if (rawBody.website && rawBody.website.length > 0) {
      console.warn(`Honeypot triggered for IP: ${clientIP}`);
      // Return success to not reveal bot detection, but don't send email
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify reCAPTCHA token
    if (rawBody.recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(rawBody.recaptchaToken);
      if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
        console.warn(`reCAPTCHA failed for IP: ${clientIP}, score: ${recaptchaResult.score}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Security verification failed. Please try again." 
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      console.log(`reCAPTCHA passed for IP: ${clientIP}, score: ${recaptchaResult.score}`);
    }

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
