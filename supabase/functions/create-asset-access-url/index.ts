import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SIGNED_URL_TTL_SECONDS = 5 * 60;

type AccessRequest = {
  document_id?: string;
  documentId?: string;
  version_id?: string;
  versionId?: string;
};

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return handleCorsOptions(req);
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, corsHeaders);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing authorization" }, 401, corsHeaders);
  }

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return json({ error: "Unauthorized" }, 401, corsHeaders);
  }

  let payload: AccessRequest;
  try {
    payload = await req.json();
  } catch (_error) {
    await logAccess(req, supabaseAdmin, userId, null, null, false, "invalid_json");
    return json({ error: "Invalid request body" }, 400, corsHeaders);
  }

  const documentId = payload.document_id ?? payload.documentId;
  const versionId = payload.version_id ?? payload.versionId;

  if (!documentId || !UUID_RE.test(documentId)) {
    await logAccess(req, supabaseAdmin, userId, null, null, false, "invalid_document_id");
    return json({ error: "Invalid document id" }, 400, corsHeaders);
  }

  if (versionId && !UUID_RE.test(versionId)) {
    await logAccess(req, supabaseAdmin, userId, documentId, null, false, "invalid_version_id");
    return json({ error: "Invalid version id" }, 400, corsHeaders);
  }

  const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (roleError) {
    await logAccess(req, supabaseAdmin, userId, documentId, versionId ?? null, false, "role_check_failed");
    return json({ error: "Unable to verify access" }, 500, corsHeaders);
  }

  if (!isAdmin) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("nda_signed")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.nda_signed) {
      await logAccess(req, supabaseAdmin, userId, documentId, versionId ?? null, false, "nda_required");
      return json({ error: "NDA required" }, 403, corsHeaders);
    }

    const { data: access } = await supabaseAdmin
      .from("user_document_access")
      .select("id")
      .eq("user_id", userId)
      .eq("document_id", documentId)
      .maybeSingle();

    if (!access) {
      await logAccess(req, supabaseAdmin, userId, documentId, versionId ?? null, false, "document_not_assigned");
      return json({ error: "Document not assigned" }, 403, corsHeaders);
    }
  }

  const { data: document, error: documentError } = await supabaseAdmin
    .from("investor_documents")
    .select("id, storage_path, original_filename, title")
    .eq("id", documentId)
    .maybeSingle();

  if (documentError || !document) {
    await logAccess(req, supabaseAdmin, userId, documentId, versionId ?? null, false, "document_not_found");
    return json({ error: "Document not found" }, 404, corsHeaders);
  }

  let storagePath = document.storage_path as string | null;
  let downloadName = (document.original_filename as string | null) || (document.title as string | null) || true;

  if (versionId) {
    const { data: version, error: versionError } = await supabaseAdmin
      .from("document_versions")
      .select("id, document_id, storage_path, original_filename")
      .eq("id", versionId)
      .eq("document_id", documentId)
      .maybeSingle();

    if (versionError || !version) {
      await logAccess(req, supabaseAdmin, userId, documentId, versionId, false, "version_not_found");
      return json({ error: "Version not found" }, 404, corsHeaders);
    }

    storagePath = version.storage_path as string | null;
    downloadName = (version.original_filename as string | null) || downloadName;
  }

  if (!storagePath) {
    await logAccess(req, supabaseAdmin, userId, documentId, versionId ?? null, false, "missing_storage_path");
    return json({ error: "Asset is missing private storage path" }, 409, corsHeaders);
  }

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from("investor-documents")
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS, { download: downloadName });

  if (signError || !signed?.signedUrl) {
    await logAccess(req, supabaseAdmin, userId, documentId, versionId ?? null, false, "signed_url_failed");
    return json({ error: "Unable to create signed URL" }, 500, corsHeaders);
  }

  await logAccess(req, supabaseAdmin, userId, documentId, versionId ?? null, true, null);

  return json({
    signed_url: signed.signedUrl,
    expires_in: SIGNED_URL_TTL_SECONDS,
    expires_at: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString(),
  }, 200, corsHeaders);
});

function json(body: Record<string, unknown>, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logAccess(
  req: Request,
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  documentId: string | null,
  versionId: string | null,
  granted: boolean,
  denialReason: string | null,
) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent");

  const { error } = await supabaseAdmin.from("document_access_logs").insert({
    user_id: userId,
    document_id: documentId,
    document_version_id: versionId,
    granted,
    denial_reason: denialReason,
    ip_address: forwardedFor,
    user_agent: userAgent,
  });

  if (error) {
    console.error("Failed to log document access:", error);
  }
}
