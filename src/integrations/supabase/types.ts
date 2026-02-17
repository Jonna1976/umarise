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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string
          device_user_id: string
          duration_ms: number | null
          endpoint: string
          error_message: string | null
          id: string
          metadata: Json | null
          method: string
          rate_limit_remaining: number | null
          rate_limited: boolean | null
          request_id: string
          service: string
          status_code: number | null
        }
        Insert: {
          created_at?: string
          device_user_id: string
          duration_ms?: number | null
          endpoint: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          method?: string
          rate_limit_remaining?: number | null
          rate_limited?: boolean | null
          request_id: string
          service: string
          status_code?: number | null
        }
        Update: {
          created_at?: string
          device_user_id?: string
          duration_ms?: number | null
          endpoint?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          method?: string
          rate_limit_remaining?: number | null
          rate_limited?: boolean | null
          request_id?: string
          service?: string
          status_code?: number | null
        }
        Relationships: []
      }
      core_ddl_audit: {
        Row: {
          command_tag: string | null
          event_type: string
          executed_at: string | null
          executed_by: string | null
          id: string
          object_name: string | null
          object_type: string | null
          raw_command: string | null
        }
        Insert: {
          command_tag?: string | null
          event_type: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          object_name?: string | null
          object_type?: string | null
          raw_command?: string | null
        }
        Update: {
          command_tag?: string | null
          event_type?: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          object_name?: string | null
          object_type?: string | null
          raw_command?: string | null
        }
        Relationships: []
      }
      core_ots_proofs: {
        Row: {
          anchored_at: string | null
          bitcoin_block_height: number | null
          created_at: string
          id: string
          origin_id: string
          ots_proof: string
          status: string
          upgraded_at: string | null
        }
        Insert: {
          anchored_at?: string | null
          bitcoin_block_height?: number | null
          created_at?: string
          id?: string
          origin_id: string
          ots_proof: string
          status?: string
          upgraded_at?: string | null
        }
        Update: {
          anchored_at?: string | null
          bitcoin_block_height?: number | null
          created_at?: string
          id?: string
          origin_id?: string
          ots_proof?: string
          status?: string
          upgraded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "core_ots_proofs_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: true
            referencedRelation: "origin_attestations"
            referencedColumns: ["origin_id"]
          },
        ]
      }
      core_rate_limits: {
        Row: {
          endpoint: string
          id: string
          rate_key: string
          request_count: number
          window_start: string
        }
        Insert: {
          endpoint: string
          id?: string
          rate_key: string
          request_count?: number
          window_start: string
        }
        Update: {
          endpoint?: string
          id?: string
          rate_key?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      core_request_log: {
        Row: {
          api_key_prefix: string | null
          created_at: string
          endpoint: string
          error_code: string | null
          id: string
          ip_hash: string | null
          method: string
          response_time_ms: number
          status_code: number
        }
        Insert: {
          api_key_prefix?: string | null
          created_at?: string
          endpoint: string
          error_code?: string | null
          id?: string
          ip_hash?: string | null
          method: string
          response_time_ms: number
          status_code: number
        }
        Update: {
          api_key_prefix?: string | null
          created_at?: string
          endpoint?: string
          error_code?: string | null
          id?: string
          ip_hash?: string | null
          method?: string
          response_time_ms?: number
          status_code?: number
        }
        Relationships: []
      }
      health_checks: {
        Row: {
          alert_sent: boolean
          checked_at: string
          consecutive_failures: number
          error_message: string | null
          id: string
          response_time_ms: number | null
          status: string
          status_code: number | null
        }
        Insert: {
          alert_sent?: boolean
          checked_at?: string
          consecutive_failures?: number
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status?: string
          status_code?: number | null
        }
        Update: {
          alert_sent?: boolean
          checked_at?: string
          consecutive_failures?: number
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status?: string
          status_code?: number | null
        }
        Relationships: []
      }
      hetzner_trash_index: {
        Row: {
          created_at: string
          device_user_id: string
          id: string
          page_id: string
          trashed_at: string
        }
        Insert: {
          created_at?: string
          device_user_id: string
          id?: string
          page_id: string
          trashed_at?: string
        }
        Update: {
          created_at?: string
          device_user_id?: string
          id?: string
          page_id?: string
          trashed_at?: string
        }
        Relationships: []
      }
      origin_attestations: {
        Row: {
          api_key_prefix: string | null
          captured_at: string
          created_at: string
          hash: string
          hash_algo: string
          origin_id: string
        }
        Insert: {
          api_key_prefix?: string | null
          captured_at?: string
          created_at?: string
          hash: string
          hash_algo?: string
          origin_id?: string
        }
        Update: {
          api_key_prefix?: string | null
          captured_at?: string
          created_at?: string
          hash?: string
          hash_algo?: string
          origin_id?: string
        }
        Relationships: []
      }
      page_association_revocations: {
        Row: {
          created_at: string
          device_user_id: string
          id: string
          page_id: string
          revoked_at: string
        }
        Insert: {
          created_at?: string
          device_user_id: string
          id?: string
          page_id: string
          revoked_at?: string
        }
        Update: {
          created_at?: string
          device_user_id?: string
          id?: string
          page_id?: string
          revoked_at?: string
        }
        Relationships: []
      }
      page_origin_hashes: {
        Row: {
          created_at: string | null
          device_user_id: string
          id: string
          image_url: string
          origin_hash_algo: string | null
          origin_hash_sha256: string
          page_id: string
        }
        Insert: {
          created_at?: string | null
          device_user_id: string
          id?: string
          image_url: string
          origin_hash_algo?: string | null
          origin_hash_sha256: string
          page_id: string
        }
        Update: {
          created_at?: string | null
          device_user_id?: string
          id?: string
          image_url?: string
          origin_hash_algo?: string | null
          origin_hash_sha256?: string
          page_id?: string
        }
        Relationships: []
      }
      page_trash: {
        Row: {
          backend_provider: string
          created_at: string
          device_user_id: string
          id: string
          page_id: string
          restored_at: string | null
          trashed_at: string
          updated_at: string
        }
        Insert: {
          backend_provider?: string
          created_at?: string
          device_user_id: string
          id?: string
          page_id: string
          restored_at?: string | null
          trashed_at?: string
          updated_at?: string
        }
        Update: {
          backend_provider?: string
          created_at?: string
          device_user_id?: string
          id?: string
          page_id?: string
          restored_at?: string | null
          trashed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          association_revoked_at: string | null
          capsule_id: string | null
          capture_batch_id: string | null
          confidence_score: number | null
          created_at: string
          device_fingerprint_hash: string | null
          device_user_id: string
          embedding: Json | null
          embedding_vector: Json | null
          future_you_cue: string | null
          future_you_cues: string[] | null
          future_you_cues_source: Json | null
          highlights: string[] | null
          id: string
          image_url: string
          is_trashed: boolean
          keywords: string[] | null
          named_entities: Json | null
          ocr_text: string | null
          ocr_tokens: Json | null
          one_line_hint: string | null
          origin_hash_algo: string | null
          origin_hash_sha256: string | null
          origin_id: string | null
          page_order: number | null
          primary_keyword: string | null
          project_id: string | null
          session_id: string | null
          source_container_id: string | null
          sources: string[] | null
          summary: string | null
          thumbnail_uri: string | null
          tone: string | null
          topic_labels: string[] | null
          trashed_at: string | null
          updated_at: string
          user_id: string | null
          user_note: string | null
          writer_user_id: string
          written_at: string | null
        }
        Insert: {
          association_revoked_at?: string | null
          capsule_id?: string | null
          capture_batch_id?: string | null
          confidence_score?: number | null
          created_at?: string
          device_fingerprint_hash?: string | null
          device_user_id: string
          embedding?: Json | null
          embedding_vector?: Json | null
          future_you_cue?: string | null
          future_you_cues?: string[] | null
          future_you_cues_source?: Json | null
          highlights?: string[] | null
          id?: string
          image_url: string
          is_trashed?: boolean
          keywords?: string[] | null
          named_entities?: Json | null
          ocr_text?: string | null
          ocr_tokens?: Json | null
          one_line_hint?: string | null
          origin_hash_algo?: string | null
          origin_hash_sha256?: string | null
          origin_id?: string | null
          page_order?: number | null
          primary_keyword?: string | null
          project_id?: string | null
          session_id?: string | null
          source_container_id?: string | null
          sources?: string[] | null
          summary?: string | null
          thumbnail_uri?: string | null
          tone?: string | null
          topic_labels?: string[] | null
          trashed_at?: string | null
          updated_at?: string
          user_id?: string | null
          user_note?: string | null
          writer_user_id?: string
          written_at?: string | null
        }
        Update: {
          association_revoked_at?: string | null
          capsule_id?: string | null
          capture_batch_id?: string | null
          confidence_score?: number | null
          created_at?: string
          device_fingerprint_hash?: string | null
          device_user_id?: string
          embedding?: Json | null
          embedding_vector?: Json | null
          future_you_cue?: string | null
          future_you_cues?: string[] | null
          future_you_cues_source?: Json | null
          highlights?: string[] | null
          id?: string
          image_url?: string
          is_trashed?: boolean
          keywords?: string[] | null
          named_entities?: Json | null
          ocr_text?: string | null
          ocr_tokens?: Json | null
          one_line_hint?: string | null
          origin_hash_algo?: string | null
          origin_hash_sha256?: string | null
          origin_id?: string | null
          page_order?: number | null
          primary_keyword?: string | null
          project_id?: string | null
          session_id?: string | null
          source_container_id?: string | null
          sources?: string[] | null
          summary?: string | null
          thumbnail_uri?: string | null
          tone?: string | null
          topic_labels?: string[] | null
          trashed_at?: string | null
          updated_at?: string
          user_id?: string | null
          user_note?: string | null
          writer_user_id?: string
          written_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_api_keys: {
        Row: {
          id: string
          issued_at: string
          issued_by: string | null
          key_hash: string
          key_prefix: string
          partner_name: string
          rate_limit_tier: string
          revoked_at: string | null
        }
        Insert: {
          id?: string
          issued_at?: string
          issued_by?: string | null
          key_hash: string
          key_prefix: string
          partner_name: string
          rate_limit_tier?: string
          revoked_at?: string | null
        }
        Update: {
          id?: string
          issued_at?: string
          issued_by?: string | null
          key_hash?: string
          key_prefix?: string
          partner_name?: string
          rate_limit_tier?: string
          revoked_at?: string | null
        }
        Relationships: []
      }
      personality_snapshots: {
        Row: {
          core_identity: string
          created_at: string
          device_user_id: string
          drivers: Json
          growth_edge: string
          id: string
          page_count: number
          profile_type: string
          superpower: string
          tagline: string
          tension_field: Json
        }
        Insert: {
          core_identity: string
          created_at?: string
          device_user_id: string
          drivers?: Json
          growth_edge: string
          id?: string
          page_count?: number
          profile_type?: string
          superpower: string
          tagline: string
          tension_field: Json
        }
        Update: {
          core_identity?: string
          created_at?: string
          device_user_id?: string
          drivers?: Json
          growth_edge?: string
          id?: string
          page_count?: number
          profile_type?: string
          superpower?: string
          tagline?: string
          tension_field?: Json
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          device_user_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          device_user_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          device_user_id?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      search_telemetry: {
        Row: {
          created_at: string
          device_user_id: string
          found_it_confirmed: boolean | null
          id: string
          query: string
          result_count: number
          selected_page_id: string | null
          selected_rank: number | null
          time_filter_used: string | null
          time_to_select_ms: number | null
          top_5_page_ids: string[] | null
        }
        Insert: {
          created_at?: string
          device_user_id: string
          found_it_confirmed?: boolean | null
          id?: string
          query: string
          result_count?: number
          selected_page_id?: string | null
          selected_rank?: number | null
          time_filter_used?: string | null
          time_to_select_ms?: number | null
          top_5_page_ids?: string[] | null
        }
        Update: {
          created_at?: string
          device_user_id?: string
          found_it_confirmed?: boolean | null
          id?: string
          query?: string
          result_count?: number
          selected_page_id?: string | null
          selected_rank?: number | null
          time_filter_used?: string | null
          time_to_select_ms?: number | null
          top_5_page_ids?: string[] | null
        }
        Relationships: []
      }
      witnesses: {
        Row: {
          confirmation_hash: string | null
          created_at: string | null
          id: string
          ots_proof: string | null
          ots_status: string | null
          page_id: string
          token_expires_at: string | null
          verification_token: string | null
          witness_confirmed_at: string | null
          witness_email: string
        }
        Insert: {
          confirmation_hash?: string | null
          created_at?: string | null
          id?: string
          ots_proof?: string | null
          ots_status?: string | null
          page_id: string
          token_expires_at?: string | null
          verification_token?: string | null
          witness_confirmed_at?: string | null
          witness_email?: string
        }
        Update: {
          confirmation_hash?: string | null
          created_at?: string | null
          id?: string
          ots_proof?: string | null
          ots_status?: string | null
          page_id?: string
          token_expires_at?: string | null
          verification_token?: string | null
          witness_confirmed_at?: string | null
          witness_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "witnesses_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      cleanup_old_health_checks: { Args: never; Returns: undefined }
      core_check_rate_limit: {
        Args: { p_endpoint: string; p_limit: number; p_rate_key: string }
        Returns: Json
      }
      core_metrics_24h: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
