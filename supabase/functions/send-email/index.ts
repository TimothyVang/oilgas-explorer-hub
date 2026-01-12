import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Valid email templates - only allow predefined templates
const VALID_TEMPLATES = ["welcome", "nda-complete", "nda-reset"] as const;
type ValidTemplate = typeof VALID_TEMPLATES[number];

interface EmailRequest {
  to: string;
  subject: string;
  template: ValidTemplate;
  data?: {
    name?: string;
  };
}

// Validate email format
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return email.length <= 254 && emailRegex.test(email);
}

const getWelcomeTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #1a365d; margin: 0; font-size: 28px;">BAH Oil and Gas</h1>
      <p style="color: #64748b; margin-top: 8px;">Welcome to our Client Portal</p>
    </div>
    
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">Welcome, ${name}!</h2>
      <p style="color: #475569; margin: 0; line-height: 1.6;">
        Thank you for creating an account with BAH Oil and Gas. You now have access to our exclusive client portal where you can:
      </p>
      <ul style="color: #475569; margin: 16px 0; padding-left: 20px; line-height: 1.8;">
        <li>View your profile and account settings</li>
        <li>Access investor documents (after NDA signing)</li>
        <li>Stay updated on your investments</li>
      </ul>
    </div>
    
    <div style="text-align: center;">
      <a href="${Deno.env.get("SITE_URL") || "https://your-app.lovable.app"}/dashboard" 
         style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Go to Dashboard
      </a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
        © ${new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

const getNdaCompleteTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #1a365d; margin: 0; font-size: 28px;">BAH Oil and Gas</h1>
      <p style="color: #64748b; margin-top: 8px;">NDA Confirmation</p>
    </div>
    
    <div style="background-color: #ecfdf5; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #a7f3d0;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <div style="width: 40px; height: 40px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
          <span style="color: white; font-size: 20px;">✓</span>
        </div>
        <h2 style="color: #065f46; margin: 0; font-size: 20px;">NDA Signed Successfully</h2>
      </div>
      <p style="color: #047857; margin: 0; line-height: 1.6;">
        Dear ${name}, your Non-Disclosure Agreement has been received and processed. You now have full access to our investor documents.
      </p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h3 style="color: #1e293b; margin: 0 0 12px 0;">What's Next?</h3>
      <p style="color: #475569; margin: 0; line-height: 1.6;">
        You can now access all confidential investor documents through your portal. These materials include financial reports, project updates, and investment opportunities.
      </p>
    </div>
    
    <div style="text-align: center;">
      <a href="${Deno.env.get("SITE_URL") || "https://your-app.lovable.app"}/investor-documents" 
         style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        View Investor Documents
      </a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
        © ${new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">
        This email contains confidential information. Please do not forward.
      </p>
    </div>
  </div>
</body>
</html>
`;

const getNdaResetTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #1a365d; margin: 0; font-size: 28px;">BAH Oil and Gas</h1>
      <p style="color: #64748b; margin-top: 8px;">NDA Status Update</p>
    </div>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #fcd34d;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <div style="width: 40px; height: 40px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
          <span style="color: white; font-size: 20px;">!</span>
        </div>
        <h2 style="color: #92400e; margin: 0; font-size: 20px;">NDA Reset Required</h2>
      </div>
      <p style="color: #a16207; margin: 0; line-height: 1.6;">
        Dear ${name}, your Non-Disclosure Agreement status has been reset by an administrator. To regain access to investor documents, you will need to sign a new NDA.
      </p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h3 style="color: #1e293b; margin: 0 0 12px 0;">What's Next?</h3>
      <p style="color: #475569; margin: 0; line-height: 1.6;">
        Please visit the Investor Documents page in your portal to sign a new NDA. Once signed, your access to confidential documents will be restored.
      </p>
    </div>
    
    <div style="text-align: center;">
      <a href="${Deno.env.get("SITE_URL") || "https://your-app.lovable.app"}/investor-documents" 
         style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Sign New NDA
      </a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
        © ${new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">
        If you have questions, please contact your account representative.
      </p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  
  console.log("send-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsOptions(req);
  }

  try {
    // Verify authentication - require a valid JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create client with user's token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the token is valid
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    const { to, subject, template, data }: EmailRequest = await req.json();
    
    // Validate template is one of the allowed templates
    if (!VALID_TEMPLATES.includes(template as ValidTemplate)) {
      console.error("Invalid template:", template);
      return new Response(
        JSON.stringify({ error: "Invalid template" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!isValidEmail(to)) {
      console.error("Invalid email format:", to);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate subject length
    if (!subject || subject.length > 200) {
      console.error("Invalid subject");
      return new Response(
        JSON.stringify({ error: "Invalid subject" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Sending ${template} email to: ${to}`);

    let html: string;
    // Sanitize name to prevent XSS - only allow alphanumeric, spaces, and basic punctuation
    const rawName = data?.name || "Valued Client";
    const name = rawName.replace(/[<>\"'&]/g, '').substring(0, 100);

    switch (template) {
      case "welcome":
        html = getWelcomeTemplate(name);
        break;
      case "nda-complete":
        html = getNdaCompleteTemplate(name);
        break;
      case "nda-reset":
        html = getNdaResetTemplate(name);
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    const emailResponse = await resend.emails.send({
      from: "BAH Oil and Gas <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-email function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(req) },
      }
    );
  }
};

serve(handler);
