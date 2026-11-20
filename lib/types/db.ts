/**
 * TypeScript types matching `supabase/migrations/0001_init.sql` (PRD §9).
 * Keep in sync when migrations change; regenerate via Supabase CLI when available.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ThemePreference = "ink" | "dawn";

export type ChatRole = "user" | "assistant" | "system";

export type PurchaseStore =
  | "app_store"
  | "play_store"
  | "mock"
  | "promotional"
  | "unknown";

export type PurchaseStatus =
  | "started"
  | "purchased"
  | "restored"
  | "cancelled"
  | "failed"
  | "expired"
  | "refunded";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          theme: ThemePreference;
          rc_app_user_id: string | null;
          private_until: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          theme?: ThemePreference;
          rc_app_user_id?: string | null;
          private_until?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          theme?: ThemePreference;
          rc_app_user_id?: string | null;
          private_until?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      birth_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          birth_at: string;
          lat: number;
          lng: number;
          tz: string;
          time_unknown: boolean;
          place_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          birth_at: string;
          lat: number;
          lng: number;
          tz: string;
          time_unknown?: boolean;
          place_label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          birth_at?: string;
          lat?: number;
          lng?: number;
          tz?: string;
          time_unknown?: boolean;
          place_label?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "birth_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      charts: {
        Row: {
          id: string;
          birth_profile_id: string;
          system: string;
          payload: Json;
          computed_at: string;
        };
        Insert: {
          id?: string;
          birth_profile_id: string;
          system?: string;
          payload?: Json;
          computed_at?: string;
        };
        Update: {
          id?: string;
          birth_profile_id?: string;
          system?: string;
          payload?: Json;
          computed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charts_birth_profile_id_fkey";
            columns: ["birth_profile_id"];
            isOneToOne: false;
            referencedRelation: "birth_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      memories: {
        Row: {
          id: string;
          user_id: string;
          body: string;
          source: string;
          salience: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          body: string;
          source?: string;
          salience?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          body?: string;
          source?: string;
          salience?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bonds: {
        Row: {
          id: string;
          user_id: string;
          their_birth_profile_id: string;
          label: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          their_birth_profile_id: string;
          label: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          their_birth_profile_id?: string;
          label?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bonds_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bonds_their_birth_profile_id_fkey";
            columns: ["their_birth_profile_id"];
            isOneToOne: false;
            referencedRelation: "birth_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      synastry_cache: {
        Row: {
          bond_id: string;
          payload: Json;
          computed_at: string;
        };
        Insert: {
          bond_id: string;
          payload?: Json;
          computed_at?: string;
        };
        Update: {
          bond_id?: string;
          payload?: Json;
          computed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "synastry_cache_bond_id_fkey";
            columns: ["bond_id"];
            isOneToOne: true;
            referencedRelation: "bonds";
            referencedColumns: ["id"];
          },
        ];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          body: string;
          mood: string | null;
          weather_snapshot: Json | null;
          dasha_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          body: string;
          mood?: string | null;
          weather_snapshot?: Json | null;
          dasha_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          body?: string;
          mood?: string | null;
          weather_snapshot?: Json | null;
          dasha_key?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      soul_portraits: {
        Row: {
          id: string;
          user_id: string;
          signatures: Json;
          prose: string;
          model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          signatures?: Json;
          prose?: string;
          model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          signatures?: Json;
          prose?: string;
          model?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "soul_portraits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_threads: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_threads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          role: ChatRole;
          content: string;
          grounded: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          role: ChatRole;
          content: string;
          grounded?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          role?: ChatRole;
          content?: string;
          grounded?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "chat_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_counters: {
        Row: {
          user_id: string;
          day: string;
          lens_count: number;
        };
        Insert: {
          user_id: string;
          day: string;
          lens_count?: number;
        };
        Update: {
          user_id?: string;
          day?: string;
          lens_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "usage_counters_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_events: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          store: PurchaseStore;
          status: PurchaseStatus;
          raw: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          store: PurchaseStore;
          status: PurchaseStatus;
          raw?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          store?: PurchaseStore;
          status?: PurchaseStatus;
          raw?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_prefs: {
        Row: {
          user_id: string;
          daily_sky: boolean;
          lens_digest: boolean;
          muhurta_alerts: boolean;
          push_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          daily_sky?: boolean;
          lens_digest?: boolean;
          muhurta_alerts?: boolean;
          push_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          daily_sky?: boolean;
          lens_digest?: boolean;
          muhurta_alerts?: boolean;
          push_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_prefs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_lens_usage: {
        Args: {
          p_day: string;
          p_limit: number;
        };
        Returns: number | null;
      };
    };
    Enums: {
      theme_preference: ThemePreference;
      chat_role: ChatRole;
      purchase_store: PurchaseStore;
      purchase_status: PurchaseStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type BirthProfile = Tables<"birth_profiles">;
export type Chart = Tables<"charts">;
export type Memory = Tables<"memories">;
export type Bond = Tables<"bonds">;
export type SynastryCache = Tables<"synastry_cache">;
export type JournalEntry = Tables<"journal_entries">;
export type SoulPortrait = Tables<"soul_portraits">;
export type ChatThread = Tables<"chat_threads">;
export type ChatMessage = Tables<"chat_messages">;
export type UsageCounter = Tables<"usage_counters">;
export type PurchaseEvent = Tables<"purchase_events">;
export type NotificationPrefs = Tables<"notification_prefs">;
