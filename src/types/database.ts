/* eslint-disable */
// Auto-generated from Supabase schema (project: cuesxuxkvxnpbanfgken)
// DO NOT EDIT MANUALLY — regenerate via MCP: mcp__claude_ai_Supabase__generate_typescript_types

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          // audit_log is append-only; UPDATE is blocked by RLS at DB level.
          action?: string
          actor_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          // created_at intentionally omitted — immutable field
        }
        Relationships: []
      }
      candidate_skills: {
        Row: {
          candidate_id: string
          skill_id: string
        }
        Insert: {
          candidate_id: string
          skill_id: string
        }
        Update: {
          candidate_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_skills_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          candidate_id: string
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_size_bytes: number | null
          id: string
          original_filename: string | null
          storage_path: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_size_bytes?: number | null
          id?: string
          original_filename?: string | null
          storage_path: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_size_bytes?: number | null
          id?: string
          original_filename?: string | null
          storage_path?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          desired_availability: string | null
          desired_location_state: string | null
          id: string
          location: string | null
          radius_km: number | null
          salary_max: number | null
          salary_min: number | null
          status: Database["public"]["Enums"]["job_listing_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          desired_availability?: string | null
          desired_location_state?: string | null
          id?: string
          location?: string | null
          radius_km?: number | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_listing_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          desired_availability?: string | null
          desired_location_state?: string | null
          id?: string
          location?: string | null
          radius_km?: number | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_listing_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          job_listing_id: string
          skill_id: string
        }
        Insert: {
          job_listing_id: string
          skill_id: string
        }
        Update: {
          job_listing_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      jwt_revocations: {
        Row: {
          revoked_at: string
          user_id: string
        }
        Insert: {
          revoked_at?: string
          user_id: string
        }
        Update: {
          revoked_at?: string
          // user_id is PRIMARY KEY — intentionally omitted from Update type
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          id: string
          ip_address: string | null
          success: boolean
          user_id: string | null
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_id?: string | null
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          job_listing_id: string
          match_score: number | null
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          job_listing_id: string
          match_score?: number | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          job_listing_id?: string
          match_score?: number | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_status: string | null
          available_from: string | null
          bio: string | null
          company_description: string | null
          company_name: string | null
          company_size: string | null
          created_at: string
          desired_location_state: string | null
          dsgvo_consent: boolean | null
          dsgvo_consent_at: string | null
          email: string | null
          email_interest_alerts: boolean | null
          email_match_alerts: boolean | null
          full_name: string | null
          id: string
          industry: string | null
          is_active: boolean
          is_verified: boolean
          job_field: string | null
          location: string | null
          nutzungsvereinbarung_akzeptiert_at: string | null
          onboarding_step: number | null
          phone: string | null
          profile_status: 'entwurf' | 'ausstehend_verifizierung' | 'aktiv' | 'abgelehnt' | 'gesperrt' | null
          radius_km: number | null
          role: Database["public"]["Enums"]["user_role"]
          salary_currency: string | null
          salary_expectation: number | null
          soft_skills: string | null
          updated_at: string
          website: string | null
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          available_from?: string | null
          bio?: string | null
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          desired_location_state?: string | null
          dsgvo_consent?: boolean | null
          dsgvo_consent_at?: string | null
          email?: string | null
          email_interest_alerts?: boolean | null
          email_match_alerts?: boolean | null
          full_name?: string | null
          id: string
          industry?: string | null
          is_active?: boolean
          is_verified?: boolean
          job_field?: string | null
          location?: string | null
          nutzungsvereinbarung_akzeptiert_at?: string | null
          onboarding_step?: number | null
          phone?: string | null
          profile_status?: string | null
          radius_km?: number | null
          role: Database["public"]["Enums"]["user_role"]
          salary_currency?: string | null
          salary_expectation?: number | null
          soft_skills?: string | null
          updated_at?: string
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          available_from?: string | null
          bio?: string | null
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          desired_location_state?: string | null
          dsgvo_consent?: boolean | null
          dsgvo_consent_at?: string | null
          email?: string | null
          email_interest_alerts?: boolean | null
          email_match_alerts?: boolean | null
          full_name?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          is_verified?: boolean
          job_field?: string | null
          location?: string | null
          nutzungsvereinbarung_akzeptiert_at?: string | null
          onboarding_step?: number | null
          phone?: string | null
          profile_status?: string | null
          radius_km?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          salary_currency?: string | null
          salary_expectation?: number | null
          soft_skills?: string | null
          updated_at?: string
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          event_type: string
          id: string
          payload: Json | null
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          payload?: Json | null
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_company_id: { Args: never; Returns: string }
      company_update_profile: {
        Args: {
          p_company_name: string
          p_industry: string
          p_location: string
          p_description: string
          p_contact_name: string
          p_website: string
        }
        Returns: Json
      }
      candidate_belongs_to_user: {
        Args: { p_candidate_id: string }
        Returns: boolean
      }
      candidate_uploaded_by_user: {
        Args: { p_candidate_id: string }
        Returns: boolean
      }
      check_login_lockout: { Args: { p_email: string }; Returns: boolean }
      check_rate_limit: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      company_has_matching_with_candidate: {
        Args: { p_candidate_id: string }
        Returns: boolean
      }
      company_has_revealed_match: {
        Args: { candidate_profile_id: string }
        Returns: boolean
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      generate_invoice_number: { Args: never; Returns: string }
      get_top_3_candidates_for_job: {
        Args: { p_job_id: string }
        Returns: Database["public"]["CompositeTypes"]["candidate_card"][]
        SetofOptions: {
          from: "*"
          to: "candidate_card"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_company_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_jwt_revoked: { Args: never; Returns: boolean }
      is_recruiter_or_admin: { Args: never; Returns: boolean }
      record_login_attempt: {
        Args: { p_email: string; p_ip_address?: string; p_success: boolean }
        Returns: boolean
      }
      reveal_candidate_after_token: {
        Args: { p_match_id: string }
        Returns: {
          candidate_id: string
          cv_file_url: string
          encrypted_address: string
          encrypted_email: string
          encrypted_first_name: string
          encrypted_last_name: string
          encrypted_phone: string
        }[]
      }
    }
    Enums: {
      document_type: "lebenslauf" | "zeugnis" | "zertifikat" | "sonstiges"
      job_listing_status: "aktiv" | "pausiert" | "geschlossen"
      match_status:
        | "ausstehend"
        | "angesehen"
        | "interessiert"
        | "abgelehnt"
        | "kontakt_hergestellt"
        | "eingestellt"
        | "nicht_eingestellt"
        | "pausiert"
        | "kandidat_nicht_verfügbar"
      skill_category:
        | "elektrotechnik"
        | "tga"
        | "shk"
        | "mechatronik"
        | "it"
        | "sonstiges"
      subscription_status: "aktiv" | "ablaufend" | "abgelaufen" | "eingefroren"
      subscription_tier: "basis" | "professional" | "enterprise"
      user_role: "kandidat" | "unternehmen" | "recruiter" | "admin"
    }
    CompositeTypes: {
      candidate_card: {
        match_id: string | null
        candidate_id: string | null
        anonymous_id: string | null
        score: number | null
        hire_probability: number | null
        skill_score: number | null
        experience_score: number | null
        salary_score: number | null
        location_score: number | null
        availability_score: number | null
        switch_willingness_score: number | null
        professional_title: string | null
        location_city: string | null
        experience_years: number | null
        education_field: string | null
        education_match: string | null
        salary_expectation: number | null
        salary_currency: string | null
        reasons: string[] | null
        neutral_assessment: string | null
        recommendation: string | null
        skills: Json | null
        visible_until: string | null
      }
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
      document_type: ["lebenslauf", "zeugnis", "zertifikat", "sonstiges"],
      job_listing_status: ["aktiv", "pausiert", "geschlossen"],
      match_status: [
        "ausstehend",
        "angesehen",
        "interessiert",
        "abgelehnt",
        "kontakt_hergestellt",
        "eingestellt",
        "nicht_eingestellt",
        "pausiert",
        "kandidat_nicht_verfügbar",
      ],
      skill_category: [
        "elektrotechnik",
        "tga",
        "shk",
        "mechatronik",
        "it",
        "sonstiges",
      ],
      subscription_status: ["aktiv", "ablaufend", "abgelaufen", "eingefroren"],
      subscription_tier: ["basis", "professional", "enterprise"],
      user_role: ["kandidat", "unternehmen", "recruiter", "admin"],
    },
  },
} as const
