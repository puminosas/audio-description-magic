export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          allowguestgeneration: boolean
          basicgenerationslimit: number
          chatgptmodel: string | null
          chatgptprompt: string | null
          chatgpttemperature: number | null
          created_at: string | null
          enablefeedback: boolean
          enablenewuserregistration: boolean
          freegenerationslimit: number
          hidepricingfeatures: boolean
          id: number
          premiumgenerationslimit: number
          requireemailverification: boolean
          storageretentiondays: number
          unlimitedgenerationsforall: boolean
          updated_at: string | null
        }
        Insert: {
          allowguestgeneration?: boolean
          basicgenerationslimit?: number
          chatgptmodel?: string | null
          chatgptprompt?: string | null
          chatgpttemperature?: number | null
          created_at?: string | null
          enablefeedback?: boolean
          enablenewuserregistration?: boolean
          freegenerationslimit?: number
          hidepricingfeatures?: boolean
          id: number
          premiumgenerationslimit?: number
          requireemailverification?: boolean
          storageretentiondays?: number
          unlimitedgenerationsforall?: boolean
          updated_at?: string | null
        }
        Update: {
          allowguestgeneration?: boolean
          basicgenerationslimit?: number
          chatgptmodel?: string | null
          chatgptprompt?: string | null
          chatgpttemperature?: number | null
          created_at?: string | null
          enablefeedback?: boolean
          enablenewuserregistration?: boolean
          freegenerationslimit?: number
          hidepricingfeatures?: boolean
          id?: number
          premiumgenerationslimit?: number
          requireemailverification?: boolean
          storageretentiondays?: number
          unlimitedgenerationsforall?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      audio_files: {
        Row: {
          audio_url: string
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_temporary: boolean | null
          language: string
          session_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          voice_name: string
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_temporary?: boolean | null
          language: string
          session_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          voice_name: string
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_temporary?: boolean | null
          language?: string
          session_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          voice_name?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          messages: Json
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string | null
          id: string
          message: string
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message: string
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      generation_counts: {
        Row: {
          count: number | null
          created_at: string | null
          date: string
          id: string
          user_id: string
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          date: string
          id?: string
          user_id: string
        }
        Update: {
          count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          daily_limit: number | null
          email: string | null
          id: string
          plan: string | null
          remaining_generations: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_limit?: number | null
          email?: string | null
          id: string
          plan?: string | null
          remaining_generations?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_limit?: number | null
          email?: string | null
          id?: string
          plan?: string | null
          remaining_generations?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          is_temporary: boolean | null
          session_id: string | null
          size: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          is_temporary?: boolean | null
          session_id?: string | null
          size?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          is_temporary?: boolean | null
          session_id?: string | null
          size?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          role: string
        }[]
      }
      has_role: {
        Args: {
          role: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
