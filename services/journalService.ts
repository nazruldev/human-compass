import type { JournalEntry, JournalEntryInput } from "@/utils/supabase";
import { supabase } from "@/utils/supabase";

const TABLE = "journal_entries";

export type JournalStatus = "In Progress" | "Completed";

export interface JournalListItem {
  id: string;
  title: string;
  generateDate: string;
  status: JournalStatus;
}

export interface HistoricalJournalItem {
  id: string;
  title: string;
  generateDate: string;
  is_favorite: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en", { month: "long" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function toActiveItem(entry: JournalEntry): JournalListItem {
  const status: JournalStatus = entry.response?.trim()
    ? "Completed"
    : "In Progress";
  const title = entry.question || entry.hexagram_name || "Untitled";
  return {
    id: entry.id,
    title,
    generateDate: formatDate(entry.created_at),
    status,
  };
}

function toHistoricalItem(entry: JournalEntry): HistoricalJournalItem {
  const title = entry.question || entry.hexagram_name || "Untitled";
  return {
    id: entry.id,
    title,
    generateDate: formatDate(entry.created_at),
    is_favorite: !!entry.is_favorite,
  };
}

const DEFAULT_PAGE_SIZE = 20;

export interface JournalEntriesPage {
  entries: JournalEntry[];
  hasMore: boolean;
  nextPage: number;
}

export async function getJournalEntries(
  userId: string | undefined,
  opts?: { page?: number; limit?: number },
): Promise<JournalEntriesPage> {
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit;

  let query = supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching journal entries:", error);
    return { entries: [], hasMore: false, nextPage: 1 };
  }

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const entries = hasMore ? rows.slice(0, limit) : rows;

  return {
    entries,
    hasMore,
    nextPage: page + 1,
  };
}

export async function getActiveEntries(
  userId?: string,
): Promise<JournalListItem[]> {
  const { entries } = await getJournalEntries(userId, {
    page: 1,
    limit: 10,
  });
  return entries.map(toActiveItem);
}

export interface HistoricalEntriesPage {
  entries: HistoricalJournalItem[];
  hasMore: boolean;
  nextPage: number;
}

export async function getHistoricalEntries(
  userId: string | undefined,
  opts?: { page?: number; limit?: number },
): Promise<HistoricalEntriesPage> {
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit;

  let query = supabase
    .from(TABLE)
    .select("*")
    // .not("response", "is", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching historical entries:", error);
    return { entries: [], hasMore: false, nextPage: 1 };
  }

  const rows = data ?? [];

  const hasMore = rows.length > limit;
  const entries = (hasMore ? rows.slice(0, limit) : rows).map(toHistoricalItem);

  return {
    entries,
    hasMore,
    nextPage: page + 1,
  };
}

export async function getJournalEntry(
  id: string,
): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching journal entry:", error);
    throw error;
  }
  return data;
}

export async function createJournalEntry(
  userId: string,
  input: JournalEntryInput,
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }
  return data;
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<Pick<JournalEntry, "response" | "is_favorite">>,
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating journal entry:", error);
    throw error;
  }
  return data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
}

/** Deletes rows with a saved `response` (historical) for this user only. */
export async function deleteAllHistoricalEntries(
  userId: string,
): Promise<void> {
  if (!userId) {
    throw new Error("deleteAllHistoricalEntries requires userId");
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .not("response", "is", null)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting historical entries:", error);
    throw error;
  }
}
