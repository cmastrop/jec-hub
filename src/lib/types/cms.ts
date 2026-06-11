// Tipos para el CMS (Fase 3) — complementa src/lib/types/database.ts

export type Role = "pastor" | "admin" | "lider_ministerio" | "member";

export type MinistryMemberRole = "lider" | "colaborador" | "miembro";

export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "gallery"
  | "verse"
  | "cta"
  | "video"
  | "features"
  | "leader";

export type PublishStatus = "draft" | "published";

export interface Ministry {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  leader_name: string | null;
  leader_user_id: string | null;
  image_url: string | null;
  description_en: string | null;
  description_es: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MinistryMember {
  id: string;
  ministry_id: string;
  user_id: string;
  role: MinistryMemberRole;
  created_at: string;
  ministry?: Pick<Ministry, "id" | "slug" | "name_en" | "name_es">;
}

export interface PageBlock {
  id: string;
  page_slug: string;
  ministry_id: string | null;
  block_type: BlockType;
  position: number;
  content_en: Record<string, unknown>;
  content_es: Record<string, unknown>;
  status: PublishStatus;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageMedia {
  id: string;
  storage_path: string;
  alt_text: string | null;
  uploaded_by: string | null;
  ministry_id: string | null;
  created_at: string;
}

export interface Sermon {
  id: string;
  slug: string;
  title: string;
  speaker: string | null;
  sermon_date: string | null;
  youtube_id: string | null;
  spotify_id: string | null;
  series: string | null;
  duration: string | null;
  image_url: string | null;
  blog_content: string | null;
  excerpt: string | null;
  status: PublishStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Podcast {
  id: string;
  title: string;
  spotify_episode_id: string | null;
  description: string | null;
  published_date: string | null;
  image_url: string | null;
  status: PublishStatus;
  created_at: string;
}
