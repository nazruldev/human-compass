import { env } from "@/config/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Re-evaluate after manifest / env is available (not frozen at first module load). */
export function isSupabaseConfigured(): boolean {
  const url = env.supabase.url.trim();
  const key = env.supabase.anonKey.trim();
  return Boolean(url && key);
}

/**
 * Supabase JS throws if the URL is empty. When keys are missing, use inert
 * placeholders so the app can boot; guarded services avoid calling the network.
 */
const PLACEHOLDER_URL =
  "https://00000000-0000-0000-0000-000000000000.supabase.co";
const PLACEHOLDER_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuc2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDEwMDAwMDAsImV4cCI6MTk1NjU3NjAwMH0.placeholder";

let warnedMissingCredentials = false;

function resolveSupabaseCredentials(): { url: string; anonKey: string } {
  const supabaseUrlRaw = env.supabase.url.trim();
  const supabaseAnonKeyRaw = env.supabase.anonKey.trim();
  const configured = Boolean(supabaseUrlRaw && supabaseAnonKeyRaw);

  if (__DEV__ && !configured && !warnedMissingCredentials) {
    warnedMissingCredentials = true;
    console.warn(
      "[supabase] Missing URL or anon key. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env (loaded into expo.extra as EXPO_PUBLIC_*). See .env.example.",
    );
  }

  return {
    url: configured ? supabaseUrlRaw : PLACEHOLDER_URL,
    anonKey: configured ? supabaseAnonKeyRaw : PLACEHOLDER_ANON_KEY,
  };
}

let supabaseSingleton: SupabaseClient | null = null;
let supabaseSingletonSig = "";

function getSupabaseSingleton(): SupabaseClient {
  const { url, anonKey } = resolveSupabaseCredentials();
  const sig = `${url}\0${anonKey}`;
  if (!supabaseSingleton || supabaseSingletonSig !== sig) {
    supabaseSingleton = createClient(url, anonKey);
    supabaseSingletonSig = sig;
  }
  return supabaseSingleton;
}

/** Lazily created; recreates if URL/key change after manifest/env is ready. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseSingleton();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

export function createClerkSupabaseClient(token: string): SupabaseClient {
  const { url, anonKey } = resolveSupabaseCredentials();
  return createClient(url, anonKey, {
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
