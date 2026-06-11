export interface Song {
  id: string;
  title: string;
  artist: string | null;
  original_key: string;
  tempo: number | null;
  time_signature: string | null;
  chordpro_content: string;
  language: string;
  tags: string[];
  notes: string | null;
  source_type: "manual" | "import_image" | "import_pdf" | "import_dropbox";
  original_file_url: string | null;
  status: "draft" | "published" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed" | "paused";
  source: "dropbox" | "upload";
  total_files: number;
  processed_files: number;
  failed_files: number;
  error_log: Array<{ file: string; error: string; timestamp: string }>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportItem {
  id: string;
  job_id: string;
  original_filename: string;
  file_type: string | null;
  storage_path: string | null;
  status: "pending" | "processing" | "completed" | "failed" | "skipped" | "review";
  gemini_raw_response: string | null;
  extracted_chordpro: string | null;
  song_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "member";
  avatar_url: string | null;
  notation_preference: "letter" | "solfege";
  font_size_preference: number;
  created_at: string;
  updated_at: string;
}

export interface Setlist {
  id: string;
  title: string;
  service_type: "domingo" | "miercoles" | "jovenes" | "oracion" | "especial" | "otro";
  service_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  song_count?: number;
}

export interface SetlistSong {
  id: string;
  setlist_id: string;
  song_id: string;
  position: number;
  transpose_key: string | null;
  capo: number;
  notes: string | null;
  created_at: string;
  song?: Pick<Song, "id" | "title" | "artist" | "original_key">;
}

export type EventType = "service" | "youth" | "prayer" | "special" | "community" | "conference";
export type EventStatus = "draft" | "approved" | "published";

export interface ChurchEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null; // fecha de fin para eventos multi-día (null = un solo día)
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: EventType;
  status: EventStatus;
  recurring: boolean;
  recurring_day: string | null; // "sunday", "wednesday", etc.
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DropboxToken {
  id: string;
  user_id: string;
  refresh_token: string;
  account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MigratedFile {
  id: string;
  dropbox_path: string;
  storage_path: string | null;
  file_type: string | null;
  file_size: number;
  dropbox_folder: string | null;
  status: "pending" | "downloading" | "downloaded" | "processed" | "error";
  error_message: string | null;
  created_at: string;
}
