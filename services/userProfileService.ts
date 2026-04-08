import { isSupabaseConfigured, supabase } from "@/utils/supabase";

type ReflectionLimitResult = {
  remaining: number;
};

/**
 * Decrease reflection_limit by 1 for a user profile (only when current limit > 0).
 * Throws when profile is missing or limit has been exhausted.
 */
export async function consumeReflectionLimit(
  userId: string,
): Promise<ReflectionLimitResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.",
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, reflection_limit")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) {
    throw new Error("Profile not found.");
  }

  const currentLimit = Number(profile.reflection_limit ?? 0);
  if (!Number.isFinite(currentLimit) || currentLimit <= 0) {
    throw new Error("Reflection limit reached.");
  }

  const nextLimit = currentLimit - 1;
  const { data: updated, error: updateError } = await supabase
    .from("user_profiles")
    .update({ reflection_limit: nextLimit })
    .eq("id", profile.id)
    .eq("reflection_limit", currentLimit)
    .select("reflection_limit")
    .single();

  if (updateError) throw updateError;

  return { remaining: Number(updated.reflection_limit ?? 0) };
}

