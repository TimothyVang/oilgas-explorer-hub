import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: "welcome" | "nda-complete" | "custom";
  data?: {
    name?: string;
    customHtml?: string;
  };
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

const handler = async (req: Request): Promise<Response> => {
  console.log("send-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data }: EmailRequest = await req.json();
    
    console.log(`Sending ${template} email to: ${to}`);

    let html: string;
    const name = data?.name || "Valued Client";

    switch (template) {
      case "welcome":
        html = getWelcomeTemplate(name);
        break;
      case "nda-complete":
        html = getNdaCompleteTemplate(name);
        break;
      case "custom":
        html = data?.customHtml || "<p>No content provided</p>";
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
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
