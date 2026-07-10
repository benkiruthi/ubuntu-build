export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          user_type: string;
          county: string | null;
          subscription_tier: string;
          subscription_expires_at: string | null;
          onboarding_complete: boolean;
          bio: string | null;
          years_experience: number | null;
          portfolio_url: string | null;
          listed_on_marketplace: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          user_type?: string;
          county?: string | null;
          subscription_tier?: string;
          subscription_expires_at?: string | null;
          onboarding_complete?: boolean;
          bio?: string | null;
          years_experience?: number | null;
          portfolio_url?: string | null;
          listed_on_marketplace?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          user_type?: string;
          county?: string | null;
          subscription_tier?: string;
          subscription_expires_at?: string | null;
          onboarding_complete?: boolean;
          bio?: string | null;
          years_experience?: number | null;
          portfolio_url?: string | null;
          listed_on_marketplace?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          plan: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          plan?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          plan?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      org_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          org_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          org_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          org_id: string | null;
          name: string;
          status: string;
          project_type: string;
          plot_size_sqm: number | null;
          budget_kes: number | null;
          location_county: string | null;
          location_area: string | null;
          floors: number | null;
          bedrooms: number | null;
          brief_data: Json;
          phases_unlocked: string[];
          cover_image_url: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          org_id?: string | null;
          name: string;
          status?: string;
          project_type?: string;
          plot_size_sqm?: number | null;
          budget_kes?: number | null;
          location_county?: string | null;
          location_area?: string | null;
          floors?: number | null;
          bedrooms?: number | null;
          brief_data?: Json;
          phases_unlocked?: string[];
          cover_image_url?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          org_id?: string | null;
          name?: string;
          status?: string;
          project_type?: string;
          plot_size_sqm?: number | null;
          budget_kes?: number | null;
          location_county?: string | null;
          location_area?: string | null;
          floors?: number | null;
          bedrooms?: number | null;
          brief_data?: Json;
          phases_unlocked?: string[];
          cover_image_url?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_sessions: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          agent_type: string;
          messages: Json;
          output_data: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          agent_type: string;
          messages?: Json;
          output_data?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          agent_type?: string;
          messages?: Json;
          output_data?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          uploaded_by: string;
          file_type: string;
          storage_path: string;
          name: string;
          size_bytes: number;
          mime_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          uploaded_by: string;
          file_type?: string;
          storage_path: string;
          name: string;
          size_bytes: number;
          mime_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          uploaded_by?: string;
          file_type?: string;
          storage_path?: string;
          name?: string;
          size_bytes?: number;
          mime_type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount_kes: number;
          purpose: string;
          status: string;
          pesapal_order_id: string | null;
          pesapal_tracking_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_kes: number;
          purpose: string;
          status?: string;
          pesapal_order_id?: string | null;
          pesapal_tracking_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_kes?: number;
          purpose?: string;
          status?: string;
          pesapal_order_id?: string | null;
          pesapal_tracking_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          ip: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      marketplace_reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          professional_id: string;
          project_id: string | null;
          rating: number;
          body: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          professional_id: string;
          project_id?: string | null;
          rating: number;
          body?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          professional_id?: string;
          project_id?: string | null;
          rating?: number;
          body?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
