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
      admin_activity_logs: {
        Row: {
          action_type: string
          admin_email: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action_type: string
          admin_email: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action_type?: string
          admin_email?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          created_at: string
          descripcion: string
          direccion: string
          estado: string
          id: string
          nombre: string
          telefono: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          descripcion: string
          direccion: string
          estado?: string
          id?: string
          nombre: string
          telefono: string
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          descripcion?: string
          direccion?: string
          estado?: string
          id?: string
          nombre?: string
          telefono?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          card_color: string | null
          colors: Json
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          images: Json | null
          price: number
          segments: Json
          sizes: Json
          stock_quantity: number
          title: string
          updated_at: string | null
        }
        Insert: {
          card_color?: string | null
          colors: Json
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          price: number
          segments?: Json
          sizes: Json
          stock_quantity?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          card_color?: string | null
          colors?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          price?: number
          segments?: Json
          sizes?: Json
          stock_quantity?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_info: {
        Row: {
          carousel_images: Json
          created_at: string | null
          design_description: string
          design_title: string
          facebook_link: string | null
          faq_items: Json | null
          faq_title: string
          id: string
          instagram_link: string | null
          materials_description: string
          materials_title: string
          products_description: string | null
          products_subtitle: string | null
          products_title: string | null
          service_description: string
          service_title: string
          slogan: string
          unique_style_title: string
          updated_at: string | null
          whatsapp_number: string
          about_us_title: string | null
          about_us_description: string | null
          about_us_stats: Json | null
          privacy_policy_title: string | null
          privacy_policy_content: string | null
          privacy_policy_last_updated: string | null
        }
        Insert: {
          carousel_images: Json
          created_at?: string | null
          design_description: string
          design_title: string
          facebook_link?: string | null
          faq_items?: Json | null
          faq_title: string
          id?: string
          instagram_link?: string | null
          materials_description: string
          materials_title: string
          products_description?: string | null
          products_subtitle?: string | null
          products_title?: string | null
          service_description: string
          service_title: string
          slogan: string
          unique_style_title: string
          updated_at?: string | null
          whatsapp_number: string
          about_us_title?: string | null
          about_us_description?: string | null
          about_us_stats?: Json | null
          privacy_policy_title?: string | null
          privacy_policy_content?: string | null
          privacy_policy_last_updated?: string | null
        }
        Update: {
          carousel_images?: Json
          created_at?: string | null
          design_description?: string
          design_title?: string
          facebook_link?: string | null
          faq_items?: Json | null
          faq_title?: string
          id?: string
          instagram_link?: string | null
          materials_description?: string
          materials_title?: string
          products_description?: string | null
          products_subtitle?: string | null
          products_title?: string | null
          service_description?: string
          service_title?: string
          slogan?: string
          unique_style_title?: string
          updated_at?: string | null
          whatsapp_number?: string
          about_us_title?: string | null
          about_us_description?: string | null
          about_us_stats?: Json | null
          privacy_policy_title?: string | null
          privacy_policy_content?: string | null
          privacy_policy_last_updated?: string | null
        }
        Relationships: []
      }
      user_carts: {
        Row: {
          cart_data: Json
          created_at: string
          id: string
          updated_at: string
          user_email: string
        }
        Insert: {
          cart_data?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_email: string
        }
        Update: {
          cart_data?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
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
