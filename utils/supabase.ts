import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createClerkSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
// Database Types
export interface JournalEntry {
  id: string;
  user_id: string;
  question: string;
  hexagram_number: number;
  hexagram_name: string;
  answer_type: string;
  description: string | null;
  response: string | null;
  drawing_style: "random" | "browse" | null;
  session_id: string | null;
  season: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryInput {
  question: string;
  hexagram_number: number;
  hexagram_name: string;
  answer_type: string;
  description?: string | null;
  response?: string | null;
  drawing_style?: "random" | "browse" | null;
  session_id?: string | null;
  season?: string | null;
}

export interface UserProfile {
  id: string;
  user_id: string;
  birth_date: string;
  birth_time?: string;
  birth_place?: string;
  birth_timezone?: string;
  gender?: string;
  animal_sign: string;
  polarity: string;
  element: string;
  profile_image_url?: string;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Hexagram {
  id: string;
  number: number;
  name: string;
  chinese_name: string;
  archetype: string;
  description: string;
  affirmation: string;
  movement_guidance: string;
  asker_archetype: string;
  mythic_metaphor: string;
  created_at: string;
  updated_at: string;
}

export type HexagramWithImage = Hexagram & {
  imageUrl: { uri: string } | number;
  imageUrlBack?: { uri: string } | number;
};

export interface Card {
  id: string;
  card_id: number;
  name: string;
  front_image: string;
  back_image: string;
  category: "hexagram" | "trigram" | "special";
  hexagram_number?: number;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string | null;
  title: string;
  event_date: string;
  event_type: "insight" | "custom";
  color: "positive" | "caution" | "neutral";
  guidance_data: {
    recommended_actions?: string[];
    actions_to_avoid?: string[];
    recommended_attitude?: string;
    likely_outcomes?: string;
  };
  is_recurring: boolean;
  recurrence_pattern: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
