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
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          data: Json | null
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          data?: Json | null
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          data?: Json | null
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string
          criteria: Json
          frequency: string | null
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ami_thresholds: {
        Row: {
          ami_value: number
          county: string
          created_at: string
          effective_date: string
          expiration_date: string | null
          id: string
          lmi_threshold: number
          state: string
          updated_at: string
          year: number
        }
        Insert: {
          ami_value: number
          county: string
          created_at?: string
          effective_date: string
          expiration_date?: string | null
          id?: string
          lmi_threshold: number
          state: string
          updated_at?: string
          year: number
        }
        Update: {
          ami_value?: number
          county?: string
          created_at?: string
          effective_date?: string
          expiration_date?: string | null
          id?: string
          lmi_threshold?: number
          state?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_name: string
          count: number | null
          date: string
          id: string
          response_time: number | null
          status: string | null
        }
        Insert: {
          api_name: string
          count?: number | null
          date: string
          id?: string
          response_time?: number | null
          status?: string | null
        }
        Update: {
          api_name?: string
          count?: number | null
          date?: string
          id?: string
          response_time?: number | null
          status?: string | null
        }
        Relationships: []
      }
      census_cache: {
        Row: {
          cached_at: string | null
          data: Json
          expires_at: string
          id: string
          tract_id: string
        }
        Insert: {
          cached_at?: string | null
          data: Json
          expires_at: string
          id?: string
          tract_id: string
        }
        Update: {
          cached_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          tract_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          alert_id: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          ami_percentage: number | null
          bathrooms: number | null
          bedrooms: number | null
          census_tract: string | null
          city: string
          closing_date: string | null
          created_at: string
          days_on_market: number | null
          description: string | null
          id: string
          income_category: string | null
          is_lmi_eligible: boolean | null
          last_updated: string
          lat: number | null
          listing_date: string | null
          lmi_data: Json | null
          lon: number | null
          lot_size: number | null
          median_income: number | null
          mls_number: string
          photos_url: Json | null
          price: number
          property_type: string | null
          realtor_id: string | null
          square_feet: number | null
          state: string
          status: string | null
          virtual_tour_url: string | null
          year_built: number | null
          zip_code: string
        }
        Insert: {
          address: string
          ami_percentage?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          census_tract?: string | null
          city: string
          closing_date?: string | null
          created_at?: string
          days_on_market?: number | null
          description?: string | null
          id?: string
          income_category?: string | null
          is_lmi_eligible?: boolean | null
          last_updated?: string
          lat?: number | null
          listing_date?: string | null
          lmi_data?: Json | null
          lon?: number | null
          lot_size?: number | null
          median_income?: number | null
          mls_number: string
          photos_url?: Json | null
          price: number
          property_type?: string | null
          realtor_id?: string | null
          square_feet?: number | null
          state: string
          status?: string | null
          virtual_tour_url?: string | null
          year_built?: number | null
          zip_code: string
        }
        Update: {
          address?: string
          ami_percentage?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          census_tract?: string | null
          city?: string
          closing_date?: string | null
          created_at?: string
          days_on_market?: number | null
          description?: string | null
          id?: string
          income_category?: string | null
          is_lmi_eligible?: boolean | null
          last_updated?: string
          lat?: number | null
          listing_date?: string | null
          lmi_data?: Json | null
          lon?: number | null
          lot_size?: number | null
          median_income?: number | null
          mls_number?: string
          photos_url?: Json | null
          price?: number
          property_type?: string | null
          realtor_id?: string | null
          square_feet?: number | null
          state?: string
          status?: string | null
          virtual_tour_url?: string | null
          year_built?: number | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_realtor_id_fkey"
            columns: ["realtor_id"]
            isOneToOne: false
            referencedRelation: "realtors"
            referencedColumns: ["id"]
          },
        ]
      }
      property_matches: {
        Row: {
          address: string | null
          alert_id: string
          created_at: string
          id: string
          is_notified: boolean | null
          mls_number: string
          notification_date: string | null
          price: number | null
          property_id: string | null
        }
        Insert: {
          address?: string | null
          alert_id: string
          created_at?: string
          id?: string
          is_notified?: boolean | null
          mls_number: string
          notification_date?: string | null
          price?: number | null
          property_id?: string | null
        }
        Update: {
          address?: string | null
          alert_id?: string
          created_at?: string
          id?: string
          is_notified?: boolean | null
          mls_number?: string
          notification_date?: string | null
          price?: number | null
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_matches_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_matches_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      realtors: {
        Row: {
          bio: string | null
          brokerage: string | null
          created_at: string
          email: string | null
          id: string
          is_flagged: boolean | null
          last_updated: string
          license_number: string | null
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          social_media: Json | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          brokerage?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_flagged?: boolean | null
          last_updated?: string
          license_number?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          social_media?: Json | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          brokerage?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_flagged?: boolean | null
          last_updated?: string
          license_number?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          social_media?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      saved_properties: {
        Row: {
          created_at: string
          folder: string | null
          id: string
          is_favorite: boolean | null
          notes: string | null
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder?: string | null
          id?: string
          is_favorite?: boolean | null
          notes?: string | null
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder?: string | null
          id?: string
          is_favorite?: boolean | null
          notes?: string | null
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          address: string
          id: string
          income_category: string | null
          ip_address: string | null
          is_eligible: boolean | null
          lmi_result_count: number | null
          result: Json
          result_count: number | null
          search_params: Json | null
          search_query: string | null
          searched_at: string | null
          tract_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          id?: string
          income_category?: string | null
          ip_address?: string | null
          is_eligible?: boolean | null
          lmi_result_count?: number | null
          result: Json
          result_count?: number | null
          search_params?: Json | null
          search_query?: string | null
          searched_at?: string | null
          tract_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          id?: string
          income_category?: string | null
          ip_address?: string | null
          is_eligible?: boolean | null
          lmi_result_count?: number | null
          result?: Json
          result_count?: number | null
          search_params?: Json | null
          search_query?: string | null
          searched_at?: string | null
          tract_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          bio: string | null
          city: string | null
          company: string | null
          id: string
          job_title: string | null
          notification_preferences: Json | null
          phone: string | null
          profile_image: string | null
          state: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          id?: string
          job_title?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          profile_image?: string | null
          state?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          id?: string
          job_title?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          profile_image?: string | null
          state?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          is_admin: boolean
          last_login: string | null
          last_name: string | null
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean
          last_login?: string | null
          last_name?: string | null
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean
          last_login?: string | null
          last_name?: string | null
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_popular_searches: {
        Args: {
          result_limit?: number
        }
        Returns: {
          address: string
          search_count: number
        }[]
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
