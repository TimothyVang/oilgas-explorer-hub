import { supabase } from "@/integrations/supabase/client";

export type ActivityAction = 
  | "sign_in"
  | "sign_out"
  | "profile_update"
  | "document_access"
  | "nda_signed"
  | "nda_sign_initiated";

interface ActivityMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export const logActivity = async (
  action: ActivityAction,
  metadata: ActivityMetadata = {}
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No user found, skipping activity log");
      return;
    }

    const { error } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      action,
      metadata,
    });

    if (error) {
      console.error("Failed to log activity:", error);
    }
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
