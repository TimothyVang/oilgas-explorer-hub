import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-docusign-signature-1",
};

interface DocuSignEnvelope {
  status: string;
  envelopeId: string;
  emailSubject?: string;
  recipients?: {
    signers?: Array<{
      email: string;
      name: string;
      status: string;
      signedDateTime?: string;
    }>;
  };
}

interface DocuSignWebhookPayload {
  event: string;
  apiVersion: string;
  uri: string;
  retryCount: number;
  configurationId: number;
  generatedDateTime: string;
  data: {
    accountId: string;
    userId: string;
    envelopeId: string;
    envelopeSummary: DocuSignEnvelope;
  };
}

// HMAC-SHA256 signature verification
async function verifyHmacSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
    
    // Constant-time comparison to prevent timing attacks
    if (computedSignature.length !== signature.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < computedSignature.length; i++) {
      result |= computedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
  } catch (error) {
    console.error("Error verifying HMAC signature:", error);
    return false;
  }
}

// Validate email format and sanitize
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return email.length <= 254 && emailRegex.test(email);
}

const handler = async (req: Request): Promise<Response> => {
  console.log("docusign-webhook function called");
  console.log("Method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the raw body for signature verification
    const rawBody = await req.text();
    
    // Verify webhook signature if secret is configured
    const webhookSecret = Deno.env.get("DOCUSIGN_WEBHOOK_SECRET");
    const signature = req.headers.get("x-docusign-signature-1");
    
    if (webhookSecret) {
      if (!signature) {
        console.error("Missing webhook signature");
        return new Response(
          JSON.stringify({ error: "Missing signature" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      const isValid = await verifyHmacSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.log("Webhook signature verified successfully");
    } else {
      console.warn("DOCUSIGN_WEBHOOK_SECRET not configured - signature verification skipped");
    }

    const payload: DocuSignWebhookPayload = JSON.parse(rawBody);
    console.log("Received DocuSign webhook event:", payload.event);
    console.log("Envelope ID:", payload.data?.envelopeId);

    // Only process completed envelopes
    const envelope = payload.data?.envelopeSummary;
    if (!envelope || envelope.status !== "completed") {
      console.log("Envelope not completed, skipping. Status:", envelope?.status);
      return new Response(
        JSON.stringify({ message: "Envelope not completed, no action taken" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get signer information
    const signers = envelope.recipients?.signers || [];
    const completedSigners = signers.filter(s => s.status === "completed");
    
    if (completedSigners.length === 0) {
      console.log("No completed signers found");
      return new Response(
        JSON.stringify({ message: "No completed signers" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Process each completed signer
    for (const signer of completedSigners) {
      // Validate email format before processing
      if (!isValidEmail(signer.email)) {
        console.error("Invalid email format from signer:", signer.email);
        continue;
      }
      
      const sanitizedEmail = signer.email.toLowerCase().trim();
      console.log("Processing signer:", sanitizedEmail);

      // Find user profile by email - strict matching to prevent identity spoofing
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name, email, nda_signed")
        .eq("email", sanitizedEmail)
        .maybeSingle();

      if (profileError) {
        console.error("Error finding profile:", profileError);
        continue;
      }

      if (!profile) {
        console.log("No matching profile found for email:", sanitizedEmail);
        continue;
      }

      // Verify email matches exactly (case-insensitive) to prevent identity attacks
      if (profile.email?.toLowerCase() !== sanitizedEmail) {
        console.error("Email mismatch - potential spoofing attempt:", sanitizedEmail);
        continue;
      }

      if (profile.nda_signed) {
        console.log("NDA already signed for user:", sanitizedEmail);
        continue;
      }

      // Update profile with NDA signed status
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          nda_signed: true,
          nda_signed_at: signer.signedDateTime || new Date().toISOString(),
        })
        .eq("user_id", profile.user_id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        continue;
      }

      console.log("NDA status updated for user:", signer.email);

      // Log the activity
      await supabaseAdmin.from("activity_logs").insert({
        user_id: profile.user_id,
        action: "nda_signed",
        metadata: {
          envelope_id: envelope.envelopeId,
          signed_at: signer.signedDateTime,
        },
      });

      // Send confirmation email via send-email function
      try {
        const emailResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              to: signer.email,
              subject: "NDA Signed - Access Granted | BAH Oil and Gas",
              template: "nda-complete",
              data: { name: profile.full_name || signer.name },
            }),
          }
        );

        if (!emailResponse.ok) {
          console.error("Failed to send confirmation email:", await emailResponse.text());
        } else {
          console.log("Confirmation email sent to:", signer.email);
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in docusign-webhook function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
