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
      project_master: {
        Row: {
          id: string
          created_at: string
          app_name: string
          niche_vertical: string
          description: string | null
          target_audience: string
          brand_voice: 'Professional' | 'Funny' | 'Urgent' | 'Educational' | 'Minimalist'
          usp: string | null
          problem_solved: string | null
          keywords: string[] | null
          logo_url: string | null
          user_id: string
          safety_zones: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          app_name: string
          niche_vertical: string
          description?: string | null
          target_audience: string
          brand_voice: 'Professional' | 'Funny' | 'Urgent' | 'Educational' | 'Minimalist'
          usp?: string | null
          problem_solved?: string | null
          keywords?: string[] | null
          logo_url?: string | null
          user_id: string
          safety_zones?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          app_name?: string
          niche_vertical?: string
          description?: string | null
          target_audience?: string
          brand_voice?: 'Professional' | 'Funny' | 'Urgent' | 'Educational' | 'Minimalist'
          usp?: string | null
          problem_solved?: string | null
          keywords?: string[] | null
          logo_url?: string | null
          user_id?: string
          safety_zones?: Json | null
        }
      }
      content_strategy: {
        Row: {
          id: string
          created_at: string
          project_id: string
          pillar_topic: string
          pain_point: string
          buying_stage: 'Awareness' | 'Consideration' | 'Decision'
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          pillar_topic: string
          pain_point: string
          buying_stage: 'Awareness' | 'Consideration' | 'Decision'
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          pillar_topic?: string
          pain_point?: string
          buying_stage?: 'Awareness' | 'Consideration' | 'Decision'
          user_id?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
          objective: 'Educativo' | 'Venta Directa' | 'Autoridad_Miedo' | 'Redireccion'
          pillars: string[] | null
          cta: string
          visual_style: 'Fotografia_Realista' | 'Ilustracion_3D' | 'Minimalista' | 'Cinematic_8k'
          color_palette: string | null
          mood: string | null
          custom_copy_instructions: string | null
          custom_visual_instructions: string | null
          user_id: string
          topic: string | null
          target_orientation: string | null
          problem_solved: string | null
          strategic_objective: string | null
          duration_type: string | null
          differential: string | null
          target_url: string | null
          brand_voice: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          objective: 'Educativo' | 'Venta Directa' | 'Autoridad_Miedo' | 'Redireccion'
          pillars?: string[] | null
          cta: string
          visual_style: 'Fotografia_Realista' | 'Ilustracion_3D' | 'Minimalista' | 'Cinematic_8k'
          color_palette?: string | null
          mood?: string | null
          custom_copy_instructions?: string | null
          custom_visual_instructions?: string | null
          user_id: string
          topic?: string | null
          target_orientation?: string | null
          problem_solved?: string | null
          strategic_objective?: string | null
          duration_type?: string | null
          differential?: string | null
          target_url?: string | null
          brand_voice?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          objective?: 'Educativo' | 'Venta Directa' | 'Autoridad_Miedo' | 'Redireccion'
          pillars?: string[] | null
          cta?: string
          visual_style?: 'Fotografia_Realista' | 'Ilustracion_3D' | 'Minimalista' | 'Cinematic_8k'
          color_palette?: string | null
          mood?: string | null
          custom_copy_instructions?: string | null
          custom_visual_instructions?: string | null
          user_id?: string
          topic?: string | null
          target_orientation?: string | null
          problem_solved?: string | null
          strategic_objective?: string | null
          duration_type?: string | null
          differential?: string | null
          target_url?: string | null
          brand_voice?: string | null
        }
      }
      content_queue: {
        Row: {
          id: string
          created_at: string
          project_id: string
          campaign_id: string | null
          content_type: 'Post' | 'Reels' | 'Story' | 'Video' | 'Landscape' | 'Article' | 'Carrusel' | 'Reel_Script' | 'Blog_SEO' | 'Push_Notification'
          status: 'Draft' | 'AI_Generated' | 'Approved' | 'Published' | 'Review_Required'
          gemini_output: Json | null
          image_ai_prompt: string | null
          image_url: string | null
          image_final_url: string | null
          overlay_text_content: string | null
          overlay_style_json: Json | null
          scheduled_at: string | null
          confidence_score: number | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          campaign_id?: string | null
          content_type: 'Post' | 'Reels' | 'Story' | 'Video' | 'Landscape' | 'Article' | 'Carrusel' | 'Reel_Script' | 'Blog_SEO' | 'Push_Notification'
          status?: 'Draft' | 'AI_Generated' | 'Approved' | 'Published' | 'Review_Required'
          gemini_output?: Json | null
          image_ai_prompt?: string | null
          image_url?: string | null
          image_final_url?: string | null
          overlay_text_content?: string | null
          overlay_style_json?: Json | null
          scheduled_at?: string | null
          confidence_score?: number | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          campaign_id?: string | null
          content_type?: 'Post' | 'Reels' | 'Story' | 'Video' | 'Landscape' | 'Article' | 'Reel_Script' | 'Blog_SEO' | 'Push_Notification'
          status?: 'Draft' | 'AI_Generated' | 'Approved' | 'Published' | 'Review_Required'
          gemini_output?: Json | null
          image_ai_prompt?: string | null
          image_url?: string | null
          image_final_url?: string | null
          overlay_text_content?: string | null
          overlay_style_json?: Json | null
          scheduled_at?: string | null
          confidence_score?: number | null
          user_id?: string
        }
      }
      social_connections: {
        Row: {
          id: string
          project_id: string
          user_id: string
          platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'tiktok'
          account_name: string | null
          platform_id: string | null
          encrypted_token: string
          token_expiry: string | null
          status: 'active' | 'expired' | 'error'
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'tiktok'
          account_name?: string | null
          platform_id?: string | null
          encrypted_token: string
          token_expiry?: string | null
          status?: 'active' | 'expired' | 'error'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          platform?: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'tiktok'
          account_name?: string | null
          platform_id?: string | null
          encrypted_token?: string
          token_expiry?: string | null
          status?: 'active' | 'expired' | 'error'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string
          account_type: 'Person' | 'Company'
          full_name: string | null
          avatar_url: string | null
          job_title: string | null
          interests: string | null
          company_name: string | null
          industry: string | null
          tax_id: string | null
          company_size: string | null
          total_tokens_used: number
          token_limit: number
        }
        Insert: {
          id: string
          updated_at?: string
          account_type: 'Person' | 'Company'
          full_name?: string | null
          avatar_url?: string | null
          job_title?: string | null
          interests?: string | null
          company_name?: string | null
          industry?: string | null
          tax_id?: string | null
          company_size?: string | null
          total_tokens_used?: number
          token_limit?: number
        }
        Update: {
          id?: string
          updated_at?: string
          account_type?: 'Person' | 'Company'
          full_name?: string | null
          avatar_url?: string | null
          job_title?: string | null
          interests?: string | null
          company_name?: string | null
          industry?: string | null
          tax_id?: string | null
          company_size?: string | null
          total_tokens_used?: number
          token_limit?: number
        }
      }
      premium_content_projects: {
        Row: {
          id: string
          created_at: string
          project_id: string
          user_id: string
          title: string
          type: 'ebook' | 'blog' | 'whitepaper'
          status: string
          metadata: Json | null
          design_config: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          user_id: string
          title: string
          type: 'ebook' | 'blog' | 'whitepaper'
          status?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          title?: string
          type?: 'ebook' | 'blog' | 'whitepaper'
          status?: string
          metadata?: Json | null
        }
      }
      content_chapters: {
        Row: {
          id: string
          created_at: string
          premium_project_id: string
          chapter_index: number
          title: string
          content_markdown: string | null
          content_html: string | null
          summary: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          premium_project_id: string
          chapter_index: number
          title: string
          content_markdown?: string | null
          content_html?: string | null
          summary?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          premium_project_id?: string
          chapter_index?: number
          title?: string
          content_markdown?: string | null
          content_html?: string | null
          summary?: string | null
          status?: string
        }
      }
    }
  }
}
