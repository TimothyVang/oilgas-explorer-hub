export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      investor_documents: {
        Row: {
          asset_type: string
          category: string
          created_at: string
          current_version: number
          description: string | null
          download_file_size: number | null
          download_filename: string | null
          download_mime_type: string | null
          download_storage_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_featured: boolean
          is_public_teaser: boolean
          mime_type: string | null
          original_filename: string | null
          sort_order: number
          storage_path: string | null
          thumbnail_path: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          asset_type?: string
          category?: string
          created_at?: string
          current_version?: number
          description?: string | null
          download_file_size?: number | null
          download_filename?: string | null
          download_mime_type?: string | null
          download_storage_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean
          is_public_teaser?: boolean
          mime_type?: string | null
          original_filename?: string | null
          sort_order?: number
          storage_path?: string | null
          thumbnail_path?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          asset_type?: string
          category?: string
          created_at?: string
          current_version?: number
          description?: string | null
          download_file_size?: number | null
          download_filename?: string | null
          download_mime_type?: string | null
          download_storage_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean
          is_public_teaser?: boolean
          mime_type?: string | null
          original_filename?: string | null
          sort_order?: number
          storage_path?: string | null
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      document_access_logs: {
        Row: {
          action: string
          created_at: string
          denial_reason: string | null
          document_id: string | null
          document_version_id: string | null
          granted: boolean
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string
          created_at?: string
          denial_reason?: string | null
          document_id?: string | null
          document_version_id?: string | null
          granted?: boolean
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          denial_reason?: string | null
          document_id?: string | null
          document_version_id?: string | null
          granted?: boolean
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "investor_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_notes: string | null
          created_at: string
          document_id: string
          download_file_size: number | null
          download_filename: string | null
          download_mime_type: string | null
          download_storage_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          mime_type: string | null
          original_filename: string | null
          storage_path: string | null
          thumbnail_path: string | null
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          change_notes?: string | null
          created_at?: string
          document_id: string
          download_file_size?: number | null
          download_filename?: string | null
          download_mime_type?: string | null
          download_storage_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          storage_path?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          version_number?: number
        }
        Update: {
          change_notes?: string | null
          created_at?: string
          document_id?: string
          download_file_size?: number | null
          download_filename?: string | null
          download_mime_type?: string | null
          download_storage_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          storage_path?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "investor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          nda_signed: boolean
          nda_signed_at: string | null
          phone: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          nda_signed?: boolean
          nda_signed_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          nda_signed?: boolean
          nda_signed_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_document_access: {
        Row: {
          assigned_at: string
          assigned_by: string
          created_at: string
          document_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          created_at?: string
          document_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          created_at?: string
          document_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_document_access_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "investor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      resolve_login_identifier: {
        Args: { _identifier: string }
        Returns: string | null
      }
      sync_user_emails: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
