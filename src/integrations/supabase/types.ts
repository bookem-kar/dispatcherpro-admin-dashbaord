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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          company_id: string | null
          id: string
          meta: Json | null
          target_id: string | null
          target_type: string | null
          timestamp: string
          type: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          id?: string
          meta?: Json | null
          target_id?: string | null
          target_type?: string | null
          timestamp?: string
          type: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          id?: string
          meta?: Json | null
          target_id?: string | null
          target_type?: string | null
          timestamp?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "platform_users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_credentials: {
        Row: {
          api_key: string | null
          auth_token: string | null
          base_url: string | null
          created_at: string
          credential_name: string
          credential_type: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          auth_token?: string | null
          base_url?: string | null
          created_at?: string
          credential_name: string
          credential_type: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          auth_token?: string | null
          base_url?: string | null
          created_at?: string
          credential_name?: string
          credential_type?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          active_user_count: number | null
          address: string
          admin_email: string
          admin_first_name: string
          admin_last_name: string
          admin_phone: string
          admin_user_id: string | null
          bubble_company_id: string | null
          central_dispatch_acct: string | null
          company_uid: string
          created_at: string
          email: string
          fax_number: string | null
          id: string
          last_activity_at: string | null
          max_seats: number | null
          mc_number: string
          name: string
          phone_number: string
          phone_toll_free: string | null
          plan_tier: string
          status: string
          super_dispatch_acct: string | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
          website: string
        }
        Insert: {
          active_user_count?: number | null
          address: string
          admin_email: string
          admin_first_name: string
          admin_last_name: string
          admin_phone: string
          admin_user_id?: string | null
          bubble_company_id?: string | null
          central_dispatch_acct?: string | null
          company_uid: string
          created_at?: string
          email: string
          fax_number?: string | null
          id?: string
          last_activity_at?: string | null
          max_seats?: number | null
          mc_number: string
          name: string
          phone_number: string
          phone_toll_free?: string | null
          plan_tier?: string
          status?: string
          super_dispatch_acct?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          website: string
        }
        Update: {
          active_user_count?: number | null
          address?: string
          admin_email?: string
          admin_first_name?: string
          admin_last_name?: string
          admin_phone?: string
          admin_user_id?: string | null
          bubble_company_id?: string | null
          central_dispatch_acct?: string | null
          company_uid?: string
          created_at?: string
          email?: string
          fax_number?: string | null
          id?: string
          last_activity_at?: string | null
          max_seats?: number | null
          mc_number?: string
          name?: string
          phone_number?: string
          phone_toll_free?: string | null
          plan_tier?: string
          status?: string
          super_dispatch_acct?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      platform_users: {
        Row: {
          company_id: string | null
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          email: string
          external_user_uid: string | null
          first_name: string | null
          id: string
          invite_token: string | null
          is_active: boolean
          is_suspended: boolean
          last_activity_at: string | null
          last_login_at: string | null
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          email: string
          external_user_uid?: string | null
          first_name?: string | null
          id?: string
          invite_token?: string | null
          is_active?: boolean
          is_suspended?: boolean
          last_activity_at?: string | null
          last_login_at?: string | null
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          email?: string
          external_user_uid?: string | null
          first_name?: string | null
          id?: string
          invite_token?: string | null
          is_active?: boolean
          is_suspended?: boolean
          last_activity_at?: string | null
          last_login_at?: string | null
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_logs: {
        Row: {
          company_id: string
          completed_at: string | null
          error_message: string | null
          executed_at: string
          id: string
          n8n_execution_id: string | null
          request_payload: Json | null
          response_data: Json | null
          status: string
          user_id: string
          workflow_type: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string
          id?: string
          n8n_execution_id?: string | null
          request_payload?: Json | null
          response_data?: Json | null
          status: string
          user_id: string
          workflow_type?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string
          id?: string
          n8n_execution_id?: string | null
          request_payload?: Json | null
          response_data?: Json | null
          status?: string
          user_id?: string
          workflow_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
