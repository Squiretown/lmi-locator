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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      admin_error_logs: {
        Row: {
          admin_user_id: string
          created_at: string
          error_details: Json | null
          error_message: string
          error_type: string
          id: string
          ip_address: string | null
          operation: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          error_details?: Json | null
          error_message: string
          error_type: string
          id?: string
          ip_address?: string | null
          operation: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          error_details?: Json | null
          error_message?: string
          error_type?: string
          id?: string
          ip_address?: string | null
          operation?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_message_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          notification_type: string
          priority: string | null
          subject: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notification_type: string
          priority?: string | null
          subject: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notification_type?: string
          priority?: string | null
          subject?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
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
      assistance_programs: {
        Row: {
          application_url: string | null
          benefit_amount: number | null
          benefit_type: string | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          first_time_buyer_required: boolean | null
          funding_source: string | null
          id: string
          income_limit_percentage: number | null
          military_status_required: string | null
          min_credit_score: number | null
          name: string
          program_details: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          application_url?: string | null
          benefit_amount?: number | null
          benefit_type?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          first_time_buyer_required?: boolean | null
          funding_source?: string | null
          id?: string
          income_limit_percentage?: number | null
          military_status_required?: string | null
          min_credit_score?: number | null
          name: string
          program_details?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          application_url?: string | null
          benefit_amount?: number | null
          benefit_type?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          first_time_buyer_required?: boolean | null
          funding_source?: string | null
          id?: string
          income_limit_percentage?: number | null
          military_status_required?: string | null
          min_credit_score?: number | null
          name?: string
          program_details?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          email: string | null
          first_attempt: string | null
          id: string
          ip_address: string
          last_attempt: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          first_attempt?: string | null
          id?: string
          ip_address: string
          last_attempt?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          first_attempt?: string | null
          id?: string
          ip_address?: string
          last_attempt?: string | null
        }
        Relationships: []
      }
      batch_search_jobs: {
        Row: {
          addresses: Json
          completed_at: string | null
          created_at: string | null
          id: string
          name: string
          processed_addresses: number | null
          results: Json | null
          status: string | null
          total_addresses: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          addresses: Json
          completed_at?: string | null
          created_at?: string | null
          id?: string
          name: string
          processed_addresses?: number | null
          results?: Json | null
          status?: string | null
          total_addresses?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          addresses?: Json
          completed_at?: string | null
          created_at?: string | null
          id?: string
          name?: string
          processed_addresses?: number | null
          results?: Json | null
          status?: string | null
          total_addresses?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          imageurl: string
          title: string
          user_id: string
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          imageurl: string
          title: string
          user_id: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          imageurl?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      broker_permissions: {
        Row: {
          broker_id: string
          granted_at: string
          id: string
          permission_id: string | null
          permission_name: string
        }
        Insert: {
          broker_id: string
          granted_at?: string
          id?: string
          permission_id?: string | null
          permission_name: string
        }
        Update: {
          broker_id?: string
          granted_at?: string
          id?: string
          permission_id?: string | null
          permission_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_permissions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "mortgage_brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["permission_id"]
          },
        ]
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
      census_tract_results: {
        Row: {
          ami_percentage: number | null
          created_at: string
          id: string
          lmi_status: boolean
          property_count: number | null
          search_id: string
          tract_id: string
          tract_name: string | null
        }
        Insert: {
          ami_percentage?: number | null
          created_at?: string
          id?: string
          lmi_status?: boolean
          property_count?: number | null
          search_id: string
          tract_id: string
          tract_name?: string | null
        }
        Update: {
          ami_percentage?: number | null
          created_at?: string
          id?: string
          lmi_status?: boolean
          property_count?: number | null
          search_id?: string
          tract_id?: string
          tract_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "census_tract_results_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "census_tract_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      census_tract_searches: {
        Row: {
          created_at: string
          download_count: number | null
          error_message: string | null
          expires_at: string | null
          export_format: string | null
          id: string
          last_updated: string
          result_count: number | null
          search_name: string | null
          search_type: string
          search_value: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_count?: number | null
          error_message?: string | null
          expires_at?: string | null
          export_format?: string | null
          id?: string
          last_updated?: string
          result_count?: number | null
          search_name?: string | null
          search_type: string
          search_value: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_count?: number | null
          error_message?: string | null
          expires_at?: string | null
          export_format?: string | null
          id?: string
          last_updated?: string
          result_count?: number | null
          search_name?: string | null
          search_type?: string
          search_value?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      census_tracts: {
        Row: {
          ami_percentage: number | null
          center_lat: number | null
          center_lon: number | null
          centroid_lat: number | null
          centroid_lng: number | null
          county: string | null
          county_code: string | null
          data_vintage: string | null
          eligibility: string | null
          ffiec_data_year: number | null
          geometry: unknown | null
          id: number
          import_batch_id: string | null
          income_category: string | null
          income_level: string | null
          is_lmi_eligible: boolean | null
          last_updated: string | null
          median_home_value: number | null
          median_income: number | null
          minority_population_pct: number | null
          msa_md_median_income: number | null
          owner_occupied_units: number | null
          state: string | null
          state_code: string | null
          total_households: number | null
          total_population: number | null
          tract_code: string | null
          tract_id: string
          tract_median_family_income: number | null
          tract_name: string | null
          tract_population: number | null
        }
        Insert: {
          ami_percentage?: number | null
          center_lat?: number | null
          center_lon?: number | null
          centroid_lat?: number | null
          centroid_lng?: number | null
          county?: string | null
          county_code?: string | null
          data_vintage?: string | null
          eligibility?: string | null
          ffiec_data_year?: number | null
          geometry?: unknown | null
          id?: number
          import_batch_id?: string | null
          income_category?: string | null
          income_level?: string | null
          is_lmi_eligible?: boolean | null
          last_updated?: string | null
          median_home_value?: number | null
          median_income?: number | null
          minority_population_pct?: number | null
          msa_md_median_income?: number | null
          owner_occupied_units?: number | null
          state?: string | null
          state_code?: string | null
          total_households?: number | null
          total_population?: number | null
          tract_code?: string | null
          tract_id: string
          tract_median_family_income?: number | null
          tract_name?: string | null
          tract_population?: number | null
        }
        Update: {
          ami_percentage?: number | null
          center_lat?: number | null
          center_lon?: number | null
          centroid_lat?: number | null
          centroid_lng?: number | null
          county?: string | null
          county_code?: string | null
          data_vintage?: string | null
          eligibility?: string | null
          ffiec_data_year?: number | null
          geometry?: unknown | null
          id?: number
          import_batch_id?: string | null
          income_category?: string | null
          income_level?: string | null
          is_lmi_eligible?: boolean | null
          last_updated?: string | null
          median_home_value?: number | null
          median_income?: number | null
          minority_population_pct?: number | null
          msa_md_median_income?: number | null
          owner_occupied_units?: number | null
          state?: string | null
          state_code?: string | null
          total_households?: number | null
          total_population?: number | null
          tract_code?: string | null
          tract_id?: string
          tract_median_family_income?: number | null
          tract_name?: string | null
          tract_population?: number | null
        }
        Relationships: []
      }
      client_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          client_id: string
          created_at: string
          description: string
          id: string
          professional_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          client_id: string
          created_at?: string
          description: string
          id?: string
          professional_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          client_id?: string
          created_at?: string
          description?: string
          id?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activity_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_communications: {
        Row: {
          client_id: string
          content: string
          delivered_at: string | null
          error_message: string | null
          id: string
          professional_id: string
          recipient: string
          sent_at: string
          status: string
          subject: string | null
          template_id: string | null
          type: string
        }
        Insert: {
          client_id: string
          content: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          professional_id: string
          recipient: string
          sent_at?: string
          status?: string
          subject?: string | null
          template_id?: string | null
          type: string
        }
        Update: {
          client_id?: string
          content?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          professional_id?: string
          recipient?: string
          sent_at?: string
          status?: string
          subject?: string | null
          template_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_communications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_communications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invitations: {
        Row: {
          accepted_at: string | null
          client_email: string
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          custom_message: string | null
          email_sent: boolean | null
          expires_at: string | null
          id: string
          invitation_code: string
          invitation_target_type: string
          invitation_type: string
          professional_id: string
          sent_at: string | null
          sms_sent: boolean | null
          status: string
          target_professional_role: string | null
          team_context: Json | null
          team_showcase: Json | null
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_email: string
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          custom_message?: string | null
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          invitation_code?: string
          invitation_target_type?: string
          invitation_type?: string
          professional_id: string
          sent_at?: string | null
          sms_sent?: boolean | null
          status?: string
          target_professional_role?: string | null
          team_context?: Json | null
          team_showcase?: Json | null
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          custom_message?: string | null
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          invitation_code?: string
          invitation_target_type?: string
          invitation_type?: string
          professional_id?: string
          sent_at?: string | null
          sms_sent?: boolean | null
          status?: string
          target_professional_role?: string | null
          team_context?: Json | null
          team_showcase?: Json | null
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          created_at: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          email: string | null
          first_name: string
          first_time_buyer: boolean | null
          household_size: number | null
          id: string
          income: number | null
          last_name: string
          military_status: string | null
          notes: string | null
          phone: string | null
          professional_id: string
          saved_properties: Json | null
          status: string | null
          status_reason: string | null
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          email?: string | null
          first_name: string
          first_time_buyer?: boolean | null
          household_size?: number | null
          id?: string
          income?: number | null
          last_name: string
          military_status?: string | null
          notes?: string | null
          phone?: string | null
          professional_id: string
          saved_properties?: Json | null
          status?: string | null
          status_reason?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          email?: string | null
          first_name?: string
          first_time_buyer?: boolean | null
          household_size?: number | null
          id?: string
          income?: number | null
          last_name?: string
          military_status?: string | null
          notes?: string | null
          phone?: string | null
          professional_id?: string
          saved_properties?: Json | null
          status?: string | null
          status_reason?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_team_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          client_id: string
          id: string
          professional_id: string
          professional_role: string
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          client_id: string
          id?: string
          professional_id: string
          professional_role: string
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          client_id?: string
          id?: string
          professional_id?: string
          professional_role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_team_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          client_id: string
          created_at: string | null
          email: string | null
          first_name: string
          last_name: string
          notes: string | null
          phone: string | null
          professional_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string
          created_at?: string | null
          email?: string | null
          first_name: string
          last_name: string
          notes?: string | null
          phone?: string | null
          professional_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email?: string | null
          first_name?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          professional_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      communication_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_global: boolean
          name: string
          professional_type: string
          subject: string | null
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean
          name: string
          professional_type: string
          subject?: string | null
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean
          name?: string
          professional_type?: string
          subject?: string | null
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      contact_interactions: {
        Row: {
          contact_id: string
          description: string | null
          id: string
          metadata: Json | null
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          contact_id: string
          description?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          contact_id?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          created_at: string
          custom_fields: Json | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          last_updated: string
          notes: string | null
          owner_id: string
          phone: string | null
          status: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          last_updated?: string
          notes?: string | null
          owner_id: string
          phone?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          last_updated?: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_invited: {
        Row: {
          created_at: string
          email: string
          email_sent: boolean | null
          expires_at: string | null
          id: string
          invitation_code: string | null
          invitation_token: string | null
          invitation_type: string | null
          invited_at: string
          inviter_id: string
          name: string | null
          registered_user_id: string | null
          sms_sent: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          invitation_code?: string | null
          invitation_token?: string | null
          invitation_type?: string | null
          invited_at?: string
          inviter_id: string
          name?: string | null
          registered_user_id?: string | null
          sms_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          invitation_code?: string | null
          invitation_token?: string | null
          invitation_type?: string | null
          invited_at?: string
          inviter_id?: string
          name?: string | null
          registered_user_id?: string | null
          sms_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_import_log: {
        Row: {
          completed_at: string | null
          created_at: string
          error_details: Json | null
          file_name: string | null
          file_size: number | null
          id: string
          import_status: string
          import_type: string
          records_failed: number | null
          records_processed: number | null
          records_successful: number | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          import_status?: string
          import_type: string
          records_failed?: number | null
          records_processed?: number | null
          records_successful?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          import_status?: string
          import_type?: string
          records_failed?: number | null
          records_processed?: number | null
          records_successful?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      data_source_metadata: {
        Row: {
          collection_period: string
          created_at: string
          current_vintage: string
          id: string
          last_updated: string
          methodology_notes: string | null
          next_expected_update: string | null
          provider: string
          source_name: string
          status: string
          updated_at: string
        }
        Insert: {
          collection_period: string
          created_at?: string
          current_vintage: string
          id?: string
          last_updated: string
          methodology_notes?: string | null
          next_expected_update?: string | null
          provider: string
          source_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          collection_period?: string
          created_at?: string
          current_vintage?: string
          id?: string
          last_updated?: string
          methodology_notes?: string | null
          next_expected_update?: string | null
          provider?: string
          source_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ffiec_field_definitions: {
        Row: {
          created_at: string | null
          data_type: string | null
          field_description: string | null
          field_name: string
          id: string
          is_required: boolean | null
          updated_at: string | null
          valid_values: string[] | null
        }
        Insert: {
          created_at?: string | null
          data_type?: string | null
          field_description?: string | null
          field_name: string
          id?: string
          is_required?: boolean | null
          updated_at?: string | null
          valid_values?: string[] | null
        }
        Update: {
          created_at?: string | null
          data_type?: string | null
          field_description?: string | null
          field_name?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string | null
          valid_values?: string[] | null
        }
        Relationships: []
      }
      ffiec_geography_codes: {
        Row: {
          code_type: string
          code_value: string
          created_at: string | null
          id: string
          name: string
          parent_code: string | null
        }
        Insert: {
          code_type: string
          code_value: string
          created_at?: string | null
          id?: string
          name: string
          parent_code?: string | null
        }
        Update: {
          code_type?: string
          code_value?: string
          created_at?: string | null
          id?: string
          name?: string
          parent_code?: string | null
        }
        Relationships: []
      }
      ffiec_import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_details: Json | null
          file_info: Json | null
          file_name: string | null
          file_size: number | null
          id: string
          job_type: string
          progress_percentage: number | null
          records_failed: number | null
          records_processed: number | null
          records_successful: number | null
          records_total: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_details?: Json | null
          file_info?: Json | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          job_type: string
          progress_percentage?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_successful?: number | null
          records_total?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_details?: Json | null
          file_info?: Json | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          job_type?: string
          progress_percentage?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_successful?: number | null
          records_total?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      help_items: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      import_jobs: {
        Row: {
          created_at: string | null
          current_chunk: number | null
          error_message: string | null
          id: string
          processed_rows: number | null
          status: string
          total_chunks: number | null
          total_rows: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_chunk?: number | null
          error_message?: string | null
          id?: string
          processed_rows?: number | null
          status?: string
          total_chunks?: number | null
          total_rows?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_chunk?: number | null
          error_message?: string | null
          id?: string
          processed_rows?: number | null
          status?: string
          total_chunks?: number | null
          total_rows?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lmi_search_error_logs: {
        Row: {
          browser_info: string | null
          created_at: string
          error_message: string
          error_stack: string | null
          id: string
          resolution_notes: string | null
          resolved: boolean | null
          search_params: Json | null
          search_type: string
          search_value: string
          user_id: string | null
        }
        Insert: {
          browser_info?: string | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          search_params?: Json | null
          search_type: string
          search_value: string
          user_id?: string | null
        }
        Update: {
          browser_info?: string | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          search_params?: Json | null
          search_type?: string
          search_value?: string
          user_id?: string | null
        }
        Relationships: []
      }
      marketing_addresses: {
        Row: {
          address: string
          created_at: string | null
          error_message: string | null
          id: string
          is_eligible: boolean | null
          marketing_id: string
          status: string | null
          verification_details: Json | null
          verified_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_eligible?: boolean | null
          marketing_id: string
          status?: string | null
          verification_details?: Json | null
          verified_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_eligible?: boolean | null
          marketing_id?: string
          status?: string | null
          verification_details?: Json | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_addresses_marketing_id_fkey"
            columns: ["marketing_id"]
            isOneToOne: false
            referencedRelation: "marketing_jobs"
            referencedColumns: ["marketing_id"]
          },
        ]
      }
      marketing_jobs: {
        Row: {
          campaign_name: string
          completed_at: string | null
          created_at: string | null
          eligible_addresses: number | null
          marketing_id: string
          notification_sent: boolean | null
          processed_addresses: number | null
          status: string | null
          total_addresses: number | null
          user_id: string
        }
        Insert: {
          campaign_name: string
          completed_at?: string | null
          created_at?: string | null
          eligible_addresses?: number | null
          marketing_id?: string
          notification_sent?: boolean | null
          processed_addresses?: number | null
          status?: string | null
          total_addresses?: number | null
          user_id: string
        }
        Update: {
          campaign_name?: string
          completed_at?: string | null
          created_at?: string | null
          eligible_addresses?: number | null
          marketing_id?: string
          notification_sent?: boolean | null
          processed_addresses?: number | null
          status?: string | null
          total_addresses?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mortgage_brokers: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          license_number: string
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          license_number: string
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          license_number?: string
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      mortgage_professionals: {
        Row: {
          address: string | null
          bio: string | null
          company: string
          created_at: string
          email: string | null
          id: string
          is_flagged: boolean | null
          is_verified: boolean | null
          last_updated: string
          license_number: string
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          social_media: Json | null
          status: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          company: string
          created_at?: string
          email?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          last_updated?: string
          license_number: string
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          social_media?: Json | null
          status?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          company?: string
          created_at?: string
          email?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          last_updated?: string
          license_number?: string
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          social_media?: Json | null
          status?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean | null
          frequency: string | null
          in_app_enabled: boolean | null
          notification_type: string
          preference_id: string
          sms_enabled: boolean | null
          user_id: string
        }
        Insert: {
          email_enabled?: boolean | null
          frequency?: string | null
          in_app_enabled?: boolean | null
          notification_type: string
          preference_id?: string
          sms_enabled?: boolean | null
          user_id: string
        }
        Update: {
          email_enabled?: boolean | null
          frequency?: string | null
          in_app_enabled?: boolean | null
          notification_type?: string
          preference_id?: string
          sms_enabled?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          alert_id: string | null
          bulk_message_id: string | null
          created_at: string
          data: Json | null
          delivered_at: string | null
          delivery_method: string | null
          id: string
          is_read: boolean | null
          link_url: string | null
          message: string
          notification_type: string | null
          priority: string | null
          read_at: string | null
          scheduled_for: string | null
          template_id: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          bulk_message_id?: string | null
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          delivery_method?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          message: string
          notification_type?: string | null
          priority?: string | null
          read_at?: string | null
          scheduled_for?: string | null
          template_id?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string | null
          bulk_message_id?: string | null
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          delivery_method?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          message?: string
          notification_type?: string | null
          priority?: string | null
          read_at?: string | null
          scheduled_for?: string | null
          template_id?: string | null
          title?: string | null
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
      permissions: {
        Row: {
          created_at: string
          description: string | null
          permission_id: string
          permission_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          permission_id?: string
          permission_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          permission_id?: string
          permission_name?: string
        }
        Relationships: []
      }
      professional_leads: {
        Row: {
          client_name: string
          created_at: string | null
          eligible_programs: Json | null
          email: string | null
          id: string
          last_contacted_at: string | null
          notes: string | null
          phone: string | null
          professional_id: string | null
          property_address: string | null
          property_id: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          eligible_programs?: Json | null
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          notes?: string | null
          phone?: string | null
          professional_id?: string | null
          property_address?: string | null
          property_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          eligible_programs?: Json | null
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          notes?: string | null
          phone?: string | null
          professional_id?: string | null
          property_address?: string | null
          property_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_permissions: {
        Row: {
          granted_at: string
          id: string
          permission_name: string
          professional_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          permission_name: string
          professional_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          permission_name?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_permissions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_teams: {
        Row: {
          created_at: string
          id: string
          mortgage_professional_id: string
          notes: string | null
          realtor_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          mortgage_professional_id: string
          notes?: string | null
          realtor_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          mortgage_professional_id?: string
          notes?: string | null
          realtor_id?: string
          status?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          address: string | null
          bio: string | null
          company: string
          created_at: string
          id: string
          is_flagged: boolean | null
          is_verified: boolean | null
          last_updated: string
          license_number: string
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          social_media: Json | null
          status: string
          type: string
          user_id: string
          visibility_settings: Json | null
          website: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          company: string
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          last_updated?: string
          license_number: string
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          social_media?: Json | null
          status?: string
          type: string
          user_id: string
          visibility_settings?: Json | null
          website?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          company?: string
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          last_updated?: string
          license_number?: string
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          social_media?: Json | null
          status?: string
          type?: string
          user_id?: string
          visibility_settings?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      program_eligibility_checks: {
        Row: {
          created_at: string | null
          eligible_programs: Json | null
          first_time_buyer: boolean | null
          id: string
          military_status: string | null
          property_id: string | null
          residence_intent: boolean | null
          search_id: string | null
          timeframe: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          eligible_programs?: Json | null
          first_time_buyer?: boolean | null
          id?: string
          military_status?: string | null
          property_id?: string | null
          residence_intent?: boolean | null
          search_id?: string | null
          timeframe?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          eligible_programs?: Json | null
          first_time_buyer?: boolean | null
          id?: string
          military_status?: string | null
          property_id?: string | null
          residence_intent?: boolean | null
          search_id?: string | null
          timeframe?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_eligibility_checks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_eligibility_checks_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "search_history"
            referencedColumns: ["id"]
          },
        ]
      }
      program_locations: {
        Row: {
          created_at: string | null
          id: string
          location_type: string
          location_value: string
          program_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_type: string
          location_value: string
          program_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location_type?: string
          location_value?: string
          program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_locations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "assistance_programs"
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
        Relationships: []
      }
      property_cache: {
        Row: {
          address: string
          data_source: string | null
          eligibility: string | null
          id: number
          income_category: string | null
          last_updated: string | null
          lat: number | null
          lon: number | null
          median_income: number | null
          search_count: number | null
          tract_id: string | null
        }
        Insert: {
          address: string
          data_source?: string | null
          eligibility?: string | null
          id?: number
          income_category?: string | null
          last_updated?: string | null
          lat?: number | null
          lon?: number | null
          median_income?: number | null
          search_count?: number | null
          tract_id?: string | null
        }
        Update: {
          address?: string
          data_source?: string | null
          eligibility?: string | null
          id?: number
          income_category?: string | null
          last_updated?: string | null
          lat?: number | null
          lon?: number | null
          median_income?: number | null
          search_count?: number | null
          tract_id?: string | null
        }
        Relationships: []
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
      property_types_eligible: {
        Row: {
          created_at: string | null
          id: string
          max_price: number | null
          max_units: number | null
          other_requirements: Json | null
          program_id: string | null
          property_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_price?: number | null
          max_units?: number | null
          other_requirements?: Json | null
          program_id?: string | null
          property_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          max_price?: number | null
          max_units?: number | null
          other_requirements?: Json | null
          program_id?: string | null
          property_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_types_eligible_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "assistance_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number | null
          endpoint: string
          first_request: string | null
          id: string
          ip_address: string
          is_blocked: boolean | null
          last_request: string | null
        }
        Insert: {
          count?: number | null
          endpoint: string
          first_request?: string | null
          id?: string
          ip_address: string
          is_blocked?: boolean | null
          last_request?: string | null
        }
        Update: {
          count?: number | null
          endpoint?: string
          first_request?: string | null
          id?: string
          ip_address?: string
          is_blocked?: boolean | null
          last_request?: string | null
        }
        Relationships: []
      }
      realtors: {
        Row: {
          address: string | null
          bio: string | null
          company: string
          created_at: string
          email: string | null
          id: string
          is_flagged: boolean | null
          is_verified: boolean | null
          last_updated: string
          license_number: string
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          social_media: Json | null
          status: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          company: string
          created_at?: string
          email?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          last_updated?: string
          license_number: string
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          social_media?: Json | null
          status?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          company?: string
          created_at?: string
          email?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          last_updated?: string
          license_number?: string
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          social_media?: Json | null
          status?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          title: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_addresses: {
        Row: {
          address: string
          created_at: string
          id: string
          is_lmi_eligible: boolean
          notes: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_lmi_eligible?: boolean
          notes?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_lmi_eligible?: boolean
          notes?: string | null
          user_id?: string
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
      scheduled_messages: {
        Row: {
          created_at: string
          delivery_method: string
          error_message: string | null
          id: string
          message: string
          recipient_filter: Json | null
          recipient_id: string | null
          recipient_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          delivery_method?: string
          error_message?: string | null
          id?: string
          message: string
          recipient_filter?: Json | null
          recipient_id?: string | null
          recipient_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          delivery_method?: string
          error_message?: string | null
          id?: string
          message?: string
          recipient_filter?: Json | null
          recipient_id?: string | null
          recipient_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          address: string
          data_collection_period: string | null
          data_last_updated: string | null
          data_methodology: string | null
          data_provider: string | null
          data_source: string | null
          data_vintage: string | null
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
          data_collection_period?: string | null
          data_last_updated?: string | null
          data_methodology?: string | null
          data_provider?: string | null
          data_source?: string | null
          data_vintage?: string | null
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
          data_collection_period?: string | null
          data_last_updated?: string | null
          data_methodology?: string | null
          data_provider?: string | null
          data_source?: string | null
          data_vintage?: string | null
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
      security_audit_log: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          success: boolean | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
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
      team_communication_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_global: boolean
          name: string
          subject: string | null
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean
          name: string
          subject?: string | null
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      team_communications: {
        Row: {
          content: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          sender_id: string
          sent_at: string
          status: string
          subject: string | null
          team_member_email: string | null
          team_member_id: string
          team_member_phone: string | null
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          sender_id: string
          sent_at?: string
          status?: string
          subject?: string | null
          team_member_email?: string | null
          team_member_id: string
          team_member_phone?: string | null
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          sender_id?: string
          sent_at?: string
          status?: string
          subject?: string | null
          team_member_email?: string | null
          team_member_id?: string
          team_member_phone?: string | null
          type?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar: string
          company: string
          created_at: string
          id: string
          name: string
          role: string
          stars: number
          testimonial: string
          user_id: string
        }
        Insert: {
          avatar: string
          company: string
          created_at?: string
          id?: string
          name: string
          role: string
          stars: number
          testimonial: string
          user_id: string
        }
        Update: {
          avatar?: string
          company?: string
          created_at?: string
          id?: string
          name?: string
          role?: string
          stars?: number
          testimonial?: string
          user_id?: string
        }
        Relationships: []
      }
      theme_presets: {
        Row: {
          colors: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_custom: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          colors: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_custom?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          colors?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_custom?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          category: string
          created_at: string
          dark_value: string
          description: string | null
          id: string
          light_value: string
          setting_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          dark_value: string
          description?: string | null
          id?: string
          light_value: string
          setting_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          dark_value?: string
          description?: string | null
          id?: string
          light_value?: string
          setting_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tract_properties: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          property_type: string | null
          state: string
          tract_result_id: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          property_type?: string | null
          state: string
          tract_result_id: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          property_type?: string | null
          state?: string
          tract_result_id?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "tract_properties_tract_result_id_fkey"
            columns: ["tract_result_id"]
            isOneToOne: false
            referencedRelation: "census_tract_results"
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
          company_address: string | null
          company_name: string | null
          company_website: string | null
          id: string
          job_title: string | null
          license_number: string | null
          license_verified: boolean | null
          notification_preferences: Json | null
          phone: string | null
          professional_bio: string | null
          profile_image: string | null
          referral_code: string | null
          referred_by_id: string | null
          referred_by_name: string | null
          referred_by_type: string | null
          state: string | null
          subscription_end_date: string | null
          subscription_ends_at: string | null
          subscription_start_date: string | null
          subscription_starts_at: string | null
          subscription_tier: string | null
          user_id: string
          user_type: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          company_address?: string | null
          company_name?: string | null
          company_website?: string | null
          id?: string
          job_title?: string | null
          license_number?: string | null
          license_verified?: boolean | null
          notification_preferences?: Json | null
          phone?: string | null
          professional_bio?: string | null
          profile_image?: string | null
          referral_code?: string | null
          referred_by_id?: string | null
          referred_by_name?: string | null
          referred_by_type?: string | null
          state?: string | null
          subscription_end_date?: string | null
          subscription_ends_at?: string | null
          subscription_start_date?: string | null
          subscription_starts_at?: string | null
          subscription_tier?: string | null
          user_id: string
          user_type?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          company_address?: string | null
          company_name?: string | null
          company_website?: string | null
          id?: string
          job_title?: string | null
          license_number?: string | null
          license_verified?: boolean | null
          notification_preferences?: Json | null
          phone?: string | null
          professional_bio?: string | null
          profile_image?: string | null
          referral_code?: string | null
          referred_by_id?: string | null
          referred_by_name?: string | null
          referred_by_type?: string | null
          state?: string | null
          subscription_end_date?: string | null
          subscription_ends_at?: string | null
          subscription_start_date?: string | null
          subscription_starts_at?: string | null
          subscription_tier?: string | null
          user_id?: string
          user_type?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_role_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"] | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_role_changes: {
        Row: {
          changed_at: string | null
          changed_by: string
          id: string
          ip_address: string | null
          new_role: string
          old_role: string | null
          reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          id?: string
          ip_address?: string | null
          new_role: string
          old_role?: string | null
          reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          id?: string
          ip_address?: string | null
          new_role?: string
          old_role?: string | null
          reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          failed_login_attempts: number | null
          first_name: string | null
          id: string
          is_active: boolean
          is_admin: boolean
          last_ip_address: string | null
          last_login: string | null
          last_name: string | null
          password_hash: string
          username: string
          verification_date: string | null
          verification_method: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean
          last_ip_address?: string | null
          last_login?: string | null
          last_name?: string | null
          password_hash: string
          username: string
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean
          last_ip_address?: string | null
          last_login?: string | null
          last_name?: string | null
          password_hash?: string
          username?: string
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          account_settings: Json | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          role: string
        }
        Insert: {
          account_settings?: Json | null
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          last_login?: string | null
          role: string
        }
        Update: {
          account_settings?: Json | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          role?: string
        }
        Relationships: []
      }
      verification_challenges: {
        Row: {
          answers: string[]
          created_at: string | null
          difficulty: number | null
          id: string
          is_active: boolean | null
          question: string
        }
        Insert: {
          answers: string[]
          created_at?: string | null
          difficulty?: number | null
          id?: string
          is_active?: boolean | null
          question: string
        }
        Update: {
          answers?: string[]
          created_at?: string | null
          difficulty?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
      }
      admin_update_user_role: {
        Args: {
          p_target_user_id: string
          p_new_role: string
          p_reason?: string
        }
        Returns: Json
      }
      anonymize_user_search_history: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      check_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_auth_rate_limit: {
        Args: { p_ip_address: string; p_email: string }
        Returns: boolean
      }
      check_user_permission_simple: {
        Args: { user_uuid: string; permission_name: string }
        Returns: boolean
      }
      comprehensive_security_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_default_notification_preferences: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      delete_user_references: {
        Args: { target_user_id: string }
        Returns: Json
      }
      diagnose_user_data: {
        Args: { target_user_id: string }
        Returns: {
          table_name: string
          record_count: number
          sample_ids: string[]
        }[]
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      find_census_tract_flexible: {
        Args: { input_tract_id: string }
        Returns: {
          tract_id: string
          state: string
          county: string
          tract_name: string
          income_level: string
          median_income: number
          msa_md_median_income: number
          tract_median_family_income: number
          ami_percentage: number
          is_lmi_eligible: boolean
          ffiec_data_year: number
          tract_population: number
          minority_population_pct: number
          owner_occupied_units: number
        }[]
      }
      find_ffiec_tract_by_coords: {
        Args: { lat: number; lng: number }
        Returns: {
          tract_id: string
          income_level: string
          is_lmi_eligible: boolean
          ami_percentage: number
          tract_median_family_income: number
          msa_md_median_income: number
          ffiec_data_year: number
        }[]
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_all_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          permission_name: string
        }[]
      }
      get_current_user_type: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_type_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_marketing_summary: {
        Args: { user_uuid: string }
        Returns: {
          pending_count: number
          processing_count: number
          completed_count: number
          total_addresses: number
          eligible_addresses: number
        }[]
      }
      get_notification_counts: {
        Args: { user_uuid: string }
        Returns: {
          unread_count: number
          read_count: number
          total_count: number
        }[]
      }
      get_popular_searches: {
        Args: { result_limit?: number }
        Returns: {
          address: string
          search_count: number
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: {
          permission_name: string
        }[]
      }
      get_user_type_name: {
        Args: { profile_id: string }
        Returns: {
          type_name: string
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      log_security_event: {
        Args:
          | {
              event_type: string
              user_id_param: string
              ip_addr: string
              user_agent_param: string
              success_param: boolean
              details_param?: Json
            }
          | {
              p_event_type: string
              p_user_id?: string
              p_target_user_id?: string
              p_details?: Json
              p_ip_address?: string
              p_user_agent?: string
              p_success?: boolean
            }
        Returns: undefined
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
      user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_owns_marketing_job: {
        Args: { marketing_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "professional"
        | "client"
        | "realtor"
        | "mortgage_professional"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
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
      app_role: [
        "admin",
        "professional",
        "client",
        "realtor",
        "mortgage_professional",
      ],
    },
  },
} as const
