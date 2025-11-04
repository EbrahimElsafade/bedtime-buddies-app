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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appearance_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          description_fr: string | null
          id: string
          name: string
          name_ar: string | null
          name_en: string | null
          name_fr: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name: string
          name_ar?: string | null
          name_en?: string | null
          name_fr?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          name_en?: string | null
          name_fr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      course_favorites: {
        Row: {
          course_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_favorites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          course_id: string
          created_at: string | null
          description: string
          description_ar: string | null
          description_en: string | null
          description_fr: string | null
          duration: number
          id: string
          is_free: boolean
          lesson_order: number
          thumbnail_path: string | null
          title: string
          title_ar: string | null
          title_en: string | null
          title_fr: string | null
          updated_at: string | null
          video_path: string | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description: string
          description_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          duration: number
          id?: string
          is_free?: boolean
          lesson_order?: number
          thumbnail_path?: string | null
          title: string
          title_ar?: string | null
          title_en?: string | null
          title_fr?: string | null
          updated_at?: string | null
          video_path?: string | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string
          description_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          duration?: number
          id?: string
          is_free?: boolean
          lesson_order?: number
          thumbnail_path?: string | null
          title?: string
          title_ar?: string | null
          title_en?: string | null
          title_fr?: string | null
          updated_at?: string | null
          video_path?: string | null
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
          description_ar: string | null
          description_en: string
          description_fr: string | null
          id: string
          instructor_avatar: string | null
          instructor_bio: string | null
          instructor_bio_ar: string | null
          instructor_bio_en: string | null
          instructor_bio_fr: string | null
          instructor_expertise: string[] | null
          instructor_name: string | null
          instructor_name_ar: string | null
          instructor_name_en: string | null
          instructor_name_fr: string | null
          instructor_user_id: string | null
          is_free: boolean
          is_published: boolean
          languages: string[]
          learning_objectives: string[] | null
          learning_objectives_ar: string[] | null
          learning_objectives_en: string[] | null
          learning_objectives_fr: string[] | null
          lessons: number | null
          max_age: number | null
          min_age: number | null
          title_ar: string | null
          title_en: string
          title_fr: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          cover_image?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en: string
          description_fr?: string | null
          id?: string
          instructor_avatar?: string | null
          instructor_bio?: string | null
          instructor_bio_ar?: string | null
          instructor_bio_en?: string | null
          instructor_bio_fr?: string | null
          instructor_expertise?: string[] | null
          instructor_name?: string | null
          instructor_name_ar?: string | null
          instructor_name_en?: string | null
          instructor_name_fr?: string | null
          instructor_user_id?: string | null
          is_free?: boolean
          is_published?: boolean
          languages?: string[]
          learning_objectives?: string[] | null
          learning_objectives_ar?: string[] | null
          learning_objectives_en?: string[] | null
          learning_objectives_fr?: string[] | null
          lessons?: number | null
          max_age?: number | null
          min_age?: number | null
          title_ar?: string | null
          title_en: string
          title_fr?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string
          description_fr?: string | null
          id?: string
          instructor_avatar?: string | null
          instructor_bio?: string | null
          instructor_bio_ar?: string | null
          instructor_bio_en?: string | null
          instructor_bio_fr?: string | null
          instructor_expertise?: string[] | null
          instructor_name?: string | null
          instructor_name_ar?: string | null
          instructor_name_en?: string | null
          instructor_name_fr?: string | null
          instructor_user_id?: string | null
          is_free?: boolean
          is_published?: boolean
          languages?: string[]
          learning_objectives?: string[] | null
          learning_objectives_ar?: string[] | null
          learning_objectives_en?: string[] | null
          learning_objectives_fr?: string[] | null
          lessons?: number | null
          max_age?: number | null
          min_age?: number | null
          title_ar?: string | null
          title_en?: string
          title_fr?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_user_id_fkey"
            columns: ["instructor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          child_name: string | null
          created_at: string
          id: string
          is_premium: boolean
          linked_accounts: string[] | null
          parent_name: string
          preferred_language: string
          profile_image: string | null
          skills: string[] | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          child_name?: string | null
          created_at?: string
          id: string
          is_premium?: boolean
          linked_accounts?: string[] | null
          parent_name: string
          preferred_language?: string
          profile_image?: string | null
          skills?: string[] | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          child_name?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean
          linked_accounts?: string[] | null
          parent_name?: string
          preferred_language?: string
          profile_image?: string | null
          skills?: string[] | null
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
          audio_mode: string | null
          category: string
          cover_image: string | null
          created_at: string | null
          description: Json
          duration: number
          id: string
          is_free: boolean
          is_published: boolean
          languages: string[]
          story_audio: string | null
          title: Json
          updated_at: string | null
        }
        Insert: {
          audio_mode?: string | null
          category: string
          cover_image?: string | null
          created_at?: string | null
          description?: Json
          duration: number
          id?: string
          is_free?: boolean
          is_published?: boolean
          languages?: string[]
          story_audio?: string | null
          title?: Json
          updated_at?: string | null
        }
        Update: {
          audio_mode?: string | null
          category?: string
          cover_image?: string | null
          created_at?: string | null
          description?: Json
          duration?: number
          id?: string
          is_free?: boolean
          is_published?: boolean
          languages?: string[]
          story_audio?: string | null
          title?: Json
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
          transcoding_error: string | null
          transcoding_progress: number | null
          updated_at: string
          video: string | null
          video_original: string | null
          video_status: string | null
          voices: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          order: number
          story_id: string
          texts?: Json
          transcoding_error?: string | null
          transcoding_progress?: number | null
          updated_at?: string
          video?: string | null
          video_original?: string | null
          video_status?: string | null
          voices?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          order?: number
          story_id?: string
          texts?: Json
          transcoding_error?: string | null
          transcoding_progress?: number | null
          updated_at?: string
          video?: string | null
          video_original?: string | null
          video_status?: string | null
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
      user_favorites: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_audit_log: {
        Row: {
          action: string
          id: string
          ip_address: string | null
          performed_at: string
          performed_by: string
          role: Database["public"]["Enums"]["app_role"]
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: string | null
          performed_at?: string
          performed_by: string
          role: Database["public"]["Enums"]["app_role"]
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: string | null
          performed_at?: string
          performed_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin:
        | { Args: { uid: string }; Returns: boolean }
        | { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "premium" | "editor"
      user_role: "user" | "admin"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "premium", "editor"],
      user_role: ["user", "admin"],
    },
  },
} as const
