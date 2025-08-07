export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      citations: {
        Row: {
          author: string | null
          citation_style: string
          created_at: string
          formatted_citation: string
          id: string
          publication_year: number | null
          raw_citation: string
          source_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          citation_style: string
          created_at?: string
          formatted_citation: string
          id?: string
          publication_year?: number | null
          raw_citation: string
          source_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          citation_style?: string
          created_at?: string
          formatted_citation?: string
          id?: string
          publication_year?: number | null
          raw_citation?: string
          source_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string
          created_at: string
          document_type: string
          id: string
          readability_score: number | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          document_type: string
          id?: string
          readability_score?: number | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: string
          id?: string
          readability_score?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      outlines: {
        Row: {
          academic_level: string
          content: Json
          created_at: string
          id: string
          title: string
          topic: string
          updated_at: string
          user_id: string
          word_count: number
        }
        Insert: {
          academic_level: string
          content: Json
          created_at?: string
          id?: string
          title: string
          topic: string
          updated_at?: string
          user_id: string
          word_count: number
        }
        Update: {
          academic_level?: string
          content?: Json
          created_at?: string
          id?: string
          title?: string
          topic?: string
          updated_at?: string
          user_id?: string
          word_count?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_notes: string | null
          amount: number
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string
          currency: string
          id: string
          order_code: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_proof_url: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          currency?: string
          id?: string
          order_code: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          currency?: string
          id?: string
          order_code?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      plagiarism_checks: {
        Row: {
          check_status: string
          created_at: string
          file_name: string | null
          id: string
          original_text: string
          overall_similarity: number
          sources_found: Json | null
          suggestions: Json | null
          user_id: string
        }
        Insert: {
          check_status?: string
          created_at?: string
          file_name?: string | null
          id?: string
          original_text: string
          overall_similarity?: number
          sources_found?: Json | null
          suggestions?: Json | null
          user_id: string
        }
        Update: {
          check_status?: string
          created_at?: string
          file_name?: string | null
          id?: string
          original_text?: string
          overall_similarity?: number
          sources_found?: Json | null
          suggestions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_collaborators: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string
          invited_by: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          invited_by: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          invited_by?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          position_end: number | null
          position_start: number | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          position_end?: number | null
          position_start?: number | null
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          position_end?: number | null
          position_start?: number | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_versions: {
        Row: {
          change_summary: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          project_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          project_id: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          project_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          content: string
          created_at: string
          description: string | null
          document_type: string
          id: string
          is_public: boolean | null
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          description?: string | null
          document_type?: string
          id?: string
          is_public?: boolean | null
          owner_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          document_type?: string
          id?: string
          is_public?: boolean | null
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"] | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"] | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"] | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          id: string
          key_insights: Json | null
          original_title: string
          summary: string
          summary_length: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          id?: string
          key_insights?: Json | null
          original_title: string
          summary: string
          summary_length: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          id?: string
          key_insights?: Json | null
          original_title?: string
          summary?: string
          summary_length?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string
          feature_type: string
          id: string
          period_end: string
          period_start: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_type: string
          id?: string
          period_end: string
          period_start: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          feature_type?: string
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_feature_limit: {
        Args: {
          p_user_id: string
          p_feature_type: string
          p_subscription_tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Returns: boolean
      }
      generate_order_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_feature_usage: {
        Args: { p_user_id: string; p_feature_type: string }
        Returns: undefined
      }
    }
    Enums: {
      billing_cycle: "monthly" | "yearly"
      payment_method: "bank_transfer" | "momo" | "zalopay" | "vnpay" | "paypal"
      payment_status: "pending" | "completed" | "failed" | "cancelled"
      subscription_tier: "free" | "student" | "premium" | "institutional"
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
      billing_cycle: ["monthly", "yearly"],
      payment_method: ["bank_transfer", "momo", "zalopay", "vnpay", "paypal"],
      payment_status: ["pending", "completed", "failed", "cancelled"],
      subscription_tier: ["free", "student", "premium", "institutional"],
    },
  },
} as const
