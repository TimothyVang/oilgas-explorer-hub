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

const handler = async (req: Request): Promise<Response> => {
  console.log("docusign-webhook function called");
  console.log("Method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = Deno.env.get("DOCUSIGN_WEBHOOK_SECRET");
    const signature = req.headers.get("x-docusign-signature-1");
    
    if (webhookSecret && signature) {
      // In production, verify the HMAC signature
      // For now, we log it for debugging
      console.log("Webhook signature received:", signature ? "present" : "missing");
    }

    const payload: DocuSignWebhookPayload = await req.json();
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
      console.log("Processing signer:", signer.email);

      // Find user profile by email
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name, nda_signed")
        .eq("email", signer.email.toLowerCase())
        .maybeSingle();

      if (profileError) {
        console.error("Error finding profile:", profileError);
        continue;
      }

      if (!profile) {
        console.log("No profile found for email:", signer.email);
        continue;
      }

      if (profile.nda_signed) {
        console.log("NDA already signed for user:", signer.email);
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
