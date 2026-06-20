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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      life_area_stations: {
        Row: {
          created_at: string
          display_order: number
          id: string
          life_area_id: string
          station_name_ja: string
          station_name_ko: string | null
          station_name_normalized: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          life_area_id: string
          station_name_ja: string
          station_name_ko?: string | null
          station_name_normalized?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          life_area_id?: string
          station_name_ja?: string
          station_name_ko?: string | null
          station_name_normalized?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "life_area_stations_life_area_id_fkey"
            columns: ["life_area_id"]
            isOneToOne: false
            referencedRelation: "life_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "life_area_stations_life_area_id_fkey"
            columns: ["life_area_id"]
            isOneToOne: false
            referencedRelation: "recommended_listings"
            referencedColumns: ["life_area_id"]
          },
        ]
      }
      life_area_types: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          emoji: string | null
          name_ko: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          emoji?: string | null
          name_ko: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          emoji?: string | null
          name_ko?: string
          slug?: string
        }
        Relationships: []
      }
      life_areas: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          name_ja: string | null
          name_ko: string
          type_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name_ja?: string | null
          name_ko: string
          type_slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name_ja?: string | null
          name_ko?: string
          type_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_areas_type_slug_fkey"
            columns: ["type_slug"]
            isOneToOne: false
            referencedRelation: "life_area_types"
            referencedColumns: ["slug"]
          },
        ]
      }
      listings: {
        Row: {
          address: string | null
          contract_status: string
          created_at: string
          image_url: string | null
          maintenance_fee_yen: number | null
          move_in: string | null
          property_url: string
          raw_status: string | null
          rent_yen: number | null
          room_type: string | null
          size_sqm: number | null
          station_line: string | null
          station_name: string | null
          station_name_normalized: string | null
          thema: number | null
          title: string | null
          uid: number
          updated_at: string
          walk_minutes: number | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          contract_status?: string
          created_at?: string
          image_url?: string | null
          maintenance_fee_yen?: number | null
          move_in?: string | null
          property_url: string
          raw_status?: string | null
          rent_yen?: number | null
          room_type?: string | null
          size_sqm?: number | null
          station_line?: string | null
          station_name?: string | null
          station_name_normalized?: string | null
          thema?: number | null
          title?: string | null
          uid: number
          updated_at?: string
          walk_minutes?: number | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          contract_status?: string
          created_at?: string
          image_url?: string | null
          maintenance_fee_yen?: number | null
          move_in?: string | null
          property_url?: string
          raw_status?: string | null
          rent_yen?: number | null
          room_type?: string | null
          size_sqm?: number | null
          station_line?: string | null
          station_name?: string | null
          station_name_normalized?: string | null
          thema?: number | null
          title?: string | null
          uid?: number
          updated_at?: string
          walk_minutes?: number | null
          year_built?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      recommended_listings: {
        Row: {
          address: string | null
          contract_status: string | null
          created_at: string | null
          image_url: string | null
          life_area_id: string | null
          life_area_name: string | null
          maintenance_fee_yen: number | null
          move_in: string | null
          property_url: string | null
          raw_status: string | null
          rent_yen: number | null
          room_type: string | null
          size_sqm: number | null
          station_line: string | null
          station_name: string | null
          station_name_ja: string | null
          station_name_ko: string | null
          station_name_normalized: string | null
          thema: number | null
          title: string | null
          type_slug: string | null
          uid: number | null
          updated_at: string | null
          walk_minutes: number | null
          year_built: number | null
        }
        Relationships: [
          {
            foreignKeyName: "life_areas_type_slug_fkey"
            columns: ["type_slug"]
            isOneToOne: false
            referencedRelation: "life_area_types"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Functions: {
      normalize_station_name: { Args: { s: string }; Returns: string }
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
