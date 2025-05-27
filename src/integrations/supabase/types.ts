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
      client_profiles: {
        Row: {
          created_at: string | null
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
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
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
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
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
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          id: string
          invitation_token: string | null
          invited_at: string
          inviter_id: string
          name: string | null
          registered_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invitation_token?: string | null
          invited_at?: string
          inviter_id: string
          name?: string | null
          registered_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invitation_token?: string | null
          invited_at?: string
          inviter_id?: string
          name?: string | null
          registered_user_id?: string | null
          status?: string
          updated_at?: string
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
          created_at: string
          data: Json | null
          delivered_at: string | null
          delivery_method: string | null
          id: string
          is_read: boolean | null
          link_url: string | null
          message: string
          notification_type: string | null
          read_at: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          delivery_method?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          message: string
          notification_type?: string | null
          read_at?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          delivery_method?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          message?: string
          notification_type?: string | null
          read_at?: string | null
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
      [_ in never]: never
    }
    Functions: {
      create_default_notification_preferences: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      get_all_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          permission_name: string
        }[]
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
