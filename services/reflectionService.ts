import { isSupabaseConfigured, supabase } from "@/utils/supabase";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export interface HexagramYesNoRow {
  id: string;
  hexagram_number: number;
  hexagram_name: string;
  season: Season | string;
  answer_type: string;
  description: string;
  response: string | null;
  created_at: string;
  updated_at: string;
}

export function getCurrentSeason(date = new Date()): Season {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Autumn";
  return "Winter";
}

export async function getHexagramYesNo(opts: {
  hexagramNumber: number;
  season?: Season;
}): Promise<HexagramYesNoRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const season = opts.season ?? getCurrentSeason();
  const { data, error } = await supabase
    .from("hexagram_yesno")
    .select("*")
    .eq("hexagram_number", opts.hexagramNumber)
    .eq("season", season)
    .maybeSingle();

  if (error) throw error;
  return (data as HexagramYesNoRow | null) ?? null;
}
