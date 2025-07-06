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
      course_lessons: {
        Row: {
          course_id: string
          created_at: string | null
          description: string
          duration: number
          id: string
          lesson_order: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description: string
          duration: number
          id?: string
          lesson_order: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string
          duration?: number
          id?: string
          lesson_order?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string | null
          description: string
          id: string
          is_free: boolean
          is_published: boolean
          languages: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          cover_image?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_free?: boolean
          is_published?: boolean
          languages?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_free?: boolean
          is_published?: boolean
          languages?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          child_name: string | null
          created_at: string
          id: string
          is_premium: boolean
          parent_name: string
          preferred_language: string
          role: Database["public"]["Enums"]["user_role"]
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          child_name?: string | null
          created_at?: string
          id: string
          is_premium?: boolean
          parent_name: string
          preferred_language?: string
          role?: Database["public"]["Enums"]["user_role"]
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          child_name?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean
          parent_name?: string
          preferred_language?: string
          role?: Database["public"]["Enums"]["user_role"]
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scene_translations: {
        Row: {
          audio_url: string | null
          created_at: string | null
          id: string
          language: string
          scene_id: string
          text: string
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          language: string
          scene_id: string
          text: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          language?: string
          scene_id?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scene_translations_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "story_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string | null
          description: string
          duration: number
          id: string
          is_free: boolean
          is_published: boolean
          languages: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          cover_image?: string | null
          created_at?: string | null
          description: string
          duration: number
          id?: string
          is_free?: boolean
          is_published?: boolean
          languages?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string | null
          description?: string
          duration?: number
          id?: string
          is_free?: boolean
          is_published?: boolean
          languages?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      story_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      story_languages: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      story_scenes: {
        Row: {
          created_at: string | null
          id: string
          image: string | null
          scene_order: number
          story_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image?: string | null
          scene_order: number
          story_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image?: string | null
          scene_order?: number
          story_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_scenes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_sections: {
        Row: {
          created_at: string
          id: string
          image: string | null
          order: number
          story_id: string
          texts: Json
          updated_at: string
          voices: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          order: number
          story_id: string
          texts?: Json
          updated_at?: string
          voices?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          order?: number
          story_id?: string
          texts?: Json
          updated_at?: string
          voices?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_story_sections_story_id"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never> | { uid: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin"
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
    Enums: {
      user_role: ["user", "admin"],
    },
  },
} as const
