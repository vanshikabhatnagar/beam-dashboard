export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  team: string;
  council: string;
  created_at: string;
  is_active: string;
}

export interface Transcript {
  transcript_id: string;
  recorded_at: string;
  transcript_type: string;
  duration_seconds: string;
  word_count: string;
  topic: string;
  language: string;
  has_pii_redacted: string;
}

export interface Summary {
  summary_id: string;
  transcript_id: string;
  template_id: string;
  user_id: string;
  status: string;
  created_at: string;
  processing_time_ms: string;
  output_word_count: string;
  ai_model: string;
  model_temperature: string;
}

export interface Feedback {
  feedback_id: string;
  summary_id: string;
  user_id: string;
  rating: string;
  comment: string;
  created_at: string;
}

export interface PromptTemplate {
  template_id: string;
  name: string;
  category: string;
  description: string;
  ai_model: string;
  version: string;
  created_at: string;
  is_active: string;
}

export interface EnrichedSummary {
  summary_id: string;
  user_id: string;
  status: string;
  created_at: string;
  ai_model: string;
  processing_time_ms: number;
  council: string;
  role: string;
  team: string;
  topic: string;
  duration_seconds: number;
  recorded_at: string;
  transcript_type: string;
  template_name: string;
  template_id: string;
  rating: number | null;
  comment: string | null;
}

export interface AppData {
  enriched: EnrichedSummary[];
  users: User[];
  templates: PromptTemplate[];
}
