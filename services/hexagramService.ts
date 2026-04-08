import { HEXAGRAMS } from "@/utils/hexagrams";
import { supabase } from "@/utils/supabase";

/* ----------------------------- Supabase ----------------------------- */

function withImageUrls(row: any) {
  const num = row.number ?? row.id ?? 1;
  const front = getImageUrl(num, false);
  const back = getImageUrl(num, true);
  return {
    ...row,
    imageUrl: typeof front === "string" ? { uri: front } : front,
    imageUrlBack: typeof back === "string" ? { uri: back } : back,
  };
}

export async function getHexagrams() {
  const { data, error } = await supabase
    .from("hexagrams")
    .select("*")
    .order("number");

  if (error) {
    console.error("Error fetching hexagrams:", error);
    throw error;
  }

  const dbRows = (data ?? []).map(withImageUrls);
  const byNumber = new Map(dbRows.map((r: any) => [r.number ?? r.id, r]));

  return Array.from({ length: 64 }, (_, i) => {
    const num = i + 1;
    const fromDb = byNumber.get(num);
    if (fromDb) return fromDb;
    const staticH = HEXAGRAMS.find((h) => h.id === num) ?? HEXAGRAMS[0];
    return withImageUrls({
      id: `static-${num}`,
      number: num,
      name: staticH.name,
      chinese_name: "",
      archetype: "",
      description: "",
      affirmation: "",
      movement_guidance: "",
      asker_archetype: "",
      mythic_metaphor: "",
      created_at: "",
      updated_at: "",
    });
  });
}

export async function getHexagramByNumber(number: number) {
  const safeNumber = Math.min(64, Math.max(1, Math.floor(number || 1)));

  const { data, error } = await supabase
    .from("hexagrams")
    .select("*")
    .eq("number", safeNumber)
    .maybeSingle();

  if (error) {
    console.error("Error fetching hexagram by number:", error);
    throw error;
  }

  if (data) return withImageUrls(data);

  const staticH = HEXAGRAMS.find((h) => h.id === safeNumber) ?? HEXAGRAMS[0];
  return withImageUrls({
    id: `static-${safeNumber}`,
    number: safeNumber,
    name: staticH.name,
    chinese_name: "",
    archetype: "",
    description: "",
    affirmation: "",
    movement_guidance: "",
    asker_archetype: "",
    mythic_metaphor: "",
    created_at: "",
    updated_at: "",
  });
}

/* ----------------------------- Image Config ----------------------------- */

const IMAGE_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_S3_BUCKET_URL ?? "",
  IMAGE_EXTENSION: ".png",
} as const;

export { IMAGE_CONFIG };

/* ----------------------------- Image URLs ----------------------------- */

/** Generate image URL or local source for card (1-64). */
export function getImageUrl(
  cardNumber: number,
  isBack = false,
): string | number {
  const suffix = isBack ? "B" : "";
  return `${IMAGE_CONFIG.BASE_URL}${cardNumber}${suffix}${IMAGE_CONFIG.IMAGE_EXTENSION}`;
}

/** Front image: 1.png, 2.png, ..., 64.png */
export function getFrontImageUrl(cardNumber: number): string | number {
  return getImageUrl(cardNumber, false);
}

/** Back image: 1B.png, 2B.png, ..., 64B.png */
export function getBackImageUrl(cardNumber: number): string | number {
  return getImageUrl(cardNumber, true);
}

/** Fallback image URL */
export function getFallbackImageUrl(): string | number {
  return `${IMAGE_CONFIG.BASE_URL}1${IMAGE_CONFIG.IMAGE_EXTENSION}`;
}
